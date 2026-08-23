// ========== ЮРИЧ - ТЕРМИНАЛ ==========
let commandHistory = [];

async function fetchCryptoPrice(symbol) {
    try {
        const url = `https://api.bybit.com/v5/market/tickers?category=spot&symbol=${symbol}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.retCode === 0 && data.result?.list?.length) {
            return data.result.list[0].lastPrice;
        }
        return null;
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

function printToTerminal(text, isError = false) {
    const output = document.getElementById('terminal-output');
    if (!output) return;
    
    const line = document.createElement('div');
    line.className = isError ? 'terminal-line terminal-error' : 'terminal-line';
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function clearTerminal() {
    const output = document.getElementById('terminal-output');
    if (output) output.innerHTML = '';
}

function getStudentsList() {
    const students = storage.getStudents();
    const myStudents = students.filter(s => s.curator === 'yurich@kodelab.ru');
    
    if (myStudents.length === 0) {
        printToTerminal('📭 У вас пока нет студентов');
    } else {
        printToTerminal(`📋 Список моих студентов (${myStudents.length}):`);
        myStudents.forEach(s => {
            printToTerminal(`  • ${s.firstname} ${s.lastname} — группа ${s.group} (${s.email})`);
        });
    }
}

function getAllGrades() {
    const grades = storage.getGrades();
    if (Object.keys(grades).length === 0) {
        printToTerminal('📭 Нет выставленных оценок');
        return;
    }
    
    printToTerminal('📊 Все оценки в системе:');
    for (const [studentEmail, subjects] of Object.entries(grades)) {
        const student = storage.getStudents().find(s => s.email === studentEmail);
        const studentName = student ? `${student.firstname} ${student.lastname}` : studentEmail;
        printToTerminal(`  👨‍🎓 ${studentName}:`);
        for (const [subject, grade] of Object.entries(subjects)) {
            printToTerminal(`      📚 ${subject}: ${grade}`);
        }
    }
}

async function processCommand(cmd) {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    
    commandHistory.push(trimmed);
    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();
    
    switch(command) {
        case 'help':
            printToTerminal('📖 Доступные команды:');
            printToTerminal('  ─────────────────────────────────');
            printToTerminal('  help              - показать эту справку');
            printToTerminal('  clear             - очистить терминал');
            printToTerminal('  ls                - список моих студентов');
            printToTerminal('  grades            - показать все оценки');
            printToTerminal('  btc               - курс BTC/USDT');
            printToTerminal('  eth               - курс ETH/USDT');
            printToTerminal('  sol               - курс SOL/USDT');
            printToTerminal('  whoami            - информация обо мне');
            printToTerminal('  date              - текущая дата и время');
            printToTerminal('  theme light       - светлая тема');
            printToTerminal('  theme dark        - тёмная тема');
            printToTerminal('  exit              - выйти в главное меню');
            printToTerminal('  history           - история команд');
            printToTerminal('  ─────────────────────────────────');
            break;
            
        case 'ls':
            getStudentsList();
            break;
            
        case 'grades':
            getAllGrades();
            break;
            
        case 'clear':
            clearTerminal();
            break;
            
        case 'btc':
            printToTerminal('🔄 Запрос курса BTC/USDT...');
            const btc = await fetchCryptoPrice('BTCUSDT');
            if (btc) printToTerminal(`💰 BTC/USDT: $${parseFloat(btc).toLocaleString()}`);
            else printToTerminal('❌ Ошибка получения курса BTC', true);
            break;
            
        case 'eth':
            printToTerminal('🔄 Запрос курса ETH/USDT...');
            const eth = await fetchCryptoPrice('ETHUSDT');
            if (eth) printToTerminal(`💰 ETH/USDT: $${parseFloat(eth).toLocaleString()}`);
            else printToTerminal('❌ Ошибка получения курса ETH', true);
            break;
            
        case 'sol':
            printToTerminal('🔄 Запрос курса SOL/USDT...');
            const sol = await fetchCryptoPrice('SOLUSDT');
            if (sol) printToTerminal(`💰 SOL/USDT: $${parseFloat(sol).toLocaleString()}`);
            else printToTerminal('❌ Ошибка получения курса SOL', true);
            break;
            
        case 'whoami':
            printToTerminal('👨‍💻 Юрич — 59-летний философ, историк, линуксойд');
            printToTerminal('💪 Бодибилдер, культурный, образованный');
            printToTerminal('👨‍🏫 Куратор группы 1ИСИП9');
            printToTerminal('🦅 Американец по духу, администратор со стажем 20+ лет');
            break;
            
        case 'date':
            const now = new Date();
            printToTerminal(`📅 ${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU')}`);
            break;
            
        case 'theme':
            if (parts[1] === 'light') {
                setTheme('light');
                printToTerminal('🎨 Светлая тема включена');
            } else if (parts[1] === 'dark') {
                setTheme('dark');
                printToTerminal('🎨 Тёмная тема включена');
            } else {
                printToTerminal('❌ Используйте: theme light или theme dark', true);
            }
            break;
            
        case 'history':
            printToTerminal(`📜 История команд (${commandHistory.length}):`);
            commandHistory.forEach((h, i) => {
                printToTerminal(`  ${i+1}. ${h}`);
            });
            break;
            
        case 'exit':
            showMainPage();
            break;
            
        default:
            printToTerminal(`❌ Команда не найдена: ${command}`, true);
            printToTerminal('💡 Введите "help" для списка доступных команд', false);
            break;
    }
}

// Инициализация терминала
const terminalInput = document.getElementById('terminal-input');
if (terminalInput) {
    terminalInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const cmd = terminalInput.value;
            printToTerminal(`yurich@kodelab:~$ ${cmd}`);
            await processCommand(cmd);
            terminalInput.value = '';
        }
    });
    
    document.addEventListener('click', () => {
        if (document.getElementById('yurich-page').style.display === 'flex') {
            terminalInput.focus();
        }
    });
}