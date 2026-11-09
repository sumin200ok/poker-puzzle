class Tutorial {
    static version = 2;
    
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
            description: 'Here\'s your current game score! Try to beat your record 👉'
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