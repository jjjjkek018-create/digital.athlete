document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('canvas-container');
    const infoPanel = document.getElementById('info-panel');
    const infoTitle = document.getElementById('info-title');
    const infoDesc = document.getElementById('info-desc');
    const infoTips = document.getElementById('info-tips');
    
    // Елементи керування (чекбокси)
    const toggles = {
        skin: document.getElementById('check-skin'),
        fat: document.getElementById('check-fat'),
        muscle: document.getElementById('check-muscle')
    };

    // --- 1. БАЗА ЗНАНЬ ---
    const anatomyData = {
        skin: {
            title: "Епідерміс та Дерма",
            desc: "Зовнішній бар'єр тіла. Забезпечує терморегуляцію через потовиділення та захищає внутрішні системи від патогенів.",
            tips: ["Підтримуйте гідратацію.", "Вживайте Омега-3 для ліпідної мантії."]
        },
        fat: {
            title: "Підшкірна клітковина",
            desc: "Ендокринний орган. Діє як амортизатор та резервуар енергії.",
            tips: ["Уникайте трансжирів.", "Контролюйте рівень інсуліну."]
        },
        muscle: {
            title: "М'язові волокна",
            desc: "Головний метаболічний двигун. Забезпечують рух та споживають найбільше енергії.",
            tips: ["Споживайте 1.6-2г білка на кг.", "Прогресивне перевантаження."]
        },
        bone: {
            title: "Кісткова структура",
            desc: "Каркас тіла та депо мінералів.",
            tips: ["Достатньо вітаміну D3 + K2.", "Силове навантаження зміцнює щільність кісток."]
        }
    };

    // --- 2. НАЛАШТУВАННЯ СЦЕНИ ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfafaf7);
    
    // Безпечне отримання розмірів (якщо контейнер ще не має розмірів)
    const containerWidth = container.clientWidth || 600;
    const containerHeight = container.clientHeight || 600;
    
    const camera = new THREE.PerspectiveCamera(45, containerWidth / containerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerWidth, containerHeight);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const directLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directLight.position.set(2, 2, 5);
    scene.add(directLight);

    const armGroup = new THREE.Group();
    
    function createLayer(geo, color, opacity, layerId) {
        const mat = new THREE.MeshPhongMaterial({ 
            color: color, 
            transparent: true, 
            opacity: opacity,
            emissive: new THREE.Color(0x000000)
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.userData.layerId = layerId;
        return mesh;
    }

    // Створюємо меші (злегка скориговані розміри для кращого нашарування)
    const boneMesh = createLayer(new THREE.CylinderGeometry(0.2, 0.2, 3.5, 32), 0xeeeeee, 1, 'bone');
    const muscleMesh = createLayer(new THREE.CylinderGeometry(0.5, 0.45, 3.2, 32), 0x8b0000, 0.9, 'muscle');
    const fatMesh = createLayer(new THREE.CylinderGeometry(0.6, 0.55, 3.3, 32), 0xffd700, 0.4, 'fat');
    const skinMesh = createLayer(new THREE.CylinderGeometry(0.65, 0.6, 3.4, 32), 0xffdbac, 0.3, 'skin');

    armGroup.add(boneMesh, muscleMesh, fatMesh, skinMesh);
    scene.add(armGroup);

    // --- 3. КЕРУВАННЯ ШАРАМИ (UI) ---
    toggles.skin.addEventListener('change', (e) => skinMesh.visible = e.target.checked);
    toggles.fat.addEventListener('change', (e) => fatMesh.visible = e.target.checked);
    toggles.muscle.addEventListener('change', (e) => muscleMesh.visible = e.target.checked);

    // --- 4. ІНТЕРАКТИВ (Raycasting & Mouse) ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    container.addEventListener('mousemove', (event) => {
        const rect = container.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

        if (isDragging) {
            armGroup.rotation.y += (event.clientX - prevMouse.x) * 0.01;
            armGroup.rotation.x += (event.clientY - prevMouse.y) * 0.01;
        }
        prevMouse = { x: event.clientX, y: event.clientY };
    });

    container.addEventListener('mousedown', () => {
        isDragging = true;
        container.style.cursor = 'grabbing';
    });
    
    window.addEventListener('mouseup', () => {
        isDragging = false;
        container.style.cursor = 'grab';
    });

    container.addEventListener('click', (event) => {
        // Запобігаємо кліку при завершенні перетягування
        if (Math.abs(event.clientX - prevMouse.x) > 5) return;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(armGroup.children);
        const hit = intersects.find(i => i.object.visible);

        if (hit) {
            const data = anatomyData[hit.object.userData.layerId];
            if (data) {
                infoTitle.textContent = data.title;
                infoDesc.textContent = data.desc;
                infoTips.innerHTML = data.tips.map(t => `<li>${t}</li>`).join('');
                infoPanel.classList.remove('hidden');
                
                const mat = hit.object.material;
                mat.emissive.setHex(0x332222);
                setTimeout(() => mat.emissive.setHex(0x000000), 300);
            }
        }
    });

    document.getElementById('close-btn').addEventListener('click', () => {
        infoPanel.classList.add('hidden');
    });

    // --- 5. АНІМАЦІЯ ТА РЕСАЙЗ ---
    function animate() {
        requestAnimationFrame(animate);
        // Авто-обертання тільки якщо панель закрита і ми не тягнемо модель
        if (infoPanel.classList.contains('hidden') && !isDragging) {
            armGroup.rotation.y += 0.005;
        }
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
});