class PokerPuzzle {
    static DEFAULT_MODE = 'simple';
    static RAPID_MODE = 'rapid';
    static NIGHTMARE_MODE = 'nightmare';
    static WILDFIRE_MODE = 'wildfire';
    static DRIFT_MODE = 'drift';

    static instance = null;
    static eventListenersSetup = false; // Флаг для отслеживания установки обработчиков

    // Статический массив стилей дизайна карт
    static designs = ['', 'design1'];
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
        this.moveHistory = []; // История ходов для отмены
        this.mode = options.mode || PokerPuzzle.DEFAULT_MODE;
        this.highScore = this.loadHighScore(); // Загружаем рекорд
        this.rapidTimer = null; // Таймер для режима Rapid
        this.rapidTimeLeft = 60; // Время в секундах для режима Rapid
        
        this.init();
    }
    
    static startNewGame(mode) {
        if (PokerPuzzle.instance && PokerPuzzle.instance.rapidTimer) {
            PokerPuzzle.instance.stopRapidTimer();
        }

        if (mode) {
            localStorage.removeItem('pokerPuzzleGameState');
        }

        PokerPuzzle.instance = new PokerPuzzle({ mode: mode });
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
        this.viewGameMode();

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

    viewGameMode() {
        const boardElement = document.getElementsByTagName('body')[0];
        // Убираем все классы режимов
        boardElement.classList.remove('simple', 'rapid', 'nightmare', 'wildfire', 'drift', 'default');
        boardElement.classList.add(this.mode);
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

    // Сжигает одну случайную карту в режиме Wildfire
    async burnRandomCard() {
        if (this.mode !== PokerPuzzle.WILDFIRE_MODE) return;

        // Находим все карты на поле
        const availableCards = [];
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] !== null) {
                availableCards.push(i);
            }
        }

        // Если нет карт для сжигания, выходим
        if (availableCards.length === 0) return;

        // Выбираем случайную карту
        const randomIndex = Math.floor(Math.random() * availableCards.length);
        const cardIndex = availableCards[randomIndex];

        // Подсвечиваем карту перед сжиганием
        const cardElement = document.querySelector(`[data-index="${cardIndex}"]`);
        if (cardElement) {
            cardElement.classList.add('burning');
        }

        this.board[cardIndex] = null;

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1500);
        });
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

    applyDrift() {
        // Применяем горизонтальную гравитацию по строкам
        for (let row = 0; row < this.rows; row++) {
            const rowCards = [];

            // Собираем все карты из строки (справа налево)
            for (let col = this.cols - 1; col >= 0; col--) {
                const index = row * this.cols + col;
                if (this.board[index]) {
                    rowCards.push(this.board[index]);
                }
            }

            // Очищаем всю строку
            for (let col = 0; col < this.cols; col++) {
                const index = row * this.cols + col;
                this.board[index] = null;
            }

            // Размещаем карты справа налево
            for (let i = 0; i < rowCards.length; i++) {
                const targetCol = this.cols - 1 - i; // Начинаем с правой колонки
                const targetIndex = row * this.cols + targetCol;
                this.board[targetIndex] = rowCards[i];
            }
        }
    }

    async animateGravity() {
        // Применяем гравитацию или дрифт в зависимости от режима
        if (this.mode === PokerPuzzle.DRIFT_MODE) {
            this.applyDrift();
        } else {
            this.applyGravity();
        }

        // Перерисовываем доску с анимацией
        setTimeout(() => {
            this.renderBoard();
        }, 100);

        // Проверяем и удаляем пустые строки и колонки после гравитации/дрифта
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

                        // Сжигаем случайную карту в режиме Wildfire (включает гравитацию)
                        if (this.mode === PokerPuzzle.WILDFIRE_MODE) {
                            await this.burnRandomCard();
                        }

                        // Применяем гравитацию или дрифт в зависимости от режима
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

    // Загрузка рекорда из localStorage с поддержкой режимов
    loadHighScore() {
        // Сначала проверяем, есть ли рекорд для текущего режима
        const modeKey = `pokerPuzzleHighScore_${this.mode}`;
        const saved = localStorage.getItem(modeKey);
        
        if (saved) {
            return parseInt(saved);
        }
        if (this.mode !== PokerPuzzle.DEFAULT_MODE) {
            return 0;
        }
        
        // Обратная совместимость: если нет рекорда для режима, проверяем общий рекорд
        const legacySaved = localStorage.getItem('pokerPuzzleHighScore');
        if (legacySaved) {
            const legacyScore = parseInt(legacySaved);
            // Мигрируем общий рекорд в режим по умолчанию
            if (this.mode === PokerPuzzle.DEFAULT_MODE) {
                localStorage.setItem(modeKey, legacyScore.toString());
                // Удаляем старый ключ только после успешной миграции
                localStorage.removeItem('pokerPuzzleHighScore');
            }
            return legacyScore;
        }
        
        return 0;
    }

    // Сохранение рекорда в localStorage с поддержкой режимов
    saveHighScore(score) {
        if (score > this.highScore) {
            this.highScore = score;
            const modeKey = `pokerPuzzleHighScore_${this.mode}`;
            localStorage.setItem(modeKey, score.toString());
            return true; // Новый рекорд
        }
        return false; // Не новый рекорд
    }

    // Получение рекорда для конкретного режима
    static getHighScoreForMode(mode) {
        const modeKey = `pokerPuzzleHighScore_${mode}`;
        const saved = localStorage.getItem(modeKey);
        return saved ? parseInt(saved) : 0;
    }

    // Получение общего рекорда (максимальный из всех режимов)
    static getOverallHighScore() {
        const modes = [PokerPuzzle.DEFAULT_MODE, PokerPuzzle.RAPID_MODE, PokerPuzzle.NIGHTMARE_MODE, PokerPuzzle.WILDFIRE_MODE, PokerPuzzle.DRIFT_MODE];
        let maxScore = 0;
        
        modes.forEach(mode => {
            const score = PokerPuzzle.getHighScoreForMode(mode);
            if (score > maxScore) {
                maxScore = score;
            }
        });
        
        return maxScore;
    }

    // Обновление отображения рекорда
    updateHighScoreDisplay() {
        const highScoreElement = document.getElementById('highScore');
        if (highScoreElement) {
            highScoreElement.textContent = this.highScore;
        }
        
        // Также обновляем отображение в попапе достижений
        const achievementsHighScoreElement = document.getElementById('achievementsHighScore');
        if (achievementsHighScoreElement) {
            achievementsHighScoreElement.textContent = this.highScore;
        }
        
        // Обновляем рекорды по режимам в достижениях
        const achievementsSystem = Achievements.getInstance();
        if (achievementsSystem) {
            achievementsSystem.updateAchievementsHighScore();
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
                if (this.mode === PokerPuzzle.RAPID_MODE) {
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