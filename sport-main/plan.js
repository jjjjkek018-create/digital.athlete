document.addEventListener('DOMContentLoaded', () => {
    // ---------- 1. CHECK FOR SAVED DATA ----------
    const savedData = localStorage.getItem('athleteStats');
    if (!savedData) {
        document.body.innerHTML = `
            <div style="text-align:center; padding:100px; font-family:sans-serif;">
                <h2>❌ Дані не знайдені</h2>
                <p>Поверніться на сторінку <a href="science.html">Біохімії</a> та заповніть форму.</p>
            </div>
        `;
        return;
    }

    const stats = JSON.parse(savedData);
    
    // ---------- 2. CALCULATE MACROS ----------
    let targetCals = stats.tdee;
    if (stats.goal === 'cut') targetCals -= 400;
    if (stats.goal === 'bulk') targetCals += 300;

    const proteinGrams = Math.round(stats.lbm * 2.2);
    const fatGrams = Math.round((targetCals * 0.25) / 9);
    const carbGrams = Math.round((targetCals - (proteinGrams * 4) - (fatGrams * 9)) / 4);

    // Update UI
    document.getElementById('target-cals').innerText = Math.round(targetCals) + ' kcal';
    document.getElementById('macro-p').innerText = proteinGrams + 'г';
    document.getElementById('macro-f').innerText = fatGrams + 'г';
    document.getElementById('macro-c').innerText = carbGrams + 'г';

    // ---------- 3. MEAL DATABASE ----------
    const mealDatabase = {
        breakfast: [
            { title: "Омлет з авокадо та шпинатом", desc: "3 яйця, 50г авокадо, жменя шпинату." },
            { title: "Вівсянка з сироватковим протеїном", desc: "60г вівса, 30г протеїну, ягоди." },
            { title: "Яєчня з беконом та помідорами", desc: "3 яйця, 2 скибки бекону, помідори чері." },
            { title: "Сирники зі сметаною", desc: "200г кисломолочного сиру 5%, 1 яйце, 30г борошна, сметана." },
            { title: "Тости з лососем та крем-сиром", desc: "Цільнозерновий хліб, слабосолений лосось, сир." }
        ],
        lunch: [
            { title: "Філе індички з кіноа", desc: "150г індички, 80г кіноа, овочі гриль." },
            { title: "Лосось з бататом на грилі", desc: "150г лосося, 150г батату, спаржа." },
            { title: "Куряча грудка з булгуром", desc: "150г курки, 80г булгуру, тушковані овочі." },
            { title: "Яловичий стейк з картопляним пюре", desc: "120г яловичини, 150г картоплі, горошок." },
            { title: "Тунець з пастою", desc: "Банка тунця, 80г пасти, песто." },
            { title: "Сочевичний суп", desc: "150г сочевиці, овочі, спеції." }
        ],
        dinner: [
            { title: "Біла риба з броколі", desc: "150г тріски/хеку, 150г броколі на пару." },
            { title: "Кисломолочний сир з мигдалем", desc: "200г кисломолочного сиру 5%, 20г мигдалю, кориця." },
            { title: "Омлет з овочами", desc: "3 яйця, болгарський перець, помідори." },
            { title: "Курячі котлети на пару з цвітною капустою", desc: "120г фаршу, 150г цвітної капусти." }
        ]
    };

    // ---------- 4. SLUG MAP (exact filenames) ----------
    const slugMap = {
        "Омлет з авокадо та шпинатом": "omlet-z-avokado-ta-shpinatom",
        "Вівсянка з сироватковим протеїном": "vivsyanka-z-sirovatkovim-proteyinim",
        "Яєчня з беконом та помідорами": "yayechnya-z-bekonom-ta-pomidorami",
        "Сирники зі сметаною": "sirniki-zi-smetanoyu",
        "Тости з лососем та крем-сиром": "tosti-z-lososem-ta-krem-sirom",
        "Філе індички з кіноа": "file-indichki-z-kinoa",
        "Лосось з бататом на грилі": "losos-z-batatom-na-grili",
        "Куряча грудка з булгуром": "kuryacha-grudka-z-bulgurom",
        "Яловичий стейк з картопляним пюре": "yalovichiy-steyk-z-kartoplyanim-pyure",
        "Тунець з пастою": "tunets-z-pastoyu",
        "Сочевичний суп": "sochevichniy-sup",
        "Біла риба з броколі": "bila-riba-z-brokoli",
        "Кисломолочний сир з мигдалем": "kislomolochniy-sir-z-migdalem",
        "Омлет з овочами": "omlet-z-ovochami",
        "Курячі котлети на пару з цвітною капустою": "kuryachi-kotleti-na-paru-z-cvitnoyu-kapustoyu"
    };

    function slugify(title) {
        const trimmed = title.trim();
        if (slugMap[trimmed]) {
            return slugMap[trimmed];
        } else {
            console.warn('⚠️ Slug not found for:', trimmed);
            // Fallback
            return trimmed.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        }
    }

    // ---------- 5. WORKOUT DATABASE (simplified) ----------
    const workoutDatabase = {
        strength: {
            beginner: {
                '3': { name: "Starting Strength", desc: "Присідання, жим, тяга 3 рази на тиждень." },
                '4': { name: "StrongLifts 5x5", desc: "Базові вправи 5x5." },
            },
            intermediate: {
                '3': { name: "Texas Method", desc: "Volume/Recovery/Intensity." },
                '4': { name: "Madcow 5x5", desc: "Лінійна періодизація." },
                '5': { name: "5/3/1 BBB", desc: "Основна робота + об'єм." },
            },
            advanced: {
                '4': { name: "Westside Conjugate", desc: "ME/DE дні." },
                '5': { name: "Sheiko", desc: "Високий об'єм." },
                '6': { name: "Bulgarian", desc: "Щоденний максимум." }
            }
        },
        hypertrophy: {
            beginner: {
                '3': { name: "Full Body 3x", desc: "Все тіло тричі на тиждень." },
                '4': { name: "Upper/Lower", desc: "Верх/Низ спліт." },
            },
            intermediate: {
                '4': { name: "PHUL", desc: "Сила + гіпертрофія." },
                '5': { name: "PPL", desc: "Push/Pull/Legs." },
                '6': { name: "PPL x2", desc: "Двічі на тиждень кожна група." }
            },
            advanced: {
                '5': { name: "Arnold Split", desc: "Груди/спина, плечі/руки, ноги." },
                '6': { name: "Dorian Yates HIT", desc: "Високоінтенсивний тренінг." }
            }
        },
        endurance: {
            beginner: { '3': { name: "Couch to 5K", desc: "Біг/ходьба." }, '4': { name: "Біг + ОФП", desc: "3 бігові + 1 силове." } },
            intermediate: { '4': { name: "Half Marathon", desc: "Довгі/темпові." }, '5': { name: "Triathlon Base", desc: "Плавання, вело, біг." } },
            advanced: { '6': { name: "Ironman", desc: "Високооб'ємна підготовка." } }
        },
        athletic: {
            beginner: { '3': { name: "Bodyweight Basics", desc: "Власна вага." }, '4': { name: "Functional Intro", desc: "Медболи, гирі." } },
            intermediate: { '4': { name: "CrossFit Scaled", desc: "WOD з масштабуванням." }, '5': { name: "Tactical Athlete", desc: "Військова підготовка." } },
            advanced: { '5': { name: "Competitive CrossFit", desc: "Циклічне програмування." }, '6': { name: "Hybrid Athlete", desc: "Сила + витривалість." } }
        }
    };

    // ---------- 6. STATE & UI ----------
    let currentLevel = 'intermediate';
    let currentStyle = 'strength';
    let currentDays = '4';

    function getWorkoutProgram() {
        const styleData = workoutDatabase[currentStyle] || workoutDatabase.hypertrophy;
        const levelData = styleData[currentLevel] || styleData.intermediate;
        return levelData[currentDays] || levelData['4'] || { name: "Custom", desc: "Оберіть інші параметри." };
    }

    function renderWorkout() {
        const program = getWorkoutProgram();
        const goalMap = { strength: '💪 Сила', hypertrophy: '🏋️ Маса', endurance: '🏃 Витривалість', athletic: '⚡ Атлетизм' };
        const levelMap = { beginner: '🌱 Початківець', intermediate: '📈 Середній', advanced: '🔥 Просунутий' };
        
        const container = document.getElementById('workout-container');
        container.innerHTML = `
            <div style="display:flex; gap:5px; flex-wrap:wrap; margin-bottom:15px;">
                <span class="workout-tag">${goalMap[currentStyle]}</span>
                <span class="workout-tag" style="background:#666;">${levelMap[currentLevel]}</span>
                <span class="workout-tag" style="background:#888;">${currentDays} дн/тиж</span>
            </div>
            <h4 style="margin:0 0 10px 0;">${program.name}</h4>
            <p style="font-size:0.95rem; color:#555;">${program.desc}</p>
            <div class="workout-details">
                <strong>Рекомендації:</strong>
                <ul style="margin:10px 0 0 20px;">
                    <li>Розминка 10-15 хв</li>
                    <li>Заминка 5-10 хв</li>
                    <li>Прогресивне навантаження</li>
                </ul>
            </div>
        `;
    }

    function renderMeals() {
    const getRand = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const b = getRand(mealDatabase.breakfast);
    const l = getRand(mealDatabase.lunch);
    const d = getRand(mealDatabase.dinner);

    document.getElementById('menu-container').innerHTML = `
        <a href="recipes/${slugify(b.title)}.html" style="text-decoration: none; color: inherit; display: block;">
            <div class="meal-item">
                <span class="meal-phase">Сніданок</span>
                <h4>${b.title}</h4>
                <p style="font-size:0.9rem; color:#666;">${b.desc}</p>
            </div>
        </a>
        <a href="recipes/${slugify(l.title)}.html" style="text-decoration: none; color: inherit; display: block;">
            <div class="meal-item">
                <span class="meal-phase">Обід</span>
                <h4>${l.title}</h4>
                <p style="font-size:0.9rem; color:#666;">${l.desc}</p>
            </div>
        </a>
        <a href="recipes/${slugify(d.title)}.html" style="text-decoration: none; color: inherit; display: block;">
            <div class="meal-item">
                <span class="meal-phase">Вечеря</span>
                <h4>${d.title}</h4>
                <p style="font-size:0.9rem; color:#666;">${d.desc}</p>
            </div>
        </a>
    `;
}

    // ---------- 7. EVENT LISTENERS ----------
    document.querySelectorAll('#level-selector .pref-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            document.querySelectorAll('#level-selector .pref-tag').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentLevel = this.dataset.level;
            renderWorkout();
        });
    });

    document.querySelectorAll('#style-selector .pref-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            document.querySelectorAll('#style-selector .pref-tag').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentStyle = this.dataset.style;
            renderWorkout();
        });
    });

    document.querySelectorAll('#frequency-selector .pref-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            document.querySelectorAll('#frequency-selector .pref-tag').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentDays = this.dataset.days;
            renderWorkout();
        });
    });

    document.getElementById('reroll-meals-btn').addEventListener('click', renderMeals);
    document.getElementById('reroll-workout-btn').addEventListener('click', renderWorkout);

    // ---------- 8. INITIAL RENDER ----------
    renderMeals();
    renderWorkout();
});