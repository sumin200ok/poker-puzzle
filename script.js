class PokerPuzzle {
    constructor() {
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
        this.achievements = this.loadAchievements(); // Загружаем достижения
        this.init();
    }

    init() {
        this.createDeck();
        this.renderBoard();
        this.setupEventListeners();
        this.initComboStats();
        this.updateHighScoreDisplay(); // Обновляем отображение рекорда
        this.updateUndoButton(); // Инициализируем кнопку Undo
        this.updateAchievementsDisplay(); // Инициализируем отображение достижений
    }

    initComboStats() {
        const combos = ['Royal Flush', 'Straight Flush', 'Four of a Kind', 'Full House',
            'Flush', 'Straight', 'Three of a Kind', 'Two Pair', 'Pair'];
        combos.forEach(combo => {
            this.comboStats[combo] = 0;
        });
    }

    saveGameState() {
        const gameState = {
            board: JSON.parse(JSON.stringify(this.board)),
            score: this.score,
            rows: this.rows,
            cols: this.cols,
            comboStats: JSON.parse(JSON.stringify(this.comboStats)),
            achievements: JSON.parse(JSON.stringify(this.achievements))
        };
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
        this.achievements = lastState.achievements;
        
        // Очищаем выбранные карты
        this.selectedCards = [];
        this.isSelecting = false;
        
        // Обновляем отображение
        this.renderBoard();
        this.updateSelection();
        document.getElementById('score').textContent = this.score;
        this.updateUndoButton();
        
        // Обновляем достижения после отката
        this.updateAchievementsDisplay();
        
        // Сохраняем достижения в localStorage после отката
        this.saveAchievements();
        
        // Показываем анимацию отмены
        this.showUndoAnimation();
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

    setupEventListeners() {
        const board = document.getElementById('game-board');

        // Мышь события
        board.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.startSelection(e);
        });

        board.addEventListener('mouseover', (e) => {
            if (this.isSelecting) {
                this.continueSelection(e);
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isSelecting) {
                this.endSelection();
            }
        });

        // Тач события
        board.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            if (element) {
                this.startSelection({ target: element });
            }
        }, { passive: false });

        board.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isSelecting) {
                const touch = e.touches[0];
                const element = document.elementFromPoint(touch.clientX, touch.clientY);
                if (element) {
                    this.continueSelection({ target: element });
                }
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            if (this.isSelecting) {
                e.preventDefault();
                this.endSelection();
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
                
                this.showWinningCombo(comboResult.combo);
                this.score += comboResult.combo.points;

                // Показываем какие карты выиграли, а какие нет
                this.highlightWinningCards(comboResult.winningCardIndices);

                this.showScoreAnimation(comboResult.combo.points);
                this.createConfetti();

                // Обновляем статистику
                this.comboStats[comboResult.combo.name]++;
                this.checkAchievements(comboResult.combo.name); // Проверяем достижения

                // Удаляем только выигрышные карты после завершения анимации
                setTimeout(async () => {
                    this.removeWinningCards(comboResult.winningCardIndices);
                    this.selectedCards = [];
                    this.updateSelection();

                    // Применяем гравитацию и удаляем пустые строки/колонки
                    await this.animateGravity();

                }, 1200);

                document.getElementById('score').textContent = this.score;
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

    showScoreAnimation(points) {
        const scoreElement = document.createElement('div');
        scoreElement.className = 'score-animation';
        scoreElement.textContent = `+${points}`;

        document.querySelector('.game-container').appendChild(scoreElement);

        setTimeout(() => {
            if (scoreElement.parentNode) {
                scoreElement.parentNode.removeChild(scoreElement);
            }
        }, 1500);
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
        const combos = [
            { name: 'Royal Flush', points: 1000, check: this.isRoyalFlush.bind(this) },
            { name: 'Straight Flush', points: 500, check: this.isStraightFlush.bind(this) },
            { name: 'Four of a Kind', points: 200, check: this.isFourOfAKind.bind(this) },
            { name: 'Full House', points: 100, check: this.isFullHouse.bind(this) },
            { name: 'Flush', points: 80, check: this.isFlush.bind(this) },
            { name: 'Straight', points: 60, check: this.isStraight.bind(this) },
            { name: 'Three of a Kind', points: 40, check: this.isThreeOfAKind.bind(this) },
            { name: 'Two Pair', points: 30, check: this.isTwoPair.bind(this) },
            { name: 'Pair', points: 10, check: this.isPair.bind(this) }
        ];

        for (let combo of combos) {
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

    getRankValue(rank) {
        if (rank === 'A') return 1;
        if (rank === 'J') return 11;
        if (rank === 'Q') return 12;
        if (rank === 'K') return 13;
        return parseInt(rank);
    }

    getRankCounts(cards) {
        const counts = {};
        cards.forEach(cardData => {
            const rank = cardData.card.rank;
            if (!counts[rank]) counts[rank] = [];
            counts[rank].push(cardData.index);
        });
        return counts;
    }

    isRoyalFlush(cards) {
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

    isStraightFlush(cards) {
        if (cards.length !== 5) return false;
        const flushIndices = this.isFlush(cards);
        const straightIndices = this.isStraight(cards);
        if (flushIndices && straightIndices && flushIndices.length === 5 && straightIndices.length === 5) {
            return cards.map(c => c.index);
        }
        return false;
    }

    isFourOfAKind(cards) {
        if (cards.length < 4) return false;
        const counts = this.getRankCounts(cards);
        for (let rank in counts) {
            if (counts[rank].length >= 4) {
                return counts[rank].slice(0, 4);
            }
        }
        return false;
    }

    isFullHouse(cards) {
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

    isFlush(cards) {
        if (cards.length < 5) return false;
        const suits = [...new Set(cards.map(c => c.card.suit))];
        if (suits.length === 1) {
            return cards.map(c => c.index);
        }
        return false;
    }

    isStraight(cards) {
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

    isThreeOfAKind(cards) {
        if (cards.length < 3) return false;
        const counts = this.getRankCounts(cards);
        for (let rank in counts) {
            if (counts[rank].length >= 3) {
                return counts[rank].slice(0, 3);
            }
        }
        return false;
    }

    isTwoPair(cards) {
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

    isPair(cards) {
        if (cards.length < 2) return false;
        const counts = this.getRankCounts(cards);
        for (let rank in counts) {
            if (counts[rank].length >= 2) {
                return counts[rank].slice(0, 2);
            }
        }
        return false;
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

    // Загрузка достижений из localStorage
    loadAchievements() {
        const saved = localStorage.getItem('pokerPuzzleAchievements');
        return saved ? JSON.parse(saved) : {
            'royal-flush': false,
            'straight-flush': false,
            'four-of-a-kind': false,
            'full-house': false,
            'flush': false
        };
    }

    // Сохранение достижений в localStorage
    saveAchievements() {
        localStorage.setItem('pokerPuzzleAchievements', JSON.stringify(this.achievements));
    }

    // Проверка и обновление достижений
    checkAchievements(comboName) {
        // Проверяем условия достижений на основе статистики комбинаций
        this.checkAchievementConditions();
    }

    // Проверка условий достижений
    checkAchievementConditions() {
        const conditions = {
            'royal-flush': () => this.comboStats['Royal Flush'] >= 1,
            'straight-flush': () => this.comboStats['Straight Flush'] >= 1,
            'four-of-a-kind': () => this.comboStats['Four of a Kind'] >= 2,
            'full-house': () => this.comboStats['Full House'] >= 3,
            'flush': () => this.comboStats['Flush'] >= 3
        };

        for (let achievement in conditions) {
            if (!this.achievements[achievement] && conditions[achievement]()) {
                this.unlockAchievement(achievement);
            }
        }
    }

    // Разблокировка достижения
    unlockAchievement(achievementKey) {
        this.achievements[achievementKey] = true;
        this.saveAchievements();
        this.showAchievementUnlocked(achievementKey);
        this.updateAchievementsDisplay();
        this.updateAchievementsButton(); // Обновляем кнопку
    }

    // Показ уведомления о разблокировке достижения
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

    // Обновление отображения достижений
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

    // Обновление звездочек на кнопке достижений
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
    }

    // Обновление рекорда в попапе достижений
    updateAchievementsHighScore() {
        const highScoreElement = document.getElementById('achievementsHighScore');
        if (highScoreElement) {
            highScoreElement.textContent = this.highScore;
        }
        const lastRecordElement = document.getElementById('achievementsLastRecord');
        if (this.highScore > 0) {
            lastRecordElement.classList.add('active')
        } else {
            lastRecordElement.classList.remove('active')
        }
    }
}

let game;

// Функции для управления popup'ами
function showNewGamePopup() {
    const popup = document.getElementById('newGamePopup');
    const statsDiv = document.getElementById('gameStats');

    // Сохраняем рекорд
    const isNewRecord = game.saveHighScore(game.score);
    game.updateHighScoreDisplay();

    // Формируем статистику
    let statsHTML = `<div class="stat-item"><span>Current Score</span><span>${game.score}</span></div>`;
    
    // Показываем информацию о рекорде
    if (isNewRecord) {
        statsHTML += `<div class="stat-item new-record"><span>🏆 NEW RECORD!</span><span>${game.highScore}</span></div>`;
    } else {
        statsHTML += `<div class="stat-item"><span>Last Record</span><span>${game.highScore}</span></div>`;
    }

    const totalCombos = Object.values(game.comboStats).reduce((sum, count) => sum + count, 0);
    statsHTML += `<div class="stat-item"><span>Total Combinations</span><span>${totalCombos}</span></div><br>`;

    // Показываем только комбинации, которые были собраны
    for (let combo in game.comboStats) {
        if (game.comboStats[combo] > 0) {
            statsHTML += `<div class="stat-item"><span>${combo}</span><span>${game.comboStats[combo]}</span></div>`;
        }
    }

    statsDiv.innerHTML = statsHTML;
    popup.classList.add('show');
}

function hideNewGamePopup() {
    const popup = document.getElementById('newGamePopup');
    popup.classList.remove('show');
}

function confirmNewGame() {
    hideNewGamePopup();
    newGame();
}

function showHelpPopup() {
    const popup = document.getElementById('helpPopup');
    popup.classList.add('show');
}

function hideHelpPopup() {
    const popup = document.getElementById('helpPopup');
    popup.classList.remove('show');
}

function showAchievementsPopup() {
    const popup = document.getElementById('achievementsPopup');
    // Обновляем отображение достижений перед показом попапа
    game.updateAchievementsDisplay();
    popup.classList.add('show');
}

function hideAchievementsPopup() {
    const popup = document.getElementById('achievementsPopup');
    popup.classList.remove('show');
}

function newGame() {
    game = new PokerPuzzle();
    document.getElementById('score').textContent = '0';
    // История ходов автоматически очищается в конструкторе
    // Достижения текущей игры также сбрасываются в конструкторе
}

// Закрытие popup'ов по клику вне их области
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('popup-overlay')) {
        e.target.classList.remove('show');
    }
});

// Запуск игры
window.addEventListener('load', newGame);

///////////////////////////

function generateResultImage(score, playerName) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 600;
    canvas.height = 400;

    // Фон
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Текст с результатами
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Счет: ${score}`, canvas.width/2, 150);
    ctx.fillText(`Игрок: ${playerName}`, canvas.width/2, 220);

    return canvas.toDataURL('image/png');
}

function shareImage(score, playerName) {
    const imageData = generateResultImage(score, playerName);

    // Создаем ссылку для скачивания
    const link = document.createElement('a');
    link.download = 'game-result.png';
    link.href = imageData;
    link.click();
    document.getElementsByName('body')[0].appendChild(link);
}