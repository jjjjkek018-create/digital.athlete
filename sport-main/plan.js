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

    document.getElementById('target-cals').innerText = Math.round(targetCals) + ' kcal';
    document.getElementById('macro-p').innerText = proteinGrams + 'г';
    document.getElementById('macro-f').innerText = fatGrams + 'г';
    document.getElementById('macro-c').innerText = carbGrams + 'г';

    // ---------- 3. MEAL DATABASE with full recipe details AND slugs ----------
    const mealDatabase = {
    breakfast: [
        { title: "Омлет з авокадо та шпинатом", slug: "omlet-z-avokado-ta-shpinatom", desc: "3 яйця, 50г авокадо, жменя шпинату.", calories: 420, protein: 28, fat: 30, carbs: 8, ingredients: ["3 яйця", "½ авокадо (50г)", "жменя шпинату", "1 ч.л. оливкової олії", "сіль, перець"], instructions: "Збийте яйця. Розігрійте сковороду з олією. Вилийте яйця, додайте шпинат. Готуйте 2-3 хв. Подавайте з авокадо." },
        { title: "Вівсянка з сироватковим протеїном", slug: "vivsyanka-z-sirovatkovim-proteyinim", desc: "60г вівса, 30г протеїну, ягоди.", calories: 380, protein: 32, fat: 8, carbs: 48, ingredients: ["60г вівсяних пластівців", "30г сироваткового протеїну", "250мл молока/води", "50г ягід", "10г мигдалю"], instructions: "Зваріть вівсянку на молоці/воді. Остудіть 1-2 хв. Додайте протеїн, перемішайте. Додайте ягоди та мигдаль." },
        { title: "Яєчня з беконом та помідорами", slug: "yayechnya-z-bekonom-ta-pomidorami", desc: "3 яйця, 2 скибки бекону, помідори чері.", calories: 460, protein: 26, fat: 36, carbs: 6, ingredients: ["3 яйця", "40г бекону", "80г помідорів чері", "1 ч.л. олії", "зелень"], instructions: "Обсмажте бекон до хрусткості. Додайте помідори на 1 хв. Вбийте яйця, готуйте 3-4 хв. Посипте зеленню." },
        { title: "Сирники зі сметаною", slug: "sirniki-zi-smetanoyu", desc: "200г сиру, 1 яйце, 30г борошна, сметана.", calories: 420, protein: 32, fat: 18, carbs: 30, ingredients: ["200г кисломолочного сиру 5%", "1 яйце", "30г борошна", "1 ст.л. цукру", "50г сметани"], instructions: "Змішайте сир, яйце, борошно, цукор. Сформуйте сирники. Смажте до золотавості. Подавайте зі сметаною." },
        { title: "Тости з лососем та крем-сиром", slug: "tosti-z-lososem-ta-krem-sirom", desc: "Цільнозерновий хліб, слабосолений лосось, сир.", calories: 410, protein: 22, fat: 20, carbs: 32, ingredients: ["2 скибки цільнозернового хліба", "60г лосося", "30г крем-сиру", "¼ авокадо", "кріп"], instructions: "Підсушіть хліб. Намажте крем-сир. Викладіть лосось та авокадо. Посипте кропом." }
    ],
    lunch: [
        { title: "Філе індички з кіноа", slug: "file-indichki-z-kinoa", desc: "150г індички, 80г кіноа, овочі гриль.", calories: 520, protein: 45, fat: 16, carbs: 48, ingredients: ["150г філе індички", "80г кіноа", "100г кабачка", "80г перцю", "2 ст.л. оливкової олії"], instructions: "Замаринуйте індичку. Зваріть кіноа. Обсмажте індичку та овочі на грилі. Подавайте разом." },
        { title: "Лосось з бататом на грилі", slug: "losos-z-batatom-na-grili", desc: "150г лосося, 150г батату, спаржа.", calories: 560, protein: 38, fat: 26, carbs: 42, ingredients: ["150г лосося", "150г батату", "100г спаржі", "2 ст.л. оливкової олії", "лимон"], instructions: "Наріжте батат кружальцями. Замаринуйте лосось. Обсмажте на грилі 4-5 хв з кожного боку." },
        { title: "Куряча грудка з булгуром", slug: "kuryacha-grudka-z-bulgurom", desc: "150г курки, 80г булгуру, тушковані овочі.", calories: 490, protein: 44, fat: 12, carbs: 50, ingredients: ["150г курячої грудки", "80г булгуру", "1 морква", "½ цибулі", "1 помідор"], instructions: "Обсмажте курку. Додайте овочі та булгур. Залийте водою та тушкуйте 15 хв." },
        { title: "Яловичий стейк з картопляним пюре", slug: "yalovichiy-steyk-z-kartoplyanim-pyure", desc: "120г яловичини, 150г картоплі, горошок.", calories: 580, protein: 40, fat: 24, carbs: 50, ingredients: ["120г яловичого стейка", "200г картоплі", "50мл молока", "10г вершкового масла", "80г горошку"], instructions: "Підсмажте стейк по 2-3 хв з кожного боку. Зваріть картоплю, зробіть пюре. Подавайте з горошком." },
        { title: "Тунець з пастою", slug: "tunets-z-pastoyu", desc: "Банка тунця, 80г пасти, песто.", calories: 510, protein: 38, fat: 14, carbs: 58, ingredients: ["1 банка тунця (140г)", "80г пасти", "100г помідорів чері", "2 зубчики часнику", "1 ст.л. песто"], instructions: "Зваріть пасту al dente. Обсмажте часник, додайте тунець та помідори. Змішайте з пастою та песто." },
        { title: "Сочевичний суп", slug: "sochevichniy-sup", desc: "150г сочевиці, овочі, спеції.", calories: 380, protein: 24, fat: 8, carbs: 54, ingredients: ["150г сочевиці", "1 морква", "1 цибуля", "200г помідорів", "1 ст.л. оливкової олії", "спеції"], instructions: "Пасеруйте овочі. Додайте сочевицю, помідори, воду. Варіть 20 хв до готовності." }
    ],
    dinner: [
        { title: "Біла риба з броколі", slug: "bila-riba-z-brokoli", desc: "150г тріски/хеку, 150г броколі на пару.", calories: 290, protein: 42, fat: 6, carbs: 16, ingredients: ["150г білої риби", "200г броколі", "½ лимона", "1 ст.л. оливкової олії", "часник"], instructions: "Рибу посоліть, поперчіть. Приготуйте на пару 8-10 хв разом з броколі. Полийте лимонним соком." },
        { title: "Кисломолочний сир з мигдалем", slug: "kislomolochniy-sir-z-migdalem", desc: "200г кисломолочного сиру 5%, 20г мигдалю, кориця.", calories: 310, protein: 32, fat: 16, carbs: 10, ingredients: ["200г кисломолочного сиру", "20г мигдалю", "½ ч.л. кориці", "краплі ванілі", "30г ягід"], instructions: "Розімніть сир виделкою. Додайте корицю, ваніль. Перемішайте з подрібненим мигдалем. Прикрасьте ягодами." },
        { title: "Омлет з овочами", slug: "omlet-z-ovochami", desc: "3 яйця, болгарський перець, помідори.", calories: 340, protein: 24, fat: 22, carbs: 12, ingredients: ["3 яйця", "60г перцю", "80г помідора", "¼ цибулі", "2 ст.л. молока"], instructions: "Збийте яйця з молоком. Обсмажте овочі, залийте яйцями. Готуйте під кришкою 5-7 хв." },
        { title: "Курячі котлети на пару з цвітною капустою", slug: "kuryachi-kotleti-na-paru-z-cvitnoyu-kapustoyu", desc: "120г фаршу, 150г цвітної капусти.", calories: 320, protein: 42, fat: 10, carbs: 16, ingredients: ["200г курячого філе", "200г цвітної капусти", "½ цибулі", "1 яйце", "1 ст.л. вівсяних пластівців"], instructions: "Зробіть фарш з курки та цибулі. Додайте яйце та пластівці. Сформуйте котлети. Готуйте на пару 20-25 хв разом з капустою." }
    ]
};
    // ---------- 4. WORKOUT DATABASE with detailed exercises ----------
    const workoutDatabase = {
        strength: {
            beginner: {
                '3': { name: "Starting Strength", desc: "Базові вправи 3 рази на тиждень для розвитку сили.", exercises: ["Присідання 3x5", "Жим лежачи 3x5", "Станова тяга 1x5", "Військовий жим 3x5"] },
                '4': { name: "StrongLifts 5x5", desc: "5x5 базові вправи 4 дні на тиждень.", exercises: ["Присідання 5x5", "Жим лежачи 5x5", "Тяга штанги 5x5", "Військовий жим 5x5"] },
            },
            intermediate: {
                '3': { name: "Texas Method", desc: "Volume/Recovery/Intensity спліт.", exercises: ["Пн: 5x5 присідань", "Ср: 2x5 легких присідань", "Пт: 1x5 важких присідань"] },
                '4': { name: "Madcow 5x5", desc: "Лінійна періодизація сили.", exercises: ["Пн: 5x5 важко", "Ср: 4x5 легко", "Пт: 1x3 + 1x8"] },
                '5': { name: "5/3/1 BBB", desc: "Основна робота + об'єм 5x10.", exercises: ["Основний ліфт 5/3/1", "Допоміжний ліфт 5x10", "Допоміжні вправи"] },
            },
            advanced: {
                '4': { name: "Westside Conjugate", desc: "ME/DE дні для максимальної сили.", exercises: ["День ME: важкий ліфт", "День DE: швидкісні рухи", "Допоміжна робота"] },
                '5': { name: "Sheiko", desc: "Високооб'ємне програмування.", exercises: ["3 основних ліфти", "Високий об'єм (70-80%)", "Технічні вправи"] },
                '6': { name: "Bulgarian", desc: "Щоденний максимум.", exercises: ["Денний максимум у присіданні", "Денний максимум у жимі", "Допоміжні вправи"] }
            }
        },
        hypertrophy: {
            beginner: {
                '3': { name: "Full Body 3x", desc: "Все тіло тричі на тиждень.", exercises: ["Присідання 3x10", "Жим лежачи 3x10", "Тяга вертикальна 3x10", "Жим плечовий 3x10"] },
                '4': { name: "Upper/Lower", desc: "Верх/Низ спліт 4 дні.", exercises: ["День1: Верх (жими, тяги)", "День2: Низ (присідання, згинання)", "День3: Верх (акцент на плечі)", "День4: Низ (акцент на сідниці)"] },
            },
            intermediate: {
                '4': { name: "PHUL", desc: "Сила + гіпертрофія.", exercises: ["Силовий верх", "Силовий низ", "Гіпертрофія верху", "Гіпертрофія низу"] },
                '5': { name: "PPL", desc: "Push/Pull/Legs спліт.", exercises: ["Push: жими", "Pull: тяги", "Legs: ноги", "Push 2", "Pull 2"] },
                '6': { name: "PPL x2", desc: "Двічі на тиждень кожна група.", exercises: ["Push A", "Pull A", "Legs A", "Push B", "Pull B", "Legs B"] }
            },
            advanced: {
                '5': { name: "Arnold Split", desc: "Груди/спина, плечі/руки, ноги.", exercises: ["Груди+спина", "Плечі+руки", "Ноги", "Груди+спина", "Плечі+руки"] },
                '6': { name: "Dorian Yates HIT", desc: "Високоінтенсивний тренінг.", exercises: ["Груди", "Спина", "Плечі", "Ноги", "Руки", "Відпочинок"] }
            }
        },
        endurance: {
            beginner: { '3': { name: "Couch to 5K", desc: "Програма бігу для початківців.", exercises: ["Біг/ходьба 30 хв", "Інтервали", "Довга прогулянка"] }, '4': { name: "Біг + ОФП", desc: "3 бігові + 1 силове.", exercises: ["Біг 5км", "Інтервальний біг", "Силове коло", "Біг 8км"] } },
            intermediate: { '4': { name: "Half Marathon", desc: "Підготовка до напівмарафону.", exercises: ["Легкий біг 45хв", "Темповий біг", "Інтервали 400м", "Довгий біг 12км"] }, '5': { name: "Triathlon Base", desc: "Плавання, вело, біг.", exercises: ["Плавання 1000м", "Вело 30км", "Біг 8км", "Комбіноване"] } },
            advanced: { '6': { name: "Ironman", desc: "Високооб'ємна підготовка.", exercises: ["Плавання 2км", "Вело 80км", "Біг 15км", "Брик-сесії"] } }
        },
        athletic: {
            beginner: { '3': { name: "Bodyweight Basics", desc: "Власна вага для функціоналу.", exercises: ["Віджимання 3x10", "Присідання 3x15", "Підтягування (з резинкою)", "Планка 3x30сек"] }, '4': { name: "Functional Intro", desc: "Медболи, гирі.", exercises: ["Махи гирі", "Медбол кидки", "Берпі", "Випади"] } },
            intermediate: { '4': { name: "CrossFit Scaled", desc: "WOD з масштабуванням.", exercises: ["Фран (масштабований)", "Грейс", "Мерф (половина)", "Скіл сесія"] }, '5': { name: "Tactical Athlete", desc: "Військова підготовка.", exercises: ["Біг з навантаженням", "Підтягування", "Берпі з жилетом", "Плавання"] } },
            advanced: { '5': { name: "Competitive CrossFit", desc: "Циклічне програмування.", exercises: ["Відкриті WOD", "Важка атлетика", "Гімнастика", "Меткони"] }, '6': { name: "Hybrid Athlete", desc: "Сила + витривалість.", exercises: ["Ранкова сила", "Вечірній біг", "Подвійні сесії"] } }
        }
    };

    // ---------- 5. STATE & UI ----------
    let currentLevel = 'intermediate';
    let currentStyle = 'strength';
    let currentDays = '4';
    let currentMeals = { breakfast: null, lunch: null, dinner: null };

    function getRandomMeal(category) {
        const meals = mealDatabase[category];
        return meals[Math.floor(Math.random() * meals.length)];
    }

