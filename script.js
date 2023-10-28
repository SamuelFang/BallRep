// Create arrays to store sets of three numbers for Title 1 and Title 2
let dataTitle1 = [];
let dataTitle2 = [];

// Linear regression
function predictNextNumber(arr) {
  // Check if the array has at least two data points to perform linear regression
  if (arr.length < 2) {
    return arr[0]; // Not enough data for prediction
  }

  // Calculate the sum of X and Y values
  let sumX = 0;
  let sumY = 0;
  for (let i = 0; i < arr.length; i++) {
    sumX += i;
    sumY += arr[i];
  }

  // Calculate the sum of X*Y and X*X values
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < arr.length; i++) {
    sumXY += i * arr[i];
    sumXX += i * i;
  }

  // Calculate the slope (m) and intercept (b) of the linear regression equation
  const n = arr.length;
  const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const b = (sumY - m * sumX) / n;

  // Predict the next number (assuming it's the next number in the sequence)
  const nextX = arr.length;
  const nextY = m * nextX + b;

  return nextY;
}

// Line of best fit
function calculateLinearRegressionIntercept(xValues, yValues) {
  const n = xValues.length;
  const xSum = xValues.reduce((acc, x) => acc + x, 0);
  const ySum = yValues.reduce((acc, y) => acc + y, 0);
  const xMean = xSum / n;
  const yMean = ySum / n;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
    denominator += Math.pow(xValues[i] - xMean, 2);
  }
  
  if(denominator == 0){
	  return yMean;
  }
  
  const m = numerator / denominator;
  const b = yMean - m * xMean;

  return b;
}

// Finding previous success
function findPrevious(arr, targetX) {
	const result = [];
	
    for (let i = arr.length - 2; i >= 0; i--) {
        const thirdElement = arr[i][2];
        if (targetX > 1 && Math.abs(thirdElement - targetX) <= 0.5) {
            for (let j = i + 1; j < i + 3 && j < arr.length; j++) {
                if (Math.abs(arr[j][2]) <= 0.5) {
                    result.push(arr[i]);
					result.push(arr[j]);
                    return result;
                }
            }
        }
		if (targetX <= 1 && Math.abs(thirdElement - targetX) == 0) {
            for (let j = i + 1; j < i + 2 && j < arr.length; j++) {
                if (Math.abs(arr[j][2]) == 0) {
                    result.push(arr[i]);
					result.push(arr[j]);
                    return result;
                }
            }
        }
    }
	result.push(null);
    return result;
}



// Function to add data to the respective arrays and display it
const addData = (title) => {
    const startingBoardInput = document.getElementById(`starting-board-${title}`);
    const arrowTargetInput = document.getElementById(`arrow-target-${title}`);
    const boardsMissedInput = document.getElementById(`boards-missed-${title}`);

    const startingBoard = parseFloat(startingBoardInput.value);
    const arrowTarget = parseFloat(arrowTargetInput.value);
    const boardsMissed = parseFloat(boardsMissedInput.value);

    if (!isNaN(startingBoard) && !isNaN(arrowTarget) && !isNaN(boardsMissed)) {
        if (title === 'Title1') {
            dataTitle1.push([startingBoard, arrowTarget, boardsMissed]);
            displayData(dataTitle1, 'Title1');
            displaySuggestedShots(dataTitle1, startingBoard, arrowTarget, boardsMissed, 'Title1');
        } else if (title === 'Title2') {
            dataTitle2.push([startingBoard, arrowTarget, boardsMissed]);
            displayData(dataTitle2, 'Title2');
            displaySuggestedShots(dataTitle2, startingBoard, arrowTarget, boardsMissed, 'Title2');
        }
    } else {
        alert('Please enter valid numbers for all fields.');
    }
};

