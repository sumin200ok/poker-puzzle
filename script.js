class Tutorial {
    static version = 1;
    
    static steps = [
        {
            version: 1,
            description: 'Welcome to Poker Puzzle 👋 a challenging card game where you create poker combinations to score points. Test your poker skills in this addictive puzzle game!'
        },
        {
            version: 1,
            element: '#game-board',
            description: 'Pick 2 to 5 cards to make a poker hand, but keep your finger on the screen and don\'t go backwards. Give it a try right now 👇'
        },
        {
            version: 1,
            element: '.help-btn',
            description: 'Tap this button to see poker hand hints and bring up this tutorial again 👉'
        },
        {
            version: 1,
            element: '.undo-btn',
            description: 'Tap this button to undo your last move if you make a mistake 👉'
        },
        {
            version: 1,
            element: '.new-game-btn',
            description: 'Tap this button if you want to end the current game (no more poker hands available) or check your combination stats 👉'
        },
        {
            version: 1,
            element: '.score-display',
            description: 'Here\'s your current game score! The stars show how many achievements you\'ve unlocked. Tap here to view all your achievements 👉 <br>Collect all achievements to unlock 🌟two super games🌟'
        },
        {
            version: 1,
            description: 'Congratulations 🎉 Now you know the basics of the game. Good luck in Poker Puzzle!'
        }
    ];

    constructor() {
        this.currentStep = 0;
        this.tooltip = null;
        this.navigation = null;
        this.currentTarget = null;
        this.filteredSteps = [];
        this.init();
    }

    init() {
        // Получаем сохраненную версию туториала
        const savedVersion = parseInt(localStorage.getItem('tutorialVersion')) || 0;

        if (Tutorial.version <= savedVersion) {
            return;
        }

        // Фильтруем шаги, показывая только те, которые новее сохраненной версии
        this.filteredSteps = Tutorial.steps.filter(step => step.version > savedVersion);
        
        // Если нет новых шагов, не показываем туториал
        if (this.filteredSteps.length === 0) {
            return;
        }

        // Небольшая задержка для полной загрузки игры
        setTimeout(() => {
            this.createTooltip();
            this.createNavigation();
            this.showStep(0);
        }, 500);
    }

    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tutorial-tooltip';
        const boardRect = document.getElementById("game-board").getBoundingClientRect()
        this.tooltip.style.width = (boardRect.width - 20) + "px";
        document.body.appendChild(this.tooltip);
    }

    createNavigation() {
        this.navigation = document.createElement('div');
        this.navigation.className = 'tutorial-navigation';

        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Prev';
        prevBtn.className = 'btn-prev';
        prevBtn.onclick = () => this.prevStep();

        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next&nbsp;Hint';
        nextBtn.className = 'btn-next';
        nextBtn.onclick = () => this.nextStep();

        this.navigation.appendChild(prevBtn);
        this.navigation.appendChild(nextBtn);
        document.body.appendChild(this.navigation);
    }

    showStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.filteredSteps.length) {
            this.endTutorial();
            return;
        }

        this.currentStep = stepIndex;
        const step = this.filteredSteps[stepIndex];

        // Показываем навигацию
        this.navigation.style.display = 'flex';

        // Проверяем, есть ли целевой элемент
        let targetElement = null;
        if (step.element) {
            targetElement = document.querySelector(step.element);
            if (!targetElement) {
                console.warn(`Tutorial step ${stepIndex}: Element ${step.element} not found`);
                this.nextStep();
                return;
            }
        }

        // Показываем подсказку и подсвечиваем элемент (если есть)
        this.showTooltip(targetElement, step.description);

        // Обновляем кнопки навигации
        this.updateNavigationButtons();
    }

    showTooltip(targetElement, description) {
        this.tooltip.innerHTML = description;
        this.tooltip.style.visibility = 'visible';

        // Оцениваем размер tooltip'а (примерно)
        const estimatedWidth = 300;
        const estimatedHeight = 80;

        // Очищаем предыдущую подсветку
        this.clearHighlight();
        this.positionTooltip(targetElement, this.tooltip);
        if (targetElement) {
            this.highlightTargetElement(targetElement);
        }
    }

    positionTooltip(targetElement, tooltip) {
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        if (!targetElement) {
            tooltip.style.left = (viewport.width/2 - tooltipRect.width / 2)+"px";
            tooltip.style.top = (viewport.height/2 - tooltipRect.height / 2)+"px";
            return
        }

        const targetRect = targetElement.getBoundingClientRect();

        const spacing = 8; // отступ от элемента

        if (targetRect.width > tooltipRect.width && targetRect.height > tooltipRect.height) {
            tooltip.style.top = (targetRect.top + spacing)+"px";
            tooltip.style.left = (targetRect.left + targetRect.width / 2 - tooltipRect.width / 2)+"px";
            return;
        }

        if (targetRect.left - tooltipRect.width - spacing > 0) {
            tooltip.style.left = (targetRect.left - tooltipRect.width - spacing)+"px";
            tooltip.style.top = (targetRect.top)+"px";
            return
        }

        // fallback
        tooltip.style.left = (viewport.width/2 - tooltipRect.width / 2)+"px";
        tooltip.style.top = (viewport.height/2 - tooltipRect.height / 2)+"px";
    }

    highlightTargetElement(targetElement) {
        // Сохраняем ссылку на целевой элемент
        this.currentTarget = targetElement;
        
        // Если есть целевой элемент, подсвечиваем его
        if (targetElement) {
            // Добавляем класс подсветки
            targetElement.classList.add('tutorial-highlight');
        }
    }

    clearHighlight() {
        // Удаляем подсветку с предыдущего элемента
        if (this.currentTarget) {
            this.currentTarget.classList.remove('tutorial-highlight');
        }
    }

    updateNavigationButtons() {
        const buttons = this.navigation.querySelectorAll('button');
        const prevBtn = buttons[0];
        const nextBtn = buttons[1];

        prevBtn.disabled = this.currentStep === 0;
        prevBtn.style.opacity = this.currentStep === 0 ? '0.5' : '1';

        if (this.currentStep === this.filteredSteps.length - 1) {
            nextBtn.innerHTML = 'Finish';
        } else {
            nextBtn.innerHTML = 'Next&nbsp;Hint';
        }
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }

    nextStep() {
        if (this.currentStep < this.filteredSteps.length - 1) {
            this.showStep(this.currentStep + 1);
        } else {
            this.endTutorial();
        }
    }

    endTutorial() {
        // Сохраняем текущую версию туториала
        localStorage.setItem('tutorialVersion', Tutorial.version.toString());
        this.cleanup();
    }

    // Метод для принудительного показа учебника (например, из меню помощи)
    showTutorial() {
        // Очищаем предыдущие элементы, если они есть
        this.cleanup();
        
        // Удаляем сохраненную версию, чтобы показать все шаги
        localStorage.removeItem('tutorialVersion');
        this.init();
    }

    cleanup() {
        // Очищаем подсветку
        this.clearHighlight();
        
        // Удаляем существующие элементы учебника
        if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.parentNode.removeChild(this.tooltip);
        }
        if (this.navigation && this.navigation.parentNode) {
            this.navigation.parentNode.removeChild(this.navigation);
        }
        
        this.tooltip = null;
        this.navigation = null;
        this.currentTarget = null;
    }
}

