document.addEventListener('DOMContentLoaded', () => {
    const inputs = {
        gender: document.getElementById('gender'),
        weight: document.getElementById('weight'),
        height: document.getElementById('height'),
        age: document.getElementById('age'),
        bf: document.getElementById('bf'),
        activity: document.getElementById('activity')
    };

    const outputs = {
        bf: document.getElementById('out-bf'),
        lbm: document.getElementById('out-lbm'),
        bmr: document.getElementById('out-bmr'),
        tdee: document.getElementById('out-tdee')
    };

    const tooltips = {
        bf: document.getElementById('tooltip-bf'),
        lbm: document.getElementById('tooltip-lbm')
    };

    const generateBtn = document.getElementById('generate-plan-btn');

    function updateTooltips() {
        const isMale = inputs.gender.value === 'male';
        if (inputs.weight.value > 0) {
            tooltips.bf.style.display = 'block';
            tooltips.lbm.style.display = 'block';
            tooltips.bf.innerHTML = isMale ? 
                "<strong>Норма жиру (Ч):</strong> 10-20% для фітнесу." : 
                "<strong>Норма жиру (Ж):</strong> 18-28% для фітнесу.";
            tooltips.lbm.innerHTML = "LBM — це ваша вага без урахування жиру.";
        }
    }

    function calculate() {
        const w = parseFloat(inputs.weight.value);
        const h = parseFloat(inputs.height.value);
        const a = parseFloat(inputs.age.value);
        const act = parseFloat(inputs.activity.value);
        let bf = parseFloat(inputs.bf.value);

        if (w > 10 && h > 50 && a > 10) {
            // Авторозрахунок жиру через BMI, якщо поле порожнє
            if (isNaN(bf) || bf <= 0) {
                const bmi = w / ((h/100) ** 2);
                bf = (1.20 * bmi) + (0.23 * a) - (10.8 * (inputs.gender.value === 'male' ? 1 : 0)) - 5.4;
                bf = Math.max(5, Math.min(50, bf)); 
            }

            // Формула Кетча-МакАрдла
            const lbm = w * (1 - (bf / 100));
            const bmr = 370 + (21.6 * lbm);
            const tdee = bmr * act;

            // Оновлення UI
            animateValue(outputs.bf, parseFloat(outputs.bf.innerText) || 0, bf, 600, '%');
            animateValue(outputs.lbm, parseFloat(outputs.lbm.innerText) || 0, lbm, 600, ' кг');
            animateValue(outputs.bmr, parseInt(outputs.bmr.innerText) || 0, bmr, 600, '');
            animateValue(outputs.tdee, parseInt(outputs.tdee.innerText) || 0, tdee, 600, ' ккал');

            // Збереження
            const stats = { 
                tdee, lbm, bf, 
                gender: inputs.gender.value,
                goal: bf > 22 ? 'cut' : (bf < 12 ? 'bulk' : 'recomp')
            };
            localStorage.setItem('athleteStats', JSON.stringify(stats));
            
            generateBtn.disabled = false;
            updateTooltips();
            if(window.updateNavVisibility) window.updateNavVisibility();
        } else {
            generateBtn.disabled = true;
        }
    }

    function animateValue(obj, start, end, duration, suffix) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const val = progress * (end - start) + start;
            obj.innerText = (end < 100 ? val.toFixed(1) : Math.round(val)) + suffix;
            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }

    Object.values(inputs).forEach(el => el.addEventListener('input', calculate));
    
    generateBtn.addEventListener('click', () => {
        window.location.href = 'plan.html';
    });
});