function renderMeals() {
    currentMeals = {
        breakfast: getRandomMeal('breakfast'),
        lunch: getRandomMeal('lunch'),
        dinner: getRandomMeal('dinner')
    };

    document.getElementById('menu-container').innerHTML = `
        <div class="meal-item">
            <span class="meal-phase">Сніданок</span>
            <h4>${currentMeals.breakfast.title}</h4>
            <p style="font-size:0.9rem; color:#666;">${currentMeals.breakfast.desc}</p>
            <div style="display:flex; gap:10px; margin-top:10px; font-size:0.8rem; color:var(--accent);">
                <span>🔥 ${currentMeals.breakfast.calories} ккал</span>
                <span>💪 ${currentMeals.breakfast.protein}г білка</span>
            </div>
            <button class="recipe-nav-btn" data-url="${currentMeals.breakfast.slug}.html">
                Перейти до рецепту →
            </button>
        </div>
        <div class="meal-item">
            <span class="meal-phase">Обід</span>
            <h4>${currentMeals.lunch.title}</h4>
            <p style="font-size:0.9rem; color:#666;">${currentMeals.lunch.desc}</p>
            <div style="display:flex; gap:10px; margin-top:10px; font-size:0.8rem; color:var(--accent);">
                <span>🔥 ${currentMeals.lunch.calories} ккал</span>
                <span>💪 ${currentMeals.lunch.protein}г білка</span>
            </div>
            <button class="recipe-nav-btn" data-url="${currentMeals.lunch.slug}.html">
                Перейти до рецепту →
            </button>
        </div>
        <div class="meal-item">
            <span class="meal-phase">Вечеря</span>
            <h4>${currentMeals.dinner.title}</h4>
            <p style="font-size:0.9rem; color:#666;">${currentMeals.dinner.desc}</p>
            <div style="display:flex; gap:10px; margin-top:10px; font-size:0.8rem; color:var(--accent);">
                <span>🔥 ${currentMeals.dinner.calories} ккал</span>
                <span>💪 ${currentMeals.dinner.protein}г білка</span>
            </div>
            <button class="recipe-nav-btn" data-url="${currentMeals.dinner.slug}.html">
                Перейти до рецепту →
            </button>
        </div>
    `;

    // Додаємо обробники кліку на всі кнопки
    document.querySelectorAll('.recipe-nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const url = btn.getAttribute('data-url');
            window.location.href = url; // перехід на сторінку рецепту
        });
    });
}

    function getWorkoutProgram() {
        const styleData = workoutDatabase[currentStyle] || workoutDatabase.hypertrophy;
        const levelData = styleData[currentLevel] || styleData.intermediate;
        return levelData[currentDays] || levelData['4'] || { name: "Custom", desc: "Оберіть інші параметри.", exercises: ["Розминка 10хв", "Основна частина", "Заминка"] };
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
                <strong>📋 Програма тренувань:</strong>
                <ul class="exercise-list">
                    ${program.exercises.map(ex => `<li><span class="exercise-name">${ex}</span></li>`).join('')}
                </ul>
                <strong>💡 Рекомендації:</strong>
                <ul style="margin:10px 0 0 20px;">
                    <li>Розминка 10-15 хв (кардіо + суглобова гімнастика)</li>
                    <li>Заминка 5-10 хв (розтяжка)</li>
                    <li>Прогресивне навантаження: +2-5% щотижня</li>
                    <li>Відпочинок між підходами: 60-90 сек (гіпертрофія), 2-3 хв (сила)</li>
                </ul>
            </div>
        `;
    }

    // ---------- 6. PDF GENERATION FUNCTIONS ----------
    async function downloadMealPlanPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        
        // Header
        doc.setFillColor(74, 107, 72);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Цифровий Атлет', 20, 18);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('Персоналізований план харчування', 20, 28);
        doc.text(new Date().toLocaleDateString('uk-UA'), 160, 28);
        
        let y = 55;
        
        // Macros
        doc.setTextColor(74, 107, 72);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Ваші макронутрієнти', 20, y);
        y += 10;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Цільовий калораж: ${Math.round(targetCals)} ккал`, 20, y);
        y += 7;
        doc.text(`Білки: ${proteinGrams}г  |  Жири: ${fatGrams}г  |  Вуглеводи: ${carbGrams}г`, 20, y);
        y += 15;
        
        // Meals
        const meals = [
            { name: 'СНІДАНОК', data: currentMeals.breakfast },
            { name: 'ОБІД', data: currentMeals.lunch },
            { name: 'ВЕЧЕРЯ', data: currentMeals.dinner }
        ];
        
        for (const meal of meals) {
            if (y > 260) {
                doc.addPage();
                y = 20;
            }
            doc.setTextColor(74, 107, 72);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(meal.name, 20, y);
            y += 8;
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(meal.data.title, 20, y);
            y += 6;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const descLines = doc.splitTextToSize(meal.data.desc, 170);
            doc.text(descLines, 20, y);
            y += (descLines.length * 5) + 4;
            
            // Calories & protein
            doc.setTextColor(74, 107, 72);
            doc.text(`🔥 ${meal.data.calories} ккал  |  💪 ${meal.data.protein}г білка`, 20, y);
            y += 6;
            
            // Ingredients
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(9);
            doc.text('Інгредієнти:', 20, y);
            y += 4;
            const ingredientsText = meal.data.ingredients.join(', ');
            const ingLines = doc.splitTextToSize(ingredientsText, 170);
            doc.text(ingLines, 25, y);
            y += (ingLines.length * 4) + 4;
            
            // Instructions
            doc.setTextColor(100, 100, 100);
            doc.text('Приготування:', 20, y);
            y += 4;
            const instLines = doc.splitTextToSize(meal.data.instructions, 170);
            doc.text(instLines, 25, y);
            y += (instLines.length * 4) + 10;
        }
        
        // Tips
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setTextColor(74, 107, 72);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('💡 Поради для успіху', 20, y);
        y += 8;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const tips = [
            '• Пийте 2-3 літри води щодня',
            '• Не пропускайте прийоми їжі',
            '• Їжте повільно, ретельно пережовуючи',
            '• Готуйте їжу заздалегідь (meal prep)',
            '• Слухайте свій організм — коригуйте порції за потребою'
        ];
        tips.forEach(tip => {
            doc.text(tip, 25, y);
            y += 6;
        });
        
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('© Цифровий Атлет — Персоналізований план харчування', 20, 285);
        
        doc.save(`meal_plan_${new Date().toISOString().split('T')[0]}.pdf`);
    }
    
    async function downloadWorkoutPlanPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        const program = getWorkoutProgram();
        const goalMap = { strength: 'Сила', hypertrophy: 'Гіпертрофія (Маса)', endurance: 'Витривалість', athletic: 'Атлетизм' };
        const levelMap = { beginner: 'Початківець', intermediate: 'Середній', advanced: 'Просунутий' };
        
        // Header
        doc.setFillColor(74, 107, 72);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Цифровий Атлет', 20, 18);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('Персоналізований тренувальний план', 20, 28);
        doc.text(new Date().toLocaleDateString('uk-UA'), 160, 28);
        
        let y = 55;
        
        // Program info
        doc.setTextColor(74, 107, 72);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Параметри програми', 20, y);
        y += 10;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Тип тренувань: ${goalMap[currentStyle]}`, 20, y);
        y += 7;
        doc.text(`Рівень підготовки: ${levelMap[currentLevel]}`, 20, y);
        y += 7;
        doc.text(`Частота: ${currentDays} днів на тиждень`, 20, y);
        y += 15;
        
        // Program details
        doc.setTextColor(74, 107, 72);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(program.name, 20, y);
        y += 8;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const descLines = doc.splitTextToSize(program.desc, 170);
        doc.text(descLines, 20, y);
        y += (descLines.length * 5) + 10;
        
        // Exercises
        doc.setTextColor(74, 107, 72);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('📋 Розклад тренувань', 20, y);
        y += 8;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        program.exercises.forEach((ex, idx) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            doc.text(`${idx + 1}. ${ex}`, 25, y);
            y += 7;
        });
        
        y += 10;
        
        // Recommendations
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setTextColor(74, 107, 72);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('💡 Рекомендації', 20, y);
        y += 8;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const recs = [
            '• Розминка 10-15 хв перед кожним тренуванням',
            '• Заминка та розтяжка 5-10 хв після тренування',
            '• Прогресивне навантаження: збільшуйте вагу або повторення щотижня',
            '• Відпочинок між підходами: 60-90 сек для гіпертрофії, 2-3 хв для сили',
            '• Слідкуйте за технікою виконання',
            '• Висипайтеся (7-9 год сну) для відновлення'
        ];
        recs.forEach(rec => {
            doc.text(rec, 25, y);
            y += 6;
        });
        
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('© Цифровий Атлет — Персоналізований тренувальний план', 20, 285);
        
        doc.save(`workout_plan_${currentStyle}_${new Date().toISOString().split('T')[0]}.pdf`);
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
    document.getElementById('download-meal-pdf').addEventListener('click', downloadMealPlanPDF);
    document.getElementById('download-workout-pdf').addEventListener('click', downloadWorkoutPlanPDF);

    // ---------- 8. INITIAL RENDER ----------
    renderMeals();
    renderWorkout();
});