class Combinations {
    // Коды комбинаций для универсального использования
    static ROYAL_FLUSH = 'ROYAL_FLUSH';
    static STRAIGHT_FLUSH = 'STRAIGHT_FLUSH';
    static FOUR_OF_A_KIND = 'FOUR_OF_A_KIND';
    static FULL_HOUSE = 'FULL_HOUSE';
    static FLUSH = 'FLUSH';
    static STRAIGHT = 'STRAIGHT';
    static THREE_OF_A_KIND = 'THREE_OF_A_KIND';
    static TWO_PAIR = 'TWO_PAIR';
    static PAIR = 'PAIR';

    // Ассоциативный массив комбинаций
    static combos = {
        [Combinations.ROYAL_FLUSH]: { code: Combinations.ROYAL_FLUSH, name: 'Royal Flush', points: 1000, check: Combinations.isRoyalFlush.bind(Combinations) },
        [Combinations.STRAIGHT_FLUSH]: { code: Combinations.STRAIGHT_FLUSH, name: 'Straight Flush', points: 500, check: Combinations.isStraightFlush.bind(Combinations) },
        [Combinations.FOUR_OF_A_KIND]: { code: Combinations.FOUR_OF_A_KIND, name: 'Four of a Kind', points: 200, check: Combinations.isFourOfAKind.bind(Combinations) },
        [Combinations.FULL_HOUSE]: { code: Combinations.FULL_HOUSE, name: 'Full House', points: 100, check: Combinations.isFullHouse.bind(Combinations) },
        [Combinations.FLUSH]: { code: Combinations.FLUSH, name: 'Flush', points: 80, check: Combinations.isFlush.bind(Combinations) },
        [Combinations.STRAIGHT]: { code: Combinations.STRAIGHT, name: 'Straight', points: 60, check: Combinations.isStraight.bind(Combinations) },
        [Combinations.THREE_OF_A_KIND]: { code: Combinations.THREE_OF_A_KIND, name: 'Three of a Kind', points: 40, check: Combinations.isThreeOfAKind.bind(Combinations) },
        [Combinations.TWO_PAIR]: { code: Combinations.TWO_PAIR, name: 'Two Pair', points: 30, check: Combinations.isTwoPair.bind(Combinations) },
        [Combinations.PAIR]: { code: Combinations.PAIR, name: 'Pair', points: 10, check: Combinations.isPair.bind(Combinations) }
    };

    static getCombo(code) {
        return this.combos[code] || null;
    }

    static checkPokerHand(cards) {
        // Проверяем комбинации в порядке убывания очков
        const comboOrder = [
            this.ROYAL_FLUSH,
            this.STRAIGHT_FLUSH,
            this.FOUR_OF_A_KIND,
            this.FULL_HOUSE,
            this.FLUSH,
            this.STRAIGHT,
            this.THREE_OF_A_KIND,
            this.TWO_PAIR,
            this.PAIR
        ];

        for (let comboCode of comboOrder) {
            const combo = this.combos[comboCode];
            const winningIndices = combo.check(cards);
            if (winningIndices && winningIndices.length > 0) {
                return {
                    combo: combo,
                    winningCardIndices: winningIndices
                };
            }
        }
        return null;
    }

    static getRankValue(rank) {
        if (rank === 'A') return 1;
        if (rank === 'J') return 11;
        if (rank === 'Q') return 12;
        if (rank === 'K') return 13;
        return parseInt(rank);
    }

    static getRankCounts(cards) {
        const counts = {};
        cards.forEach(cardData => {
            const rank = cardData.card.rank;
            if (!counts[rank]) counts[rank] = [];
            counts[rank].push(cardData.index);
        });
        return counts;
    }

    static isRoyalFlush(cards) {
        if (cards.length !== 5) return false;
        const royalRanks = ['10', 'J', 'Q', 'K', 'A'];
        const ranks = cards.map(c => c.card.rank);
        const suits = [...new Set(cards.map(c => c.card.suit))];

        if (suits.length === 1 &&
            JSON.stringify(ranks.sort()) === JSON.stringify(royalRanks.sort())) {
            return cards.map(c => c.index);
        }
        return false;
    }