// Function to display the collected data for Title 1 and Title 2
const displayData = (data, title) => {
    const resultDiv = document.getElementById(`shot-list-${title}`);
    resultDiv.innerHTML = '';

    data.forEach((item, index) => {
        if (item[2] > 0) {
            resultDiv.innerHTML += `<p>Shot ${index + 1}: ${item[0]} -> ${item[1]}, high by ${item[2]} boards</p>`;
        } else if (item[2] < 0) {
            resultDiv.innerHTML += `<p>Shot ${index + 1}: ${item[0]} -> ${item[1]}, light by ${-item[2]} boards</p>`;
        } else {
            resultDiv.innerHTML += `<p>Shot ${index + 1}: ${item[0]} -> ${item[1]}, flush pocket</p>`;
        }
    });
};

// Function to display suggested shots for Title 1 and Title 2
function displaySuggestedShots(data, startingBoard, arrowTarget, boardsMissed, title) {
    const suggestedShotList = document.getElementById(`suggested-shot-list-${title}`);
    const suggestedShot2 = document.getElementById(`suggested-shot-2-${title}`);
    const suggestedShot3 = document.getElementById(`suggested-shot-3-${title}`);
	const suggestedShot4 = document.getElementById(`suggested-shot-4-${title}`);
	const suggestedShot5 = document.getElementById(`suggested-shot-5-${title}`);

    // Get the 5 most recent sets of three numbers from the data array
    const last5Sets = data.slice(-5);
	
	let startingBoards = [];
	let arrowTargets = [];

    // Calculate Suggested Shot 1 for each set of three numbers and display them
    suggestedShotList.innerHTML = '';
    for (let i = 0; i < last5Sets.length; i++) {
        const [startingBoard, arrowTarget, boardsMissed] = last5Sets[i];
        const suggestedStartingBoard = startingBoard + boardsMissed;
		startingBoards.push(suggestedStartingBoard);
        const suggestedArrowTarget = arrowTarget + boardsMissed / 2;
		arrowTargets.push(suggestedArrowTarget);
        suggestedShotList.innerHTML = `<p>Basic: ${suggestedStartingBoard.toFixed(1)} -> ${suggestedArrowTarget.toFixed(1)}</p>`;
    }

    // Calculate Suggested Shot 2 (weighted average of Suggested Shot 1 values)
    let totalWeightedA = 0;
    let totalWeightedB = 0;
    let totalWeight = 0;

    for (let i = 0; i < last5Sets.length; i++) {
        const [shotA, shotB, miss] = last5Sets[i].slice(0, 3);
        const weight = (i + 1) * 3; // Adjust the weight as needed
        totalWeightedA += (shotA + miss) * weight;
        totalWeightedB += (shotB + miss / 2) * weight;
        totalWeight += weight;
    }

    const avgA2 = totalWeightedA / totalWeight;
    const avgB2 = totalWeightedB / totalWeight;

    suggestedShot2.textContent = `Stable: ${avgA2.toFixed(1)} -> ${avgB2.toFixed(1)}`;
	
	suggestedShot3.textContent = `Transition: ${predictNextNumber(startingBoards).toFixed(1)} -> ${predictNextNumber(arrowTargets).toFixed(1)}`;
	
	const firstValues = last5Sets.map(arr => arr[0]);
	const secondValues = last5Sets.map(arr => arr[1]);
	const thirdValues = last5Sets.map(arr => arr[2]);

	suggestedShot4.textContent = `Customized: ${calculateLinearRegressionIntercept(thirdValues, firstValues).toFixed(1)} -> ${calculateLinearRegressionIntercept(thirdValues, secondValues).toFixed(1)}`;
	
	const results = findPrevious(data, thirdValues[thirdValues.length - 1]);
	console.log(results);
	if (results[0] == null){
		suggestedShot5.textContent = `Historic: No shots found`;
	}
	else{
		const move1 = results[1][0] - results[0][0];
		const move2 = results[1][1] - results[0][1];
		suggestedShot5.textContent = `Historic: ${(firstValues[firstValues.length - 1] + move1).toFixed(1)} -> ${(secondValues[secondValues.length - 1] + move2).toFixed(1)}`;
	}
}

// Event listeners
document.getElementById('submit-button-Title1').addEventListener('click', () => addData('Title1'));
document.getElementById('submit-button-Title2').addEventListener('click', () => addData('Title2'));

