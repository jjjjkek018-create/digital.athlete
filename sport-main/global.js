// global.js

// 1. Ефект "Паралакс трави" (працюватиме, якщо на сторінці є елементи з класом .leaf)
document.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX * -0.02);
    const moveY = (e.clientY * -0.02);
    
    document.querySelectorAll('.leaf').forEach(leaf => {
        leaf.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${moveX * 0.5}deg)`;
    });
});

// 2. Плавна поява контенту ( Intersection Observer)
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0) rotate(0deg)";
        }
    });
}, observerOptions);

// 3. Логіка видимості навігації та ініціалізація обсервера
function updateNavVisibility() {
    const protocolLink = document.getElementById('nav-protocol');
    if (protocolLink && localStorage.getItem('athleteStats')) {
        protocolLink.style.display = 'inline-block'; 
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Перевірка навігації
    updateNavVisibility();

    // Запуск анімації появи для карток
    document.querySelectorAll('.glass-card').forEach(card => {
        card.style.opacity = "0";
        card.style.transform = "translateY(50px) rotate(-2deg)";
        card.style.transition = "all 0.8s ease-out";
        observer.observe(card);
    });
});