    static isStraightFlush(cards) {
        if (cards.length !== 5) return false;
        const flushIndices = this.isFlush(cards);
        const straightIndices = this.isStraight(cards);
        if (flushIndices && straightIndices && flushIndices.length === 5 && straightIndices.length === 5) {
            return cards.map(c => c.index);
        }
        return false;
    }

    static isFourOfAKind(cards) {
        if (cards.length < 4) return false;
        const counts = this.getRankCounts(cards);
        for (let rank in counts) {
            if (counts[rank].length >= 4) {
                return counts[rank].slice(0, 4);
            }
        }
        return false;
    }

    static isFullHouse(cards) {
        if (cards.length !== 5) return false;
        const counts = this.getRankCounts(cards);
        const ranks = Object.keys(counts);
        let threeIndices = null;
        let pairIndices = null;

        for (let rank of ranks) {
            if (counts[rank].length === 3) {
                threeIndices = counts[rank];
            } else if (counts[rank].length === 2) {
                pairIndices = counts[rank];
            }
        }

        if (threeIndices && pairIndices) {
            return [...threeIndices, ...pairIndices];
        }
        return false;
    }

    static isFlush(cards) {
        if (cards.length < 5) return false;
        const suits = [...new Set(cards.map(c => c.card.suit))];
        if (suits.length === 1) {
            return cards.map(c => c.index);
        }
        return false;
    }

    static isStraight(cards) {
        if (cards.length < 5) return false;
        const sortedCards = cards.sort((a, b) => this.getRankValue(a.card.rank) - this.getRankValue(b.card.rank));
        const values = sortedCards.map(c => this.getRankValue(c.card.rank));

        // Проверяем обычный стрит
        let isStraight = true;
        for (let i = 1; i < values.length; i++) {
            if (values[i] !== values[i-1] + 1) {
                // Проверяем стрит с тузом в конце (10, J, Q, K, A)
                if (JSON.stringify(values) === JSON.stringify([1, 10, 11, 12, 13])) {
                    return sortedCards.map(c => c.index);
                }
                isStraight = false;
                break;
            }
        }

        if (isStraight) {
            return sortedCards.map(c => c.index);
        }
        return false;
    }

    static isThreeOfAKind(cards) {
        if (cards.length < 3) return false;
        const counts = this.getRankCounts(cards);
        for (let rank in counts) {
            if (counts[rank].length >= 3) {
                return counts[rank].slice(0, 3);
            }
        }
        return false;
    }

    static isTwoPair(cards) {
        if (cards.length < 4) return false;
        const counts = this.getRankCounts(cards);
        const pairs = [];
        for (let rank in counts) {
            if (counts[rank].length >= 2) {
                pairs.push(...counts[rank].slice(0, 2));
            }
        }
        if (pairs.length >= 4) {
            return pairs.slice(0, 4);
        }
        return false;
    }

    static isPair(cards) {
        if (cards.length < 2) return false;
        const counts = this.getRankCounts(cards);
        for (let rank in counts) {
            if (counts[rank].length >= 2) {
                return counts[rank].slice(0, 2);
            }
        }
        return false;
    }
}

class Achievements {
    constructor() {
        this.achievements = this.loadAchievements();
        this.updateAchievementsDisplay();
        this.setupEventListeners();
    }

    loadAchievements() {
        const saved = localStorage.getItem('pokerPuzzleAchievements');
        return saved !== null ? JSON.parse(saved) : {
            'royal-flush': false,
            'straight-flush': false,
            'four-of-a-kind': false,
            'full-house': false,
            'flush': false
        };
    }

    saveAchievements() {
        localStorage.setItem('pokerPuzzleAchievements', JSON.stringify(this.achievements));
    }

    setupEventListeners() {
        document.addEventListener(AFTER_MOVE_EVENT, (event) => {
            if (event.detail && event.detail.state && event.detail.state.comboStats) {
                this.checkAchievements(event.detail.state.comboStats);
            }
        });
    }

    checkAchievements(comboStats) {
        const conditions = {
            'royal-flush': () => comboStats['Royal Flush'] >= 1,
            'straight-flush': () => comboStats['Straight Flush'] >= 1,
            'four-of-a-kind': () => comboStats['Four of a Kind'] >= 2,
            'full-house': () => comboStats['Full House'] >= 3,
            'flush': () => comboStats['Flush'] >= 3
        };

        for (let achievement in conditions) {
            if (!this.achievements[achievement] && conditions[achievement]()) {
                this.unlockAchievement(achievement);
                this.updateAchievementsDisplay();
            }
        }
    }

    unlockAchievement(achievementKey) {
        this.achievements[achievementKey] = true;
        this.saveAchievements();
        this.showAchievementUnlocked(achievementKey);
    }

    showAchievementUnlocked(achievementKey) {
        const achievementNames = {
            'royal-flush': 'Royal Flush',
            'straight-flush': 'Straight Flush',
            'four-of-a-kind': 'Quad 2 times',
            'full-house': 'Full House 3 times',
            'flush': 'Flush 3 times'
        };

        const banner = document.createElement('div');
        banner.className = 'combo-banner achievement-unlocked';
        banner.innerHTML = `
            <div>🏆Achievement Unlocked!</div>
            <div style="font-size: 16px; margin-top: 5px;">${achievementNames[achievementKey]}</div>
        `;
        banner.style.background = 'linear-gradient(45deg, #ffc107, #ff9800)';
        
        document.querySelector('.game-container').appendChild(banner);
        
        setTimeout(() => {
            banner.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            if (banner.parentNode) {
                banner.parentNode.removeChild(banner);
            }
        }, 4500);
    }

