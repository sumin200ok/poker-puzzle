// Глобальная константа для названия события
const AFTER_MOVE_EVENT = 'afterMoveEvent';

// Функции для управления popup'ами
function showNewGamePopup() {
    const statsDiv = document.getElementById('gameStats');
    const gameInstance = PokerPuzzle.getInstance();

    if (!gameInstance) {
        console.error('Game instance not found');
        return;
    }
    // Сохраняем рекорд
    const isNewRecord = gameInstance.saveHighScore(gameInstance.score);

    const modeName = gameInstance.mode[0].toUpperCase() + gameInstance.mode.slice(1);

    // Формируем статистику
    let statsHTML = `<div class="stat-item"><span>Current Score</span><span>${gameInstance.score}</span></div>`;
    
    // Показываем информацию о рекорде для текущего режима
    if (isNewRecord) {
        statsHTML += `<div class="stat-item new-record"><span>🏆 NEW ${modeName.toUpperCase()} RECORD!</span><span>${gameInstance.highScore}</span></div>`;
    } else {
        statsHTML += `<div class="stat-item"><span>${modeName} Record</span><span>${gameInstance.highScore}</span></div>`;
    }

    const totalCombos = Object.values(gameInstance.comboStats).reduce((sum, count) => sum + count, 0);
    statsHTML += `<div class="stat-item"><span>Total Combinations</span><span>${totalCombos}</span></div><br>`;

    // Показываем только комбинации, которые были собраны
    for (let combo in gameInstance.comboStats) {
        if (gameInstance.comboStats[combo] > 0) {
            statsHTML += `<div class="stat-item"><span>${combo}</span><span>${gameInstance.comboStats[combo]}</span></div>`;
        }
    }

    statsDiv.innerHTML = statsHTML;
    Popup.show('newGamePopup');
}

function showGamesPopup() {
    Popup.show('gamesPopup');
}

function showTutorialFromHelp() {
    Popup.close();
    if (tutorialSystem) {
        tutorialSystem.showTutorial();
    }
}

// Закрытие popup'ов по клику вне их области
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('popup-overlay')) {
        Popup.close();
    }
});

// Слушатель события после выполнения хода для сохранения состояния
document.addEventListener(AFTER_MOVE_EVENT, function(event) {
    if (event.detail && event.detail.state) {
        // Не сохраняем состояние для режима Rapid
        if (event.detail.state.mode === PokerPuzzle.RAPID_MODE) {
            return;
        }
        
        const gameState = {
            ...event.detail.state,
            timestamp: Date.now()
        };
        localStorage.setItem('pokerPuzzleGameState', JSON.stringify(gameState));
    }
});

// Система обучения (туториал)
let tutorialSystem;

// Запуск игры
window.addEventListener('load', () => {
    PokerPuzzle.startNewGame();
    tutorialSystem = new Tutorial();
}); 