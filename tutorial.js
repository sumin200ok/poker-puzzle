class Tutorial {
    static steps = [
        {
            description: 'Welcome to Poker Puzzle 👋 a challenging card game where you create poker combinations to score points. Test your poker skills in this addictive puzzle game!'
        },
        {
            element: '#game-board',
            description: 'Pick 2 to 5 cards to make a poker hand, but keep your finger on the screen and don\'t go backwards. Give it a try right now 👇'
        },
        {
            element: '.help-btn',
            description: 'Tap this button to see poker hand hints and bring up this tutorial again 👉'
        },
        {
            element: '.undo-btn',
            description: 'Кнопка "Отменить" позволяет вернуться к предыдущему ходу, если вы ошиблись.'
        },
        {
            element: '.score-display',
            description: 'Здесь отображается ваш текущий счет. За каждую собранную комбинацию вы получаете очки.👉'
        },
        {
            element: '.new-game-btn',
            description: 'Нажмите "Новая игра" чтобы начать заново, когда захотите. ➡'
        },
        {
            description: 'Отлично! Теперь вы знаете основы игры. Удачи в Poker Puzzle!'
        }
    ];

    constructor() {
        this.currentStep = 0;
        this.tooltip = null;
        this.navigation = null;
        this.currentTarget = null;
        this.init();
    }

    init() {
        // Проверяем, показывался ли уже учебник
        if (localStorage.getItem('tutorialShown') === 'true') {
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
        if (stepIndex < 0 || stepIndex >= Tutorial.steps.length) {
            this.endTutorial();
            return;
        }

        this.currentStep = stepIndex;
        const step = Tutorial.steps[stepIndex];

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

        if (this.currentStep === Tutorial.steps.length - 1) {
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
        if (this.currentStep < Tutorial.steps.length - 1) {
            this.showStep(this.currentStep + 1);
        } else {
            this.endTutorial();
        }
    }

    endTutorial() {
        localStorage.setItem('tutorialShown', 'true');
        this.cleanup();
    }

    // Метод для принудительного показа учебника (например, из меню помощи)
    showTutorial() {
        // Очищаем предыдущие элементы, если они есть
        this.cleanup();
        
        localStorage.removeItem('tutorialShown');
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