    updateAchievementsDisplay() {
        const achievementItems = document.querySelectorAll('.achievement-item');
        achievementItems.forEach(item => {
            const achievementKey = item.dataset.achievement;
            // Сначала убираем все классы unlocked
            item.classList.remove('unlocked');
            // Затем добавляем класс только для разблокированных достижений
            if (this.achievements[achievementKey]) {
                item.classList.add('unlocked');
            }
        });
        // Обновляем звездочки на кнопке
        this.updateAchievementsButton();
        // Обновляем рекорд в попапе
        this.updateAchievementsHighScore();
    }

    updateAchievementsButton() {
        const buttonElement = document.getElementById('achievementsBtn');
        if (!buttonElement) return;

        const totalAchievements = 5;
        const unlockedCount = Object.values(this.achievements).filter(unlocked => unlocked).length;
        
        let buttonHTML = '';
        for (let i = 0; i < totalAchievements; i++) {
            if (i < unlockedCount) {
                buttonHTML += '★'; // Золотая звезда
            } else {
                buttonHTML += '☆'; // Пустая звезда
            }
        }
        buttonElement.innerHTML = buttonHTML;
        const superGame = document.getElementById('superGame');
        if (!superGame) return;
        if (true) {
            superGame.innerHTML = '<button class="btn nightmare-btn" onclick="PokerPuzzle.startNewGame(PokerPuzzle.NIGHTMARE_MODE)">Nightmare</button><button class="btn rapid-btn" onclick="PokerPuzzle.startNewGame(PokerPuzzle.RAPID_MODE)">Rapid</button>';
        }
    }

    updateAchievementsHighScore() {
        const gameInstance = PokerPuzzle.getInstance();
        if (!gameInstance) return;
        
        const highScoreElement = document.getElementById('achievementsHighScore');
        if (highScoreElement) {
            highScoreElement.textContent = gameInstance.highScore;
        }
        const lastRecordElement = document.getElementById('achievementsLastRecord');
        if (gameInstance.highScore > 0) {
            lastRecordElement.classList.add('active')
        } else {
            lastRecordElement.classList.remove('active')
        }
    }
}

class PokerPuzzle {
    static DEFAULT_MODE = 'default';
    static RAPID_MODE = 'rapid';
    static NIGHTMARE_MODE = 'nightmare';
    
    static instance = null;
    static eventListenersSetup = false; // Флаг для отслеживания установки обработчиков
    
    // Статический массив стилей дизайна карт
    static designs = ['', 'design1', 'design2', 'design4'];
    static currentDesignIndex = 0;

    constructor(options = {}) {
        this.board = [];
        this.selectedCards = [];
        this.score = 0;
        this.isSelecting = false;
        this.suits = ['♠', '♥', '♦', '♣'];
        this.ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.rows = 9;
        this.cols = 6;
        this.comboStats = {}; // Добавляем статистику комбинаций
        this.highScore = this.loadHighScore(); // Загружаем рекорд
        this.moveHistory = []; // История ходов для отмены
        this.mode = options.mode || PokerPuzzle.DEFAULT_MODE;
        this.rapidTimer = null; // Таймер для режима Rapid
        this.rapidTimeLeft = 60; // Время в секундах для режима Rapid
        
        this.init();
    }
    
    static startNewGame(mode = PokerPuzzle.DEFAULT_MODE) {
        // Останавливаем таймер если он запущен
        if (PokerPuzzle.instance && PokerPuzzle.instance.rapidTimer) {
            PokerPuzzle.instance.stopRapidTimer();
        }
        
        // Очищаем сохраненное состояние игры из localStorage
        localStorage.removeItem('pokerPuzzleGameState');
        
        // Создаем новый экземпляр игры
        PokerPuzzle.instance = new PokerPuzzle({ mode: mode });
        
        // Закрываем popup достижений если он открыт
        Popup.close();
        
        return PokerPuzzle.instance;
    }
    
    static getInstance() {
        if (!PokerPuzzle.instance) {
            return null;
        }
        return PokerPuzzle.instance;
    }
    
    static switchDesign() {
        // Переключаем на следующий дизайн по кругу
        PokerPuzzle.currentDesignIndex = (PokerPuzzle.currentDesignIndex + 1) % PokerPuzzle.designs.length;
        
        // Получаем элемент game-board и устанавливаем атрибут data-design
        const gameBoard = document.getElementById('game-board');
        if (gameBoard) {
            gameBoard.setAttribute('data-design', PokerPuzzle.designs[PokerPuzzle.currentDesignIndex]);
        }
        
        // Сохраняем выбранный дизайн в localStorage
        localStorage.setItem('pokerPuzzleDesignIndex', PokerPuzzle.currentDesignIndex.toString());
    }
    
    static loadDesignFromLocalStorage() {
        const savedDesignIndex = localStorage.getItem('pokerPuzzleDesignIndex');
        if (savedDesignIndex !== null) {
            const designIndex = parseInt(savedDesignIndex);
            if (designIndex >= 0 && designIndex < PokerPuzzle.designs.length) {
                PokerPuzzle.currentDesignIndex = designIndex;
            }
        }
    }

    init() {
        // Загружаем сохраненный дизайн
        PokerPuzzle.loadDesignFromLocalStorage();
        
        // Пытаемся загрузить сохраненное состояние
        const loaded = this.loadGameFromLocalStorage();
        
        if (!loaded) {
            // Если не удалось загрузить, создаем новую игру
            this.createDeck();
            this.initComboStats();
        }
        
        // Инициализируем текущий дизайн
        const gameBoard = document.getElementById('game-board');
        if (gameBoard) {
            gameBoard.setAttribute('data-design', PokerPuzzle.designs[PokerPuzzle.currentDesignIndex]);
        }
        
        this.renderBoard();
        
        // Устанавливаем обработчики событий только один раз
        if (!PokerPuzzle.eventListenersSetup) {
            this.setupEventListeners();
            PokerPuzzle.eventListenersSetup = true;
        }
        
        this.updateHighScoreDisplay(); // Обновляем отображение рекорда
        this.updateUndoButton(); // Инициализируем кнопку Undo
        
        this.updateScore();
        
        // Запускаем таймер если в режиме Rapid
        if (this.mode === PokerPuzzle.RAPID_MODE) {
            this.startRapidTimer();
        }
    }

