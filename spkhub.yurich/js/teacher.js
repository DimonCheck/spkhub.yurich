// ========== ПРЕПОДАВАТЕЛИ ==========
let currentTeacher = null;

function refreshTeacherPage() {
    const cabinet = document.getElementById('teacher-cabinet');
    const register = document.getElementById('teacher-register');
    const login = document.getElementById('teacher-login');
    const select = document.getElementById('teacher-select');
    
    cabinet.style.display = 'none';
    register.style.display = 'none';
    login.style.display = 'none';
    
    const teachers = storage.getTeachers();
    
    if (teachers.length === 0) {
        register.style.display = 'block';
    } else {
        select.innerHTML = '<option value="">-- Выберите преподавателя --</option>';
        teachers.forEach((teacher, index) => {
            select.innerHTML += `<option value="${index}">${teacher.fullName} (${teacher.subject})</option>`;
        });
        login.style.display = 'block';
    }
}

function showTeacherCabinet(teacher) {
    currentTeacher = teacher;
    
    document.getElementById('teacher-cabinet').style.display = 'block';
    document.getElementById('teacher-register').style.display = 'none';
    document.getElementById('teacher-login').style.display = 'none';
    
    document.getElementById('teacher-name').textContent = teacher.fullName;
    document.getElementById('teacher-subject').textContent = teacher.subject;
    document.getElementById('teacher-email').textContent = teacher.email;
    document.getElementById('teacher-curator').textContent = teacher.curator;
    
    const savedAvatar = storage.getAvatar(teacher.email, 'teacher');
    if (savedAvatar) {
        document.getElementById('teacher-avatar').src = savedAvatar;
    }
    
    renderTeacherStudentsList();
}

function renderTeacherStudentsList() {
    if (!currentTeacher) return;
    
    const students = storage.getStudents();
    const grades = storage.getGrades();
    const container = document.getElementById('teacher-students-list');
    
    // Студенты, у которых куратор - этот преподаватель
    const myStudents = students.filter(s => s.curator === currentTeacher.email);
    
    if (myStudents.length === 0) {
        container.innerHTML = '<div class="empty-message">📭 У вас пока нет студентов</div>';
        return;
    }
    
    container.innerHTML = '';
    
    myStudents.forEach(student => {
        const studentGrades = grades[student.email] || {};
        const gradeForSubject = studentGrades[currentTeacher.subject] || null;
        
        const card = document.createElement('div');
        card.className = 'student-grade-card';
        card.innerHTML = `
            <div class="student-info">
                👨‍🎓 ${student.firstname} ${student.lastname} (${student.group})
                ${gradeForSubject ? `<span class="current-grade grade-${gradeForSubject}">Текущая оценка: ${gradeForSubject}</span>` : '<span class="current-grade" style="background:#6c757d">Нет оценки</span>'}
            </div>
            <div class="grade-input-group">
                <select class="grade-select">
                    <option value="">Выбрать оценку</option>
                    <option value="5">5 - Отлично</option>
                    <option value="4">4 - Хорошо</option>
                    <option value="3">3 - Удовлетворительно</option>
                    <option value="2">2 - Неудовлетворительно</option>
                    <option value="1">1 - Плохо</option>
                </select>
                <button class="set-grade-btn teacher-btn" data-student="${student.email}">📝 Выставить оценку</button>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    // Добавляем обработчики для кнопок
    document.querySelectorAll('.set-grade-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const studentEmail = btn.dataset.student;
            const select = btn.parentElement.querySelector('.grade-select');
            const grade = select.value;
            
            if (!grade) {
                alert('⚠️ Выберите оценку!');
                return;
            }
            
            setGradeForStudent(studentEmail, parseInt(grade));
        });
    });
    
    // Добавляем поиск
    const searchInput = document.getElementById('teacher-student-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const cards = container.querySelectorAll('.student-grade-card');
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(searchTerm) ? 'block' : 'none';
            });
        });
    }
}

function setGradeForStudent(studentEmail, grade) {
    if (!currentTeacher) return;
    
    const grades = storage.getGrades();
    if (!grades[studentEmail]) {
        grades[studentEmail] = {};
    }
    
    grades[studentEmail][currentTeacher.subject] = grade;
    storage.saveGrades(grades);
    
    alert(`✅ Оценка ${grade} по предмету "${currentTeacher.subject}" выставлена!`);
    renderTeacherStudentsList();
}

// Регистрация
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('reg-fullname').value.trim();
        const curator = document.getElementById('reg-curator').value.trim();
        const subject = document.getElementById('reg-subject').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value.trim();
        
        if (!fullName || !curator || !subject || !email || !password) {
            alert('⚠️ Заполните все поля!');
            return;
        }
        
        if (password.length < 8) {
            alert('⚠️ Пароль должен быть минимум 8 символов!');
            return;
        }
        
        const teachers = storage.getTeachers();
        
        if (teachers.some(t => t.email === email)) {
            alert('⚠️ Преподаватель с таким email уже существует!');
            return;
        }
        
        const newTeacher = { fullName, curator, subject, email, password };
        teachers.push(newTeacher);
        storage.saveTeachers(teachers);
        
        alert('✅ Регистрация успешна! Теперь войдите в систему.');
        registerForm.reset();
        refreshTeacherPage();
    });
}

// Вход
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const index = document.getElementById('teacher-select').value;
        const password = document.getElementById('login-password').value.trim();
        
        if (!index) {
            alert('⚠️ Выберите преподавателя!');
            return;
        }
        
        if (!password) {
            alert('⚠️ Введите пароль!');
            return;
        }
        
        const teachers = storage.getTeachers();
        const teacher = teachers[parseInt(index)];
        
        if (!teacher || teacher.password !== password) {
            alert('❌ Неверный пароль!');
            return;
        }
        
        showTeacherCabinet(teacher);
        document.getElementById('login-password').value = '';
    });
}

// Аватар
const teacherAvatarUpload = document.getElementById('teacher-avatar-upload');
if (teacherAvatarUpload) {
    teacherAvatarUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && currentTeacher) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                document.getElementById('teacher-avatar').src = ev.target.result;
                storage.setAvatar(currentTeacher.email, 'teacher', ev.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
}

const teacherAvatarLabel = document.querySelector('#teacher-avatar + .avatar-label');
if (teacherAvatarLabel) {
    teacherAvatarLabel.addEventListener('click', () => {
        document.getElementById('teacher-avatar-upload').click();
    });
}

window.refreshTeacherPage = refreshTeacherPage;