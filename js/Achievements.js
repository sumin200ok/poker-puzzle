class Achievements {
    constructor() {
        if (Achievements.instance) {
            return Achievements.instance;
        }
        
        this.achievements = this.loadAchievements();
        this.updateAchievementsDisplay();
        this.setupEventListeners();
        
        Achievements.instance = this;
    }
    
    static getInstance() {
        if (!Achievements.instance) {
            Achievements.instance = new Achievements();
        }
        return Achievements.instance;
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
            if (this.achievements[achievementKey] || achievementKey === undefined) {
                item.classList.add('unlocked');
            }
        });
        // Обновляем звездочки на кнопке
        this.updateAchievementsButton();
        // Обновляем рекорд в попапе
        this.updateAchievementsHighScore();
        // Обновляем доступность кнопок игр
        this.updateSuperGameButtons();
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

    }

    updateAchievementsHighScore() {
        const gameInstance = PokerPuzzle.getInstance();
        if (!gameInstance) return;
        
        // Показываем общий рекорд (максимальный из всех режимов) в попапе достижений
        const overallHighScore = PokerPuzzle.getOverallHighScore();
        
        const highScoreElement = document.getElementById('achievementsHighScore');
        if (highScoreElement) {
            highScoreElement.textContent = overallHighScore;
        }
        const lastRecordElement = document.getElementById('achievementsLastRecord');
        if (overallHighScore > 0) {
            lastRecordElement.classList.add('active')
        } else {
            lastRecordElement.classList.remove('active')
        }
    }

    updateSuperGameButtons() {
        const superGameContainer = document.getElementById('superGame');
        if (!superGameContainer) return;

        const gameButtons = superGameContainer.querySelectorAll('button[data-game]');
        gameButtons.forEach(button => {
            const gameMode = button.dataset.game;
            const isAvailable = this.isGameAvailable(gameMode);
            
            if (isAvailable) {
                button.disabled = false;
                button.classList.remove('disabled');
            } else {
                button.disabled = true;
                button.classList.add('disabled');
            }
        });
    }

    isGameAvailable(game) {
        const gameRequirements = {
            [PokerPuzzle.DRIFT_MODE]: 'straight-flush',
            [PokerPuzzle.NIGHTMARE_MODE]: 'four-of-a-kind',
            [PokerPuzzle.RAPID_MODE]: 'full-house',
            [PokerPuzzle.WILDFIRE_MODE]: 'flush'
        };
        
        // royal-flush открывает все игры
        if (this.achievements['royal-flush']) {
            return true;
        }
        if (game === PokerPuzzle.DEFAULT_MODE) {
            return true;
        }
        
        // Проверяем конкретное требование для игры
        const requiredAchievement = gameRequirements[game];
        if (requiredAchievement) {
            return this.achievements[requiredAchievement] || false;
        }
        
        return false;
    }
} 