    initComboStats() {
        const combos = ['Royal Flush', 'Straight Flush', 'Four of a Kind', 'Full House',
            'Flush', 'Straight', 'Three of a Kind', 'Two Pair', 'Pair'];
        combos.forEach(combo => {
            this.comboStats[combo] = 0;
        });
    }

    getState() {
        return {
            board: JSON.parse(JSON.stringify(this.board)),
            score: this.score,
            rows: this.rows,
            cols: this.cols,
            comboStats: JSON.parse(JSON.stringify(this.comboStats)),
            mode: this.mode
        };
    }

    saveGameState() {
        const gameState = this.getState();
        this.moveHistory.push(gameState);

        if (this.moveHistory.length > 1) {
            this.moveHistory.shift();
        }
        
        this.updateUndoButton();
    }

    updateUndoButton() {
        const undoBtn = document.getElementById('undoBtn');
        if (undoBtn) {
            undoBtn.disabled = this.moveHistory.length === 0;
        }
    }

    undoLastMove() {
        if (this.moveHistory.length === 0) return;
        
        const lastState = this.moveHistory.pop();
        
        // Восстанавливаем состояние игры
        this.board = lastState.board;
        this.score = lastState.score;
        this.rows = lastState.rows;
        this.cols = lastState.cols;
        this.comboStats = lastState.comboStats;
        this.mode = lastState.mode || PokerPuzzle.DEFAULT_MODE;
        
        // Очищаем выбранные карты
        this.selectedCards = [];
        this.isSelecting = false;
        
        // Обновляем отображение
        this.renderBoard();
        this.updateSelection();
        
        this.updateScore();
        
        this.updateUndoButton();

        // Показываем анимацию отмены
        this.showUndoAnimation();

        // AFTER MOVE EVENT после Undo
        const afterEvent = new CustomEvent(AFTER_MOVE_EVENT, { detail: { state: this.getState() } });
        document.dispatchEvent(afterEvent);
    }

    showUndoAnimation() {
        const banner = document.createElement('div');
        banner.className = 'combo-banner';
        banner.textContent = 'Undo!';
        banner.style.background = 'linear-gradient(45deg, #ff9800, #f57c00)';
        
        document.querySelector('.game-container').appendChild(banner);
        
        setTimeout(() => {
            banner.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            if (banner.parentNode) {
                banner.parentNode.removeChild(banner);
            }
        }, 1500);
    }

    createDeck() {
        const deck = [];
        for (let suit of this.suits) {
            for (let rank of this.ranks) {
                deck.push({ suit, rank });
            }
        }

        // Перемешиваем колоду
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        // Создаем массив всех позиций на доске
        const totalPositions = this.rows * this.cols; // 54 позиции
        const positions = [];
        for (let i = 0; i < totalPositions; i++) {
            positions.push(i);
        }

        // Перемешиваем позиции
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        // Инициализируем доску пустыми значениями
        this.board = new Array(totalPositions).fill(null);

        // Размещаем 52 карты в случайных позициях (первые 52 перемешанные позиции)
        for (let i = 0; i < deck.length && i < 52; i++) {
            const position = positions[i];
            this.board[position] = deck[i];
        }

        // Оставшиеся 2 позиции остаются пустыми (null)
    }