// Submit the form when the Enter key is pressed
document.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        const activeTitle = document.querySelector('.title-container.active').id;
        addData(activeTitle);
    }
});

document.getElementById('clear-button-Title1').addEventListener('click', () => {
	// Clear the data array
    dataTitle1 = [];
	
    // Clear the display
    const suggestedShotList = document.getElementById('shot-list-Title1');
    suggestedShotList.innerHTML = '';
});

document.getElementById('clear-button-Title2').addEventListener('click', () => {
	// Clear the data array
    dataTitle2 = [];
	
    // Clear the display
    const suggestedShotList = document.getElementById('shot-list-Title2');
    suggestedShotList.innerHTML = '';
});


// Function to handle incrementing the number in the specified text box
const incrementNumber = (textboxId) => {
    const textBox = document.getElementById(textboxId);
    const currentNumber = parseFloat(textBox.value);
    if (!isNaN(currentNumber)) {
        textBox.value = (currentNumber + 0.5).toFixed(1);
    }
};

// Function to handle decrementing the number in the specified text box
const decrementNumber = (textboxId) => {
    const textBox = document.getElementById(textboxId);
    const currentNumber = parseFloat(textBox.value);
    if (!isNaN(currentNumber)) {
        textBox.value = (currentNumber - 0.5).toFixed(1);
    }
}

// An array of button IDs
const buttonIds = [
    'Title1',
    'Title2',
    // Add more titles as needed
];

// Loop through the button IDs and attach event listeners for arrow buttons
buttonIds.forEach((title) => {
    // Increment and decrement buttons for starting board
    document.getElementById(`decrement-starting-board-${title}`).addEventListener('click', () => {
        incrementNumber(`starting-board-${title}`);
        updateBreakpoint();
    });
    document.getElementById(`increment-starting-board-${title}`).addEventListener('click', () => {
        decrementNumber(`starting-board-${title}`);
        updateBreakpoint();
    });

    // Increment and decrement buttons for arrow target
    document.getElementById(`decrement-arrow-target-${title}`).addEventListener('click', () => {
        incrementNumber(`arrow-target-${title}`);
        updateBreakpoint();
    });
    document.getElementById(`increment-arrow-target-${title}`).addEventListener('click', () => {
        decrementNumber(`arrow-target-${title}`);
        updateBreakpoint();
    });

    // Increment and decrement buttons for boards missed
    document.getElementById(`decrement-boards-missed-${title}`).addEventListener('click', () => {
        incrementNumber(`boards-missed-${title}`);
        updateBreakpoint();
    });
    document.getElementById(`increment-boards-missed-${title}`).addEventListener('click', () => {
        decrementNumber(`boards-missed-${title}`);
        updateBreakpoint();
    });
});

// Function to update the "Breakpoint" value
function updateBreakpoint() {
    const startingBoardInput1 = parseFloat(document.getElementById("starting-board-Title1").value) || 0;
    const arrowTargetInput1 = parseFloat(document.getElementById("arrow-target-Title1").value) || 0;
    const breakpointValue1 = (arrowTargetInput1 - startingBoardInput1) * (5.5 / 4.5) + arrowTargetInput1;
    document.getElementById("breakpoint-value-Title1").textContent = breakpointValue1.toFixed(1);
	const startingBoardInput2 = parseFloat(document.getElementById("starting-board-Title2").value) || 0;
    const arrowTargetInput2 = parseFloat(document.getElementById("arrow-target-Title2").value) || 0;
    const breakpointValue2 = (arrowTargetInput2 - startingBoardInput2) * (5.5 / 4.5) + arrowTargetInput2;
    document.getElementById("breakpoint-value-Title2").textContent = breakpointValue2.toFixed(1);
}

// Add an event listener to update "Breakpoint" on input change
const inputFields = document.querySelectorAll("input[type='text']");
inputFields.forEach((input) => {
    input.addEventListener("input", updateBreakpoint);
});

// Call updateBreakpoint initially
updateBreakpoint();
