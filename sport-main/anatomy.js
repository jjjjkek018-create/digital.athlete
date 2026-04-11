document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('canvas-container');
    const toggles = {
        skin: document.getElementById('check-skin'),
        fat: document.getElementById('check-fat'),
        muscle: document.getElementById('check-muscle')
    };

    // Create floating tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'hover-tooltip';
    document.body.appendChild(tooltip);

    // Knowledge base (same as before)
    const anatomyData = {
        head: { title: "Череп та мозок", desc: "Захищає ЦНС. Споживає 20% кисню.", tips: ["Гідратація", "Сон 7-9 год"] },
        torso: { title: "Тулуб", desc: "Серце, легені, органи травлення. Діафрагма – ключ до дихання.", tips: ["Кор-стабільність", "Діафрагмальне дихання"] },
        arm_l: { title: "Ліва рука", desc: "Плече, лікоть, кисть. Дрібна моторика та сила хвату.", tips: ["Ротаторна манжета", "Розтяжка трицепса"] },
        arm_r: { title: "Права рука", desc: "Аналогічно лівій. Уникайте дисбалансу.", tips: ["Односторонні вправи", "Гіпертрофія біцепса"] },
        leg_l: { title: "Ліва нога", desc: "Найбільші м'язи – сідничні, квадрицепси. Опора тіла.", tips: ["Присідання", "Гомілкостоп"] },
        leg_r: { title: "Права нога", desc: "Симетричний розвиток запобігає травмам.", tips: ["Випади", "Пліометрія"] }
    };

    // --- Three.js setup (same as improved version) ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfafaf7);
    scene.fog = new THREE.FogExp2(0xfafaf7, 0.008);

    const containerRect = container.getBoundingClientRect();
    const camera = new THREE.PerspectiveCamera(45, containerRect.width / containerRect.height, 0.1, 1000);
    camera.position.set(2, 1.5, 4);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRect.width, containerRect.height);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0x404060, 0.65);
    scene.add(ambient);
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(3, 5, 2);
    mainLight.castShadow = true;
    scene.add(mainLight);
    const fillLight = new THREE.PointLight(0xccaa88, 0.4);
    fillLight.position.set(0, -1, 1);
    scene.add(fillLight);
    const rimLight = new THREE.PointLight(0x88aaff, 0.5);
    rimLight.position.set(-2, 1.5, -2);
    scene.add(rimLight);

    // Helper to create layer groups
    function createLayerGroup(material, color, opacity, visible = true) {
        const group = new THREE.Group();
        const partsSpec = [
            { type: 'sphere', scale: [0.32, 0.32, 0.32], pos: [0, 1.45, 0], part: 'head' },
            { type: 'cylinder', scale: [0.45, 0.55, 0.85], pos: [0, 0.7, 0], part: 'torso' },
            { type: 'cylinder', scale: [0.16, 0.16, 0.55], pos: [-0.65, 1.2, 0], part: 'arm_l' },
            { type: 'cylinder', scale: [0.16, 0.16, 0.55], pos: [0.65, 1.2, 0], part: 'arm_r' },
            { type: 'cylinder', scale: [0.13, 0.13, 0.5], pos: [-0.65, 0.75, 0], part: 'arm_l' },
            { type: 'cylinder', scale: [0.13, 0.13, 0.5], pos: [0.65, 0.75, 0], part: 'arm_r' },
            { type: 'cylinder', scale: [0.28, 0.24, 0.7], pos: [-0.35, -0.2, 0], part: 'leg_l' },
            { type: 'cylinder', scale: [0.28, 0.24, 0.7], pos: [0.35, -0.2, 0], part: 'leg_r' },
            { type: 'cylinder', scale: [0.2, 0.18, 0.6], pos: [-0.35, -0.75, 0], part: 'leg_l' },
            { type: 'cylinder', scale: [0.2, 0.18, 0.6], pos: [0.35, -0.75, 0], part: 'leg_r' }
        ];
        partsSpec.forEach(spec => {
            let geom;
            if (spec.type === 'sphere') geom = new THREE.SphereGeometry(spec.scale[0], 32, 32);
            else geom = new THREE.CylinderGeometry(spec.scale[0], spec.scale[1], spec.scale[2], 24);
            const mesh = new THREE.Mesh(geom, material);
            mesh.position.set(spec.pos[0], spec.pos[1], spec.pos[2]);
            mesh.userData = { part: spec.part, layer: 'layer' };
            mesh.castShadow = true;
            group.add(mesh);
        });
        group.visible = visible;
        return group;
    }

    const boneMat = new THREE.MeshStandardMaterial({ color: 0xe8eef2, roughness: 0.4 });
    const muscleMat = new THREE.MeshStandardMaterial({ color: 0xaa4a4a, roughness: 0.5 });
    const fatMat = new THREE.MeshStandardMaterial({ color: 0xf5c996, roughness: 0.7, transparent: true, opacity: 0.45 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf3cfb3, roughness: 0.35, transparent: true, opacity: 0.35 });

    const boneGroup = createLayerGroup(boneMat, 0xe8eef2, 1, true);
    const muscleGroup = createLayerGroup(muscleMat, 0xaa4a4a, 1, true);
    const fatGroup = createLayerGroup(fatMat, 0xf5c996, 0.45, true);
    const skinGroup = createLayerGroup(skinMat, 0xf3cfb3, 0.35, true);

    const fullModel = new THREE.Group();
    fullModel.add(boneGroup, muscleGroup, fatGroup, skinGroup);
    scene.add(fullModel);
    fullModel.position.y = -0.2;
    fullModel.rotation.y = 0.5;

    // Toggle listeners
    toggles.skin.addEventListener('change', e => skinGroup.visible = e.target.checked);
    toggles.fat.addEventListener('change', e => fatGroup.visible = e.target.checked);
    toggles.muscle.addEventListener('change', e => muscleGroup.visible = e.target.checked);

    // --- Hover logic with raycasting ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let currentHovered = null;

    container.addEventListener('mousemove', (event) => {
        const rect = container.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        
        const allMeshes = [];
        [boneGroup, muscleGroup, fatGroup, skinGroup].forEach(g => {
            g.children.forEach(c => allMeshes.push(c));
        });
        const intersects = raycaster.intersectObjects(allMeshes);
        
        if (intersects.length > 0) {
            const hit = intersects[0].object;
            const partId = hit.userData.part;
            const data = anatomyData[partId];
            if (data && currentHovered !== partId) {
                currentHovered = partId;
                // Show tooltip near cursor
                tooltip.style.opacity = '1';
                tooltip.innerHTML = `<strong>${data.title}</strong>${data.desc}<br><small>${data.tips.join(' • ')}</small>`;
                // Position tooltip 20px offset from cursor
                tooltip.style.left = (event.clientX + 20) + 'px';
                tooltip.style.top = (event.clientY + 20) + 'px';
            } else if (data) {
                // Update position while moving
                tooltip.style.left = (event.clientX + 20) + 'px';
                tooltip.style.top = (event.clientY + 20) + 'px';
            }
        } else {
            if (currentHovered !== null) {
                currentHovered = null;
                tooltip.style.opacity = '0';
            }
        }
    });

    // Hide tooltip when leaving container
    container.addEventListener('mouseleave', () => {
        currentHovered = null;
        tooltip.style.opacity = '0';
    });

    // --- Drag to rotate (preserved) ---
    let isDragging = false;
    let lastMouse = { x: 0, y: 0 };
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMouse.x = e.clientX;
        lastMouse.y = e.clientY;
        container.style.cursor = 'grabbing';
    });
    window.addEventListener('mouseup', () => {
        isDragging = false;
        container.style.cursor = 'grab';
    });
    container.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - lastMouse.x;
            const deltaY = e.clientY - lastMouse.y;
            fullModel.rotation.y += deltaX * 0.008;
            fullModel.rotation.x += deltaY * 0.008;
            fullModel.rotation.x = Math.max(-1, Math.min(1, fullModel.rotation.x));
            lastMouse.x = e.clientX;
            lastMouse.y = e.clientY;
        }
    });

    // --- Auto-rotate when idle ---
    let idleTimer;
    function resetIdleTimer() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            // Auto-rotate only if not dragging and tooltip hidden? We'll just do gentle rotation
            function autoRotate() {
                if (!isDragging && tooltip.style.opacity === '0') {
                    fullModel.rotation.y += 0.002;
                }
                requestAnimationFrame(autoRotate);
            }
            autoRotate();
        }, 3000);
    }
    container.addEventListener('mousemove', resetIdleTimer);
    resetIdleTimer();

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
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