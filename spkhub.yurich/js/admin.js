// ========== АДМИН-ПАНЕЛЬ ==========
const ADMIN_SECRET = 'ADMIN2026';

function renderTeacherList() {
    const container = document.getElementById('teacherListContainer');
    const teachers = storage.getTeachers();
    
    if (!container) return;
    
    if (teachers.length === 0) {
        container.innerHTML = '<div class="empty-message">📭 Нет зарегистрированных преподавателей</div>';
        return;
    }
    
    container.innerHTML = '<h3>📋 Список преподавателей:</h3>';
    teachers.forEach((teacher, index) => {
        container.innerHTML += `
            <div class="teacher-item">
                <div>
                    <strong>${teacher.fullName}</strong><br>
                    📧 ${teacher.email}<br>
                    📚 ${teacher.subject}<br>
                    👥 Куратор: ${teacher.curator}
                </div>
                <button class="delete-btn" data-type="teacher" data-index="${index}">🗑️ Удалить</button>
            </div>
        `;
    });
    
    document.querySelectorAll('.delete-btn[data-type="teacher"]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Удалить преподавателя?')) {
                const index = parseInt(btn.dataset.index);
                const teachers = storage.getTeachers();
                teachers.splice(index, 1);
                storage.saveTeachers(teachers);
                renderTeacherList();
                renderStudentList();
            }
        });
    });
}

function renderStudentList() {
    const container = document.getElementById('studentListContainer');
    const students = storage.getStudents();
    
    if (!container) return;
    
    if (students.length === 0) {
        container.innerHTML = '<div class="empty-message">📭 Нет зарегистрированных студентов</div>';
        return;
    }
    
    container.innerHTML = '<h3>📋 Список студентов:</h3>';
    students.forEach((student, index) => {
        container.innerHTML += `
            <div class="student-item">
                <div>
                    <strong>${student.firstname} ${student.lastname}</strong><br>
                    📧 ${student.email}<br>
                    📖 Группа: ${student.group}<br>
                    👨‍🏫 Куратор: ${student.curator === 'yurich@kodelab.ru' ? 'Юрич' : student.curator}
                </div>
                <button class="delete-btn" data-type="student" data-index="${index}">🗑️ Удалить</button>
            </div>
        `;
    });
    
    document.querySelectorAll('.delete-btn[data-type="student"]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Удалить студента? Это удалит и его оценки!')) {
                const index = parseInt(btn.dataset.index);
                const students = storage.getStudents();
                const deletedStudent = students[index];
                
                // Удаляем оценки студента
                const grades = storage.getGrades();
                if (deletedStudent && grades[deletedStudent.email]) {
                    delete grades[deletedStudent.email];
                    storage.saveGrades(grades);
                }
                
                students.splice(index, 1);
                storage.saveStudents(students);
                renderStudentList();
            }
        });
    });
}

// Модальное окно
const modal = document.getElementById('adminModal');
const adminPanelBtn = document.getElementById('adminPanelBtn');

if (adminPanelBtn) {
    adminPanelBtn.addEventListener('click', () => {
        const admin = storage.getAdmin();
        if (!admin) {
            document.getElementById('adminAuth').style.display = 'block';
            document.getElementById('adminPanel').style.display = 'none';
            document.getElementById('adminSecret').value = '';
            document.getElementById('adminError').textContent = '';
        } else {
            document.getElementById('adminAuth').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            renderTeacherList();
            renderStudentList();
        }
        modal.classList.add('active');
    });
}

// Вход в админку
const adminAuthBtn = document.getElementById('adminAuthBtn');
if (adminAuthBtn) {
    adminAuthBtn.addEventListener('click', () => {
        const secret = document.getElementById('adminSecret').value.trim();
        const errorDiv = document.getElementById('adminError');
        
        if (secret === ADMIN_SECRET) {
            storage.setAdmin({ secret: true });
            document.getElementById('adminAuth').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            renderTeacherList();
            renderStudentList();
            errorDiv.textContent = '';
        } else {
            errorDiv.textContent = '❌ Неверный секретный код!';
        }
    });
}

// Вкладки
const tabs = document.querySelectorAll('.admin-tab');
const teachersTab = document.getElementById('adminTeachersTab');
const studentsTab = document.getElementById('adminStudentsTab');

if (tabs.length) {
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            if (tab.dataset.tab === 'teachers') {
                teachersTab.style.display = 'block';
                studentsTab.style.display = 'none';
                renderTeacherList();
            } else {
                teachersTab.style.display = 'none';
                studentsTab.style.display = 'block';
                renderStudentList();
            }
        });
    });
}

// Закрытие модалки
const closeBtns = ['adminCloseBtn', 'adminClosePanelBtn'];
closeBtns.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
        btn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }
});

// Выход из админки
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
        storage.setAdmin(null);
        modal.classList.remove('active');
    });
}

// Закрытие по клику вне окна
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}