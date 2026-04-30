// ── Video modal ──────────────────────────────────────────────

const videoTrigger = document.getElementById('video-trigger');
const videoModal   = document.getElementById('video-modal');
const modalClose   = document.getElementById('modal-close');
const youtubeVideo = document.getElementById('youtube-video');

function openModal() {
    youtubeVideo.src = 'https://www.youtube.com/embed/glE4A1I0q9I?autoplay=1&mute=1';
    videoModal.classList.add('open');
}

function closeModal() {
    youtubeVideo.src = '';
    videoModal.classList.remove('open');
}

videoTrigger.addEventListener('click', function (e) {
    e.preventDefault();
    openModal();
});

modalClose.addEventListener('click', closeModal);

videoModal.addEventListener('click', function (e) {
    if (e.target === videoModal) closeModal();
});

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && videoModal.classList.contains('open')) closeModal();
});


// ── Calculator ───────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    const weightInput  = document.getElementById('weight');
    const unitInput    = document.getElementById('unit');
    const brixInput    = document.getElementById('brix');
    const weightError  = document.getElementById('weightError');
    const brixError    = document.getElementById('brixError');
    const resultsEl    = document.getElementById('results');
    const instructions = document.getElementById('instructions');
    const result1to1   = document.getElementById('result-1to1');
    const result2to1   = document.getElementById('result-2to1');

    const TARGET_1TO1 = 0.5;
    const TARGET_2TO1 = 2 / 3;
    const TOLERANCE   = 0.005;

    function toGrams(value, unit) {
        switch (unit) {
            case 'ounces':    return value * 28.3495;
            case 'kilograms': return value * 1000;
            case 'pounds':    return value * 453.592;
            default:          return value; // grams
        }
    }

    function fromGrams(grams, unit) {
        switch (unit) {
            case 'ounces':    return grams / 28.3495;
            case 'kilograms': return grams / 1000;
            case 'pounds':    return grams / 453.592;
            default:          return grams; // grams
        }
    }

    function renderResultCard(el, { type, amount, unit }) {
        if (type === 'perfect') {
            el.innerHTML = '<p class="result-perfect">Already the right Brix.</p>';
            return;
        }
        const label = type === 'sugar' ? 'sugar' : 'water';
        el.innerHTML =
            '<span class="result-action">Add</span>' +
            '<span class="result-amount">' + amount.toFixed(1) + ' <small>' + unit + '</small></span>' +
            '<span class="result-ingredient">' + label + '</span>';
    }

    function buildInstructions(type1, type2) {
        const needsSugar = type1 === 'sugar' || type2 === 'sugar';
        const needsWater = type1 === 'water' || type2 === 'water';
        const bothPerfect = type1 === 'perfect' && type2 === 'perfect';

        let step1 = '';
        if (bothPerfect) {
            step1 = '<p>Your liquid is already at the correct Brix — no additions needed.</p>';
        } else if (needsSugar) {
            step1 = '<p>Heat your liquid and the additional sugar over gentle heat on a stovetop or in a microwave, stirring just until the sugar is dissolved.</p>';
        } else if (needsWater) {
            step1 = '<p>Combine your liquid and the additional water, heating gently if needed, and stir until fully combined.</p>';
        }

        const step2 = '<p>Allow the mixture to cool at room temperature, then portion into ' +
            '<a href="https://amzn.to/3XqhJVn" target="_blank">squeeze bottles</a> and clearly ' +
            '<a href="https://amzn.to/4g10rFD" target="_blank">label and date</a> each one.</p>';

        const step3 = '<p class="shelf-life">Store 1:1 syrups refrigerated for up to 1 month; 2:1 syrups for up to 6 weeks. Check for signs of spoilage before use — when in doubt, discard and start fresh.</p>';

        return step1 + step2 + step3;
    }

    function calculate() {
        const weight = parseFloat(weightInput.value);
        const unit   = unitInput.value;
        const brix   = parseFloat(brixInput.value);
        const brixD  = brix / 100;

        weightError.textContent = '';
        brixError.textContent   = '';

        let valid = true;

        if (isNaN(weight) || weight <= 0) {
            weightError.textContent = 'Please enter a valid weight.';
            valid = false;
        }
        if (isNaN(brix) || brix < 0 || brix > 100) {
            brixError.textContent = 'Please enter a valid Brix value (0–100).';
            valid = false;
        }

        if (!valid) return;

        const weightG = toGrams(weight, unit);

        // ── 1:1 ──
        let type1, amount1 = 0;
        if (Math.abs(brixD - TARGET_1TO1) <= TOLERANCE) {
            type1 = 'perfect';
        } else if (brixD < TARGET_1TO1) {
            type1   = 'sugar';
            amount1 = fromGrams((TARGET_1TO1 * weightG - brixD * weightG) / (1 - TARGET_1TO1), unit);
        } else {
            type1   = 'water';
            amount1 = fromGrams((brixD * weightG - TARGET_1TO1 * weightG) / TARGET_1TO1, unit);
        }

        // ── 2:1 ──
        let type2, amount2 = 0;
        if (Math.abs(brixD - TARGET_2TO1) <= TOLERANCE) {
            type2 = 'perfect';
        } else if (brixD < TARGET_2TO1) {
            type2   = 'sugar';
            amount2 = fromGrams((TARGET_2TO1 * weightG - brixD * weightG) / (1 - TARGET_2TO1), unit);
        } else {
            type2   = 'water';
            amount2 = fromGrams((brixD * weightG - TARGET_2TO1 * weightG) / TARGET_2TO1, unit);
        }

        renderResultCard(result1to1, { type: type1, amount: amount1, unit });
        renderResultCard(result2to1, { type: type2, amount: amount2, unit });

        instructions.innerHTML = buildInstructions(type1, type2);

        resultsEl.classList.add('visible');
        instructions.classList.add('visible');
    }

    document.getElementById('calculateButton').addEventListener('click', calculate);

    [weightInput, brixInput].forEach(function (input) {
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') calculate();
        });
    });
});
