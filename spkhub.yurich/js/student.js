// ========== СТУДЕНТЫ ==========
let currentStudent = null;

function updateCuratorSelect() {
    const select = document.getElementById('student-curator');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Выберите куратора --</option>';
    
    const teachers = storage.getTeachers();
    teachers.forEach(teacher => {
        select.innerHTML += `<option value="${teacher.email}">${teacher.fullName} (${teacher.curator}) - ${teacher.subject}</option>`;
    });
    
    select.innerHTML += `<option value="yurich@kodelab.ru">👨‍💻 Юрич (хакер)</option>`;
}

function getCuratorName(curatorEmail) {
    if (curatorEmail === 'yurich@kodelab.ru') return 'Юрич (хакер)';
    
    const teachers = storage.getTeachers();
    const teacher = teachers.find(t => t.email === curatorEmail);
    return teacher ? `${teacher.fullName} (${teacher.subject})` : curatorEmail;
}

function refreshStudentPage() {
    const cabinet = document.getElementById('student-cabinet');
    const register = document.getElementById('student-register');
    const login = document.getElementById('student-login');
    
    cabinet.style.display = 'none';
    register.style.display = 'none';
    login.style.display = 'none';
    
    const students = storage.getStudents();
    
    if (students.length === 0) {
        updateCuratorSelect();
        register.style.display = 'block';
    } else {
        login.style.display = 'block';
    }
}

function showStudentCabinet(student) {
    currentStudent = student;
    
    document.getElementById('student-cabinet').style.display = 'block';
    document.getElementById('student-register').style.display = 'none';
    document.getElementById('student-login').style.display = 'none';
    
    document.getElementById('student-name').textContent = `${student.firstname} ${student.lastname}`;
    document.getElementById('student-group').textContent = student.group;
    document.getElementById('student-email').textContent = student.email;
    
    const savedAvatar = storage.getAvatar(student.email, 'student');
    if (savedAvatar) {
        document.getElementById('student-avatar').src = savedAvatar;
    }
    
    renderStudentGrades();
    renderStudentTeachers();
}

function renderStudentGrades() {
    if (!currentStudent) return;
    
    const grades = storage.getGrades();
    const studentGrades = grades[currentStudent.email] || {};
    const container = document.getElementById('student-grades-list');
    
    if (Object.keys(studentGrades).length === 0) {
        container.innerHTML = '<div class="empty-message">📭 У вас пока нет оценок</div>';
        return;
    }
    
    container.innerHTML = '';
    
    // Сортируем по предметам
    const sortedSubjects = Object.keys(studentGrades).sort();
    
    sortedSubjects.forEach(subject => {
        const grade = studentGrades[subject];
        const gradeClass = getGradeClass(grade);
        
        const gradeItem = document.createElement('div');
        gradeItem.className = 'grade-item';
        gradeItem.innerHTML = `
            <span class="grade-subject">📚 ${subject}</span>
            <span class="grade-value ${gradeClass}">${grade}</span>
        `;
        container.appendChild(gradeItem);
    });
}

function getGradeClass(grade) {
    switch(grade) {
        case 5: return 'grade-5';
        case 4: return 'grade-4';
        case 3: return 'grade-3';
        case 2: return 'grade-2';
        case 1: return 'grade-1';
        default: return '';
    }
}

function renderStudentTeachers() {
    if (!currentStudent) return;
    
    const teachers = storage.getTeachers();
    const container = document.getElementById('student-teachers-list');
    
    // Преподаватели, у которых email совпадает с curator студента
    const myTeachers = teachers.filter(t => t.email === currentStudent.curator);
    
    // Также добавляем Юрича если он куратор
    if (currentStudent.curator === 'yurich@kodelab.ru') {
        container.innerHTML = `
            <div class="teacher-item-card">
                <div class="teacher-name">👨‍💻 Юрич</div>
                <div class="teacher-subject">Хакер, философ, историк</div>
                <div class="teacher-subject">Куратор группы ${currentStudent.group}</div>
            </div>
        `;
        return;
    }
    
    if (myTeachers.length === 0) {
        container.innerHTML = '<div class="empty-message">👨‍🏫 У вас пока нет назначенного преподавателя</div>';
        return;
    }
    
    container.innerHTML = '';
    
    myTeachers.forEach(teacher => {
        const teacherCard = document.createElement('div');
        teacherCard.className = 'teacher-item-card';
        teacherCard.innerHTML = `
            <div class="teacher-name">👨‍🏫 ${teacher.fullName}</div>
            <div class="teacher-subject">📚 Преподаёт: ${teacher.subject}</div>
            <div class="teacher-subject">👥 Куратор группы: ${teacher.curator}</div>
            <div class="teacher-subject">📧 ${teacher.email}</div>
        `;
        container.appendChild(teacherCard);
    });
}

// Регистрация
const studentRegisterForm = document.getElementById('student-register-form');
if (studentRegisterForm) {
    studentRegisterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const firstname = document.getElementById('student-firstname').value.trim();
        const lastname = document.getElementById('student-lastname').value.trim();
        const group = document.getElementById('student-group-input').value.trim();
        const email = document.getElementById('student-email-input').value.trim();
        const password = document.getElementById('student-password').value.trim();
        const curator = document.getElementById('student-curator').value;
        
        if (!firstname || !lastname || !group || !email || !password || !curator) {
            alert('⚠️ Заполните все поля!');
            return;
        }
        
        if (password.length < 8) {
            alert('⚠️ Пароль должен быть минимум 8 символов!');
            return;
        }
        
        const students = storage.getStudents();
        
        if (students.some(s => s.email === email)) {
            alert('⚠️ Студент с таким email уже существует!');
            return;
        }
        
        const newStudent = { firstname, lastname, group, email, password, curator };
        students.push(newStudent);
        storage.saveStudents(students);
        
        alert('✅ Регистрация успешна! Теперь войдите в систему.');
        studentRegisterForm.reset();
        refreshStudentPage();
    });
}

// Вход
const studentLoginForm = document.getElementById('student-login-form');
if (studentLoginForm) {
    studentLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('student-email-login').value.trim();
        const password = document.getElementById('student-login-password').value.trim();
        
        if (!email || !password) {
            alert('⚠️ Введите email и пароль!');
            return;
        }
        
        const students = storage.getStudents();
        const student = students.find(s => s.email === email);
        
        if (!student) {
            alert('❌ Студент не найден! Зарегистрируйтесь.');
            return;
        }
        
        if (student.password !== password) {
            alert('❌ Неверный пароль!');
            return;
        }
        
        showStudentCabinet(student);
        document.getElementById('student-login-password').value = '';
    });
}

// Кнопка "Создать новый аккаунт"
const showRegisterBtn = document.getElementById('show-register-btn');
if (showRegisterBtn) {
    showRegisterBtn.addEventListener('click', () => {
        document.getElementById('student-login').style.display = 'none';
        document.getElementById('student-register').style.display = 'block';
        updateCuratorSelect();
        document.getElementById('student-register-form').reset();
    });
}

// Аватар
const studentAvatarUpload = document.getElementById('student-avatar-upload');
if (studentAvatarUpload) {
    studentAvatarUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && currentStudent) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                document.getElementById('student-avatar').src = ev.target.result;
                storage.setAvatar(currentStudent.email, 'student', ev.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
}

const studentAvatarLabel = document.querySelector('#student-avatar + .avatar-label');
if (studentAvatarLabel) {
    studentAvatarLabel.addEventListener('click', () => {
        document.getElementById('student-avatar-upload').click();
    });
}

window.refreshStudentPage = refreshStudentPage;