    renderBoard() {
        const boardElement = document.getElementById('game-board');
        boardElement.innerHTML = '';

        boardElement.style.setProperty('--cols', this.cols);

        this.viewNightmareMode();
        this.viewRapidMode();

        this.board.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.index = index;

            if (card) {
                const isRed = card.suit === '♥' || card.suit === '♦';
                cardElement.classList.add(isRed ? 'red' : 'black');

                cardElement.innerHTML = `
                    <div class="card-rank-top">${card.rank}</div>
                    <div class="card-suit-center">${card.suit}</div>
                    <div class="card-rank-bottom">${card.rank}</div>
                `;
            } else {
                cardElement.style.visibility = 'hidden';
            }

            boardElement.appendChild(cardElement);
        });
    }

    viewNightmareMode() {
        const boardElement = document.getElementById('gameContainer');
        // Добавляем индикатор режима Nightmare
        if (this.mode === PokerPuzzle.NIGHTMARE_MODE) {
            boardElement.classList.add('nightmare');
        } else {
            boardElement.classList.remove('nightmare');
        }
    }

    viewRapidMode() {
        const boardElement = document.getElementById('gameContainer');
        // Добавляем индикатор режима Rapid
        if (this.mode === PokerPuzzle.RAPID_MODE) {
            boardElement.classList.add('rapid');
        } else {
            boardElement.classList.remove('rapid');
        }
    }

    startRapidTimer() {
        if (this.mode !== PokerPuzzle.RAPID_MODE) return;
        
        this.rapidTimeLeft = 60;
        this.updateScore();
        this.stopRapidTimer();
        
        this.rapidTimer = setInterval(() => {
            this.rapidTimeLeft--;
            this.updateScore();
            
            if (this.rapidTimeLeft <= 0) {
                this.endRapidMode();
            }
        }, 1000);
    }

    stopRapidTimer() {
        if (this.rapidTimer) {
            clearInterval(this.rapidTimer);
            this.rapidTimer = null;
        }
    }

    updateScore() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            if (this.mode === PokerPuzzle.RAPID_MODE && this.rapidTimeLeft > 0) {
                scoreElement.textContent = '⏱ ' + this.rapidTimeLeft;
            } else {
                scoreElement.textContent = this.score;
            }
        }
    }

    endRapidMode() {
        this.stopRapidTimer();
        this.moveHistory = [];
        this.updateUndoButton();
        // Показываем финальный счет
        this.updateScore();
        // Показываем анимацию окончания времени
        this.showTimeUpAnimation();
    }

    showTimeUpAnimation() {
        // Очищаем игровую доску
        this.clearBoard();

        const banner = document.createElement('div');
        banner.className = 'combo-banner';
        banner.style.background = 'linear-gradient(45deg, #ff6b6b, #ee5a24)';
        banner.textContent = "⌛ Time's Up!";

        const points = document.createElement('div');
        points.style.fontSize = '16px';
        points.style.marginTop = '5px';
        points.textContent = `Final Score: ${this.score}`;
        banner.appendChild(points);

        document.querySelector('.game-container').appendChild(banner);

        setTimeout(() => {
            banner.classList.add('show');
        }, 10);

        setTimeout(() => {
            if (banner.parentNode) {
                banner.parentNode.removeChild(banner);
            }
            showNewGamePopup();
        }, 2000);
    }

    clearBoard() {
        // Очищаем доску, устанавливая все позиции в null
        for (let i = 0; i < this.board.length; i++) {
            this.board[i] = null;
        }
        
        // Перерисовываем доску
        this.renderBoard();
    }

    findEmptyColumns() {
        const emptyColumns = [];

        for (let col = 0; col < this.cols; col++) {
            let isEmpty = true;

            // Проверяем всю колонку
            for (let row = 0; row < this.rows; row++) {
                const index = row * this.cols + col;
                if (this.board[index] !== null) {
                    isEmpty = false;
                    break;
                }
            }

            if (isEmpty) {
                emptyColumns.push(col);
            }
        }

        return emptyColumns;
    }

    findEmptyRows() {
        const emptyRows = [];

        for (let row = 0; row < this.rows; row++) {
            let isEmpty = true;

            // Проверяем всю строку
            for (let col = 0; col < this.cols; col++) {
                const index = row * this.cols + col;
                if (this.board[index] !== null) {
                    isEmpty = false;
                    break;
                }
            }

            if (isEmpty) {
                emptyRows.push(row);
            }
        }

        return emptyRows;
    }

    removeEmptyColumns() {
        const emptyColumns = this.findEmptyColumns();

        if (emptyColumns.length === 0) {
            return false; // Нет пустых колонок
        }

        // Создаем новую доску без пустых колонок
        const newBoard = [];
        const newCols = this.cols - emptyColumns.length;

        // Копируем данные, пропуская пустые колонки
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!emptyColumns.includes(col)) {
                    const oldIndex = row * this.cols + col;
                    newBoard.push(this.board[oldIndex]);
                }
            }
        }

        // Обновляем размеры поля
        this.cols = newCols;
        this.board = newBoard;

        return true; // Колонки были удалены
    }

    removeEmptyRows() {
        const emptyRows = this.findEmptyRows();

        if (emptyRows.length === 0) {
            return false; // Нет пустых строк
        }

        // Создаем новую доску без пустых строк
        const newBoard = [];
        const newRows = this.rows - emptyRows.length;

        // Копируем данные, пропуская пустые строки
        for (let row = 0; row < this.rows; row++) {
            if (!emptyRows.includes(row)) {
                for (let col = 0; col < this.cols; col++) {
                    const oldIndex = row * this.cols + col;
                    newBoard.push(this.board[oldIndex]);
                }
            }
        }

        // Обновляем размеры поля
        this.rows = newRows;
        this.board = newBoard;

        return true; // Строки были удалены
    }

    animateColumnRemoval() {
        return new Promise((resolve) => {
            const emptyColumns = this.findEmptyColumns();

            if (emptyColumns.length === 0) {
                resolve();
                return;
            }

            // Подсвечиваем пустые колонки перед удалением
            emptyColumns.forEach(col => {
                for (let row = 0; row < this.rows; row++) {
                    const index = row * this.cols + col;
                    const cardElement = document.querySelector(`[data-index="${index}"]`);
                    if (cardElement) {
                        cardElement.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
                        cardElement.style.transition = 'all 0.5s ease';
                    }
                }
            });

            // Удаляем колонки через небольшую задержку
            setTimeout(() => {
                this.removeEmptyColumns();
                this.renderBoard();
                resolve();
            }, 500);
        });
    }

    animateRowRemoval() {
        return new Promise((resolve) => {
            const emptyRows = this.findEmptyRows();

            if (emptyRows.length === 0) {
                resolve();
                return;
            }

            // Подсвечиваем пустые строки перед удалением
            emptyRows.forEach(row => {
                for (let col = 0; col < this.cols; col++) {
                    const index = row * this.cols + col;
                    const cardElement = document.querySelector(`[data-index="${index}"]`);
                    if (cardElement) {
                        cardElement.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';
                        cardElement.style.transition = 'all 0.5s ease';
                    }
                }
            });

            // Удаляем строки через небольшую задержку
            setTimeout(() => {
                this.removeEmptyRows();
                this.renderBoard();
                resolve();
            }, 500);
        });
    }

    applyGravity() {
        // Применяем гравитацию по колонкам
        for (let col = 0; col < this.cols; col++) {
            const column = [];

            // Собираем все карты из колонки (снизу вверх)
            for (let row = this.rows - 1; row >= 0; row--) {
                const index = row * this.cols + col;
                if (this.board[index]) {
                    column.push(this.board[index]);
                }
            }

            // Очищаем всю колонку
            for (let row = 0; row < this.rows; row++) {
                const index = row * this.cols + col;
                this.board[index] = null;
            }

            // Размещаем карты снизу вверх
            for (let i = 0; i < column.length; i++) {
                const targetRow = this.rows - 1 - i; // Начинаем с нижней строки
                const targetIndex = targetRow * this.cols + col;
                this.board[targetIndex] = column[i];
            }
        }
    }

    async animateGravity() {
        // Применяем гравитацию к данным
        this.applyGravity();

        // Перерисовываем доску с анимацией
        setTimeout(() => {
            this.renderBoard();
        }, 100);

        // Проверяем и удаляем пустые строки и колонки после гравитации
        await this.animateRowRemoval();
        await this.animateColumnRemoval();
    }

    // Перемешивает оставшиеся карты на поле
    shuffleRemainingCards() {
        // Собираем все оставшиеся карты (не null)
        const remainingCards = this.board.filter(card => card !== null);
        
        if (remainingCards.length <= 1) {
            return; // Нечего перемешивать
        }

        // Перемешиваем карты
        for (let i = remainingCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [remainingCards[i], remainingCards[j]] = [remainingCards[j], remainingCards[i]];
        }

        // Создаем новые позиции для карт
        const positions = [];
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] !== null) {
                positions.push(i);
            }
        }

        // Перемешиваем позиции
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        // Размещаем карты в новых позициях
        let cardIndex = 0;
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] !== null) {
                this.board[i] = remainingCards[cardIndex];
                cardIndex++;
            }
        }
    }

    // Анимированное перемешивание карт
    async animateShuffle() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const cards = document.querySelectorAll('.card');
                cards.forEach((card, index) => {
                    if (card.style.visibility !== 'hidden') {
                        card.classList.add('shuffling');
                    }
                });
            }, 200);

            // Перемешиваем карты
            setTimeout(() => {
                this.shuffleRemainingCards();
                this.renderBoard();
                
                setTimeout(() => {
                    const cards = document.querySelectorAll('.card');
                    cards.forEach(card => {
                        card.classList.remove('shuffling');
                    });
                }, 500);

                resolve();
            }, 700);
        });
    }

    setupEventListeners() {
        const board = document.getElementById('game-board');

        // Мышь события
        board.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const game = PokerPuzzle.getInstance();
            if (game) game.startSelection(e);
        });

        board.addEventListener('mouseover', (e) => {
            const game = PokerPuzzle.getInstance();
            if (game && game.isSelecting) {
                game.continueSelection(e);
            }
        });

        document.addEventListener('mouseup', () => {
            const game = PokerPuzzle.getInstance();
            if (game && game.isSelecting) {
                game.endSelection();
            }
        });

        // Тач события
        board.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            if (element) {
                const game = PokerPuzzle.getInstance();
                if (game) game.startSelection({ target: element });
            }
        }, { passive: false });

        board.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const game = PokerPuzzle.getInstance();
            if (game && game.isSelecting) {
                const touch = e.touches[0];
                const element = document.elementFromPoint(touch.clientX, touch.clientY);
                if (element) {
                    game.continueSelection({ target: element });
                }
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            const game = PokerPuzzle.getInstance();
            if (game && game.isSelecting) {
                e.preventDefault();
                game.endSelection();
            }
        }, { passive: false });
    }

    startSelection(e) {
        const target = e.target.closest('.card');
        if (!target || !this.board[target.dataset.index]) return;

        const index = parseInt(target.dataset.index);
        this.isSelecting = true;
        this.selectedCards = [index];
        this.updateSelection();
    }

    continueSelection(e) {
        if (!this.isSelecting) return;

        const target = e.target.closest('.card');
        if (!target || !this.board[target.dataset.index]) return;

        const index = parseInt(target.dataset.index);
        const lastIndex = this.selectedCards[this.selectedCards.length - 1];

        // Проверяем, не выбрана ли уже эта карта
        if (this.selectedCards.includes(index)) return;

        // Проверяем смежность
        if (!this.isAdjacent(lastIndex, index)) return;

        // Ограничиваем до 5 карт
        if (this.selectedCards.length >= 5) return;

        this.selectedCards.push(index);
        this.updateSelection();
    }

    async endSelection() {
        if (!this.isSelecting) return;

        this.isSelecting = false;

        if (this.selectedCards.length >= 2) {
            const comboResult = this.checkPokerHand();
            if (comboResult) {
                // Сохраняем состояние перед выполнением хода
                this.saveGameState();

                // BEFORE MOVE EVENT
                const beforeEvent = new CustomEvent(BEFORE_MOVE_EVENT, { detail: { state: this.getState() } });
                document.dispatchEvent(beforeEvent);

                this.showWinningCombo(comboResult.combo);
                this.score += comboResult.combo.points;

                // Показываем какие карты выиграли, а какие нет
                this.highlightWinningCards(comboResult.winningCardIndices);

                this.createConfetti();

                // Обновляем статистику
                this.comboStats[comboResult.combo.name]++;

                // Удаляем только выигрышные карты после завершения анимации
                setTimeout(async () => {
                    this.removeWinningCards(comboResult.winningCardIndices);
                    this.selectedCards = [];
                    this.updateSelection();

                    // Применяем гравитацию и удаляем пустые строки/колонки
                    await this.animateGravity();

                    // Перемешиваем оставшиеся карты только в режиме Nightmare
                    if (this.mode === PokerPuzzle.NIGHTMARE_MODE) {
                        await this.animateShuffle();
                    }
                    // AFTER MOVE EVENT
                    const afterEvent = new CustomEvent(AFTER_MOVE_EVENT, { detail: { state: this.getState() } });
                    document.dispatchEvent(afterEvent);

                }, 1200);

                this.updateScore();
            } else {
                this.selectedCards = [];
                this.updateSelection();
            }
        } else {
            this.selectedCards = [];
            this.updateSelection();
        }
    }

    highlightWinningCards(winningIndices) {
        this.selectedCards.forEach(index => {
            const card = document.querySelector(`[data-index="${index}"]`);
            if (card) {
                if (winningIndices.includes(index)) {
                    card.classList.add('winning');
                } else {
                    card.classList.add('not-winning');
                }
            }
        });
    }

    removeWinningCards(winningIndices) {
        winningIndices.forEach(index => {
            this.board[index] = null;
        });
        this.renderBoard();
    }

    showWinningCombo(combo) {
        const banner = document.createElement('div');
        banner.className = 'combo-banner';
        banner.textContent = `${combo.name}!`;

        const points = document.createElement('div');
        points.style.fontSize = '16px';
        points.style.marginTop = '5px';
        points.textContent = `+${combo.points} points`;
        banner.appendChild(points);

        document.querySelector('.game-container').appendChild(banner);

        setTimeout(() => {
            banner.classList.add('show');
        }, 10);

        setTimeout(() => {
            if (banner.parentNode) {
                banner.parentNode.removeChild(banner);
            }
        }, 4500);
    }

    createConfetti() {
        const container = document.querySelector('.game-container');
        const rect = container.getBoundingClientRect();

        for (let i = 0; i < 15; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * rect.width + 'px';
            confetti.style.top = rect.height / 2 + 'px';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';

            container.appendChild(confetti);

            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 2000);
        }
    }

    isAdjacent(index1, index2) {
        const row1 = Math.floor(index1 / this.cols);
        const col1 = index1 % this.cols;
        const row2 = Math.floor(index2 / this.cols);
        const col2 = index2 % this.cols;

        const distance = Math.abs(row1 - row2) + Math.abs(col1 - col2);
        return distance === 1;
    }

    updateSelection() {
        document.querySelectorAll('.card').forEach((card, index) => {
            card.classList.remove('selected', 'winning', 'not-winning');
            if (this.selectedCards.includes(index)) {
                card.classList.add('selected');
            }
        });
    }

    checkPokerHand() {
        const cards = this.selectedCards.map(index => ({ card: this.board[index], index }));
        return Combinations.checkPokerHand(cards);
    }

    // Загрузка рекорда из localStorage
    loadHighScore() {
        const saved = localStorage.getItem('pokerPuzzleHighScore');
        return saved ? parseInt(saved) : 0;
    }

    // Сохранение рекорда в localStorage
    saveHighScore(score) {
        if (score > this.highScore) {
            this.highScore = score;
            localStorage.setItem('pokerPuzzleHighScore', score.toString());
            return true; // Новый рекорд
        }
        return false; // Не новый рекорд
    }

    // Обновление отображения рекорда
    updateHighScoreDisplay() {
        const highScoreElement = document.getElementById('highScore');
        if (highScoreElement) {
            highScoreElement.textContent = this.highScore;
        }
    }

    loadGameFromLocalStorage() {
        const savedState = localStorage.getItem('pokerPuzzleGameState');
        if (savedState) {
            try {
                const gameState = JSON.parse(savedState);
                // Проверяем, что сохраненное состояние не слишком старое (например, не старше 24 часов)
                const isExpired = Date.now() - gameState.timestamp > 24 * 60 * 60 * 1000;
                
                // Не загружаем состояние для режима Rapid или если режимы не совпадают
                if (this.mode === PokerPuzzle.RAPID_MODE || 
                    (gameState.mode && gameState.mode !== this.mode)) {
                    return false;
                }
                
                if (!isExpired && gameState.board && gameState.score !== undefined) {
                    // Используем ту же структуру, что и в getState()
                    this.board = gameState.board;
                    this.score = gameState.score;
                    this.rows = gameState.rows;
                    this.cols = gameState.cols;
                    this.comboStats = gameState.comboStats;
                    this.mode = gameState.mode || PokerPuzzle.DEFAULT_MODE;
    
                    return true;
                }
            } catch (error) {
                console.error('Error loading game state from localStorage:', error);
            }
        }
        return false;
    }
}

