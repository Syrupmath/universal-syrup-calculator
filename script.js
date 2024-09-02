document.getElementById('video-trigger').onclick = function(event) {
  event.preventDefault();
  var modal = document.getElementById('video-modal');
  var iframe = document.getElementById('youtube-video');
  iframe.src = "https://www.youtube.com/embed/glE4A1I0q9I?autoplay=1&mute=1"; // Added mute=1 to ensure autoplay
  modal.style.display = "block";
}

document.getElementsByClassName('close')[0].onclick = function() {
  var modal = document.getElementById('video-modal');
  var iframe = document.getElementById('youtube-video');
  iframe.src = ""; // Stop video when modal is closed
  modal.style.display = "none";
}

window.onclick = function(event) {
  var modal = document.getElementById('video-modal');
  if (event.target == modal) {
    var iframe = document.getElementById('youtube-video');
    iframe.src = ""; // Stop video when modal is closed
    modal.style.display = "none";
  }
}



document.addEventListener('DOMContentLoaded', () => {
    const weightInput = document.getElementById('weight');
    const unitInput = document.getElementById('unit');
    const brixInput = document.getElementById('brix');
    const weightError = document.getElementById('weightError');
    const brixError = document.getElementById('brixError');
    const results = document.getElementById('results');
    const instructions = document.getElementById('instructions');
    
    function convertToGrams(weight, unit) {
        switch (unit) {
            case 'grams':
                return weight;
            case 'ounces':
                return weight * 28.3495;
            case 'kilograms':
                return weight * 1000;
            case 'pounds':
                return weight * 453.592;
            default:
                return weight;
        }
    }

    function convertFromGrams(weightInGrams, unit) {
        switch (unit) {
            case 'grams':
                return weightInGrams;
            case 'ounces':
                return weightInGrams / 28.3495;
            case 'kilograms':
                return weightInGrams / 1000;
            case 'pounds':
                return weightInGrams / 453.592;
            default:
                return weightInGrams;
        }
    }

    function calculate() {
        const weight = parseFloat(weightInput.value);
        const unit = unitInput.value;
        const brix = parseFloat(brixInput.value);
        const brixDecimal = brix / 100;
        const targetBrix2to1 = 2/3;
        const targetBrix1to1 = 0.5;
        const brixTolerance = 0.005;
        let valid = true;

        weightError.textContent = '';
        brixError.textContent = '';

        if (isNaN(weight) || weight <= 0) {
            weightError.textContent = 'Please enter a valid weight.';
            valid = false;
        }
        if (isNaN(brix) || brix < 0 || brix > 100) {
            brixError.textContent = 'Please enter a valid Brix value (0-100).';
            valid = false;
        }

        if (!valid) {
            return;
        }

        const weightInGrams = convertToGrams(weight, unit);

        if (isNaN(weightInGrams) || isNaN(brixDecimal)) {
            document.getElementById('result').innerHTML = 'Please enter valid numbers for weight and Brix.';
        } else {
            // 1:1 Syrup Calculation
            let additionalSugar1to1 = 0;
            let additionalWater1to1 = 0;
            let sugar1to1Type = '';

            if (Math.abs(brixDecimal - targetBrix1to1) <= brixTolerance) {
                sugar1to1Type = 'perfect';
            } else if (brixDecimal < targetBrix1to1) {
                additionalSugar1to1 = (targetBrix1to1 * weightInGrams - brixDecimal * weightInGrams) / (1 - targetBrix1to1);
                additionalSugar1to1 = convertFromGrams(additionalSugar1to1, unit);
                sugar1to1Type = 'sugar';
            } else {
                additionalWater1to1 = (brixDecimal * weightInGrams - targetBrix1to1 * weightInGrams) / targetBrix1to1;
                additionalWater1to1 = convertFromGrams(additionalWater1to1, unit);
                sugar1to1Type = 'water';
            }

            document.getElementById('sugar1to1').innerHTML = sugar1to1Type === 'perfect' 
                ? 'Your liquid already has the correct Brix for a 1:1 syrup.' 
                : `<span style="font-size: smaller; color: black;">Add</span><br>` + 
                  (additionalSugar1to1 || additionalWater1to1).toFixed(2) + ' ' + unit + 
                  `<br><span style="font-size: smaller; color: black;">${sugar1to1Type}</span>`;
            document.getElementById('sugar1to1Type').textContent = '';

            // 2:1 Syrup Calculation
            let additionalSugar2to1 = 0;
            let additionalWater2to1 = 0;
            let sugar2to1Type = '';

            if (Math.abs(brixDecimal - targetBrix2to1) <= brixTolerance) {
                sugar2to1Type = 'perfect';
            } else if (brixDecimal < targetBrix2to1) {
                additionalSugar2to1 = (targetBrix2to1 * weightInGrams - brixDecimal * weightInGrams) / (1 - targetBrix2to1);
                additionalSugar2to1 = convertFromGrams(additionalSugar2to1, unit);
                sugar2to1Type = 'sugar';
            } else {
                additionalWater2to1 = (brixDecimal * weightInGrams - targetBrix2to1 * weightInGrams) / targetBrix2to1;
                additionalWater2to1 = convertFromGrams(additionalWater2to1, unit);
                sugar2to1Type = 'water';
            }

            document.getElementById('sugar2to1').innerHTML = sugar2to1Type === 'perfect' 
                ? 'Your liquid already has the correct Brix for a 2:1 syrup.' 
                : `<span style="font-size: smaller; color: black;">Add</span><br>` + 
                  (additionalSugar2to1 || additionalWater2to1).toFixed(2) + ' ' + unit + 
                  `<br><span style="font-size: smaller; color: black;">${sugar2to1Type}</span>`;
            document.getElementById('sugar2to1Type').textContent = '';

            // Show the results and instructions
            results.classList.remove('d-none');
            instructions.classList.remove('d-none');

            // Set the contextual instructions based on the type of addition needed
            let instructionText = '';
            if (sugar1to1Type === 'sugar' || sugar2to1Type === 'sugar') {
                instructionText = '<p id="instruction-1">Heat your liquid and the additional sugar over gentle heat on a stovetop or in a microwave, and stir just until the sugar is dissolved and everything is combined.</p>';
            } else if (sugar1to1Type === 'water' || sugar2to1Type === 'water') {
                instructionText = '<p id="instruction-1">Heat your liquid and the additional water over gentle heat on a stovetop or in a microwave, and stir just until everything is combined.</p>';
            } else {
                instructionText = 'Your liquid already has the correct Brix for the syrup.';
            }
            instructionText += '<p id="instruction-2">Allow the mixture to cool at room temperature, then portion into <a href="https://amzn.to/3XqhJVn" target="_blank" aria-label="Link to buy squeeze bottles, opens in a new window">squeeze bottles</a>, and clearly <a href="https://amzn.to/4g10rFD" target="_blank" aria-label="Link to buy food labels, opens in a new window">label and date</a> all bottles.</p>';
            instructionText += '<p id="instruction-3">Store 1:1 syrups in the refrigerator for up to 1 month and 2:1 syrups for up to 6 weeks. Check for signs of spoilage before use. When in doubt, always discard and make a new batch.</p>';
            instructions.innerHTML = `<p>${instructionText}</p>`;
        }
    }

    document.getElementById('calculateButton').addEventListener('click', calculate);

    weightInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            calculate();
        }
    });

    brixInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            calculate();
        }
    });
});
