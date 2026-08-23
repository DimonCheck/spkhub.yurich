// ========== ГЛОБАЛЬНОЕ ХРАНИЛИЩЕ ==========
window.storage = {
    getTeachers: () => {
        const data = localStorage.getItem('kodelab_teachers');
        return data ? JSON.parse(data) : [];
    },
    saveTeachers: (teachers) => {
        localStorage.setItem('kodelab_teachers', JSON.stringify(teachers));
    },
    getStudents: () => {
        const data = localStorage.getItem('kodelab_students');
        return data ? JSON.parse(data) : [];
    },
    saveStudents: (students) => {
        localStorage.setItem('kodelab_students', JSON.stringify(students));
    },
    getGrades: () => {
        const data = localStorage.getItem('kodelab_grades');
        return data ? JSON.parse(data) : {};
    },
    saveGrades: (grades) => {
        localStorage.setItem('kodelab_grades', JSON.stringify(grades));
    },
    getAdmin: () => {
        const data = localStorage.getItem('kodelab_admin');
        return data ? JSON.parse(data) : null;
    },
    setAdmin: (admin) => {
        localStorage.setItem('kodelab_admin', JSON.stringify(admin));
    },
    getAvatar: (email, role) => {
        return localStorage.getItem(`avatar_${role}_${email}`);
    },
    setAvatar: (email, role, dataUrl) => {
        localStorage.setItem(`avatar_${role}_${email}`, dataUrl);
    }
};

// ========== НАВИГАЦИЯ ==========
function showMainPage() {
    document.getElementById('main-page').style.display = 'flex';
    document.getElementById('teacher-page').style.display = 'none';
    document.getElementById('student-page').style.display = 'none';
    document.getElementById('yurich-page').style.display = 'none';
    window.location.hash = '';
}

function showTeacherPage() {
    document.getElementById('main-page').style.display = 'none';
    document.getElementById('teacher-page').style.display = 'flex';
    document.getElementById('student-page').style.display = 'none';
    document.getElementById('yurich-page').style.display = 'none';
    window.location.hash = 'teacher';
    if (window.refreshTeacherPage) window.refreshTeacherPage();
}

function showStudentPage() {
    document.getElementById('main-page').style.display = 'none';
    document.getElementById('teacher-page').style.display = 'none';
    document.getElementById('student-page').style.display = 'flex';
    document.getElementById('yurich-page').style.display = 'none';
    window.location.hash = 'student';
    if (window.refreshStudentPage) window.refreshStudentPage();
}

function showYurichPage() {
    document.getElementById('main-page').style.display = 'none';
    document.getElementById('teacher-page').style.display = 'none';
    document.getElementById('student-page').style.display = 'none';
    document.getElementById('yurich-page').style.display = 'flex';
    window.location.hash = 'yurich';
    setTimeout(() => {
        const input = document.getElementById('terminal-input');
        if (input) input.focus();
    }, 100);
}

// ========== УПРАВЛЕНИЕ ТЕМОЙ ==========
function setTheme(theme) {
    const body = document.body;
    const switcher = document.getElementById('theme-switcher');
    
    if (theme === 'dark') {
        body.classList.add('dark-theme');
        if (switcher) switcher.innerHTML = '☀️ Светлая тема';
        localStorage.setItem('kodelab_theme', 'dark');
    } else {
        body.classList.remove('dark-theme');
        if (switcher) switcher.innerHTML = '🌙 Тёмная тема';
        localStorage.setItem('kodelab_theme', 'light');
    }
}

function initTheme() {
    const saved = localStorage.getItem('kodelab_theme') || 'light';
    setTheme(saved);
}

// ========== МЕНЮ ==========
function toggleMenu() {
    const burger = document.getElementById('burgerBtn');
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    
    if (burger && menu && overlay) {
        burger.classList.toggle('active');
        menu.classList.toggle('open');
        overlay.classList.toggle('active');
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    
    const burgerBtn = document.getElementById('burgerBtn');
    const menuOverlay = document.getElementById('menuOverlay');
    
    if (burgerBtn) burgerBtn.addEventListener('click', toggleMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', toggleMenu);
    
    const themeSwitcher = document.getElementById('theme-switcher');
    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-theme');
            setTheme(isDark ? 'light' : 'dark');
            toggleMenu();
        });
    }
    
    const hash = window.location.hash;
    if (hash === '#teacher') showTeacherPage();
    else if (hash === '#student') showStudentPage();
    else if (hash === '#yurich') showYurichPage();
    else showMainPage();
});

window.showMainPage = showMainPage;
window.showTeacherPage = showTeacherPage;
window.showStudentPage = showStudentPage;
window.showYurichPage = showYurichPage;
window.toggleMenu = toggleMenu;
window.setTheme = setTheme;