// Глобальные константы для названий событий
const BEFORE_MOVE_EVENT = 'beforeMoveEvent';
const AFTER_MOVE_EVENT = 'afterMoveEvent';

class Popup {
    static activePopup = null;

    static show(id) {
        // Закрываем активный popup если есть
        this.close();
        
        const popup = document.getElementById(id);
        if (popup) {
            popup.classList.add('show');
            this.activePopup = popup;
        }
    }

    static close() {
        if (this.activePopup) {
            this.activePopup.classList.remove('show');
            this.activePopup = null;
        }
    }
}

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
    gameInstance.updateHighScoreDisplay();

    // Формируем статистику
    let statsHTML = `<div class="stat-item"><span>Current Score</span><span>${gameInstance.score}</span></div>`;
    
    // Показываем информацию о рекорде
    if (isNewRecord) {
        statsHTML += `<div class="stat-item new-record"><span>🏆 NEW RECORD!</span><span>${gameInstance.highScore}</span></div>`;
    } else {
        statsHTML += `<div class="stat-item"><span>Last Record</span><span>${gameInstance.highScore}</span></div>`;
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

function hideNewGamePopup() {
    Popup.close();
}

function confirmNewGame() {
    Popup.close();
    PokerPuzzle.startNewGame(PokerPuzzle.DEFAULT_MODE);
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

// Инициализация системы достижений
let achievementsSystem;
let tutorialSystem;

// Запуск игры
window.addEventListener('load', () => {
    PokerPuzzle.startNewGame(PokerPuzzle.DEFAULT_MODE);
    achievementsSystem = new Achievements();
    tutorialSystem = new Tutorial();
});
