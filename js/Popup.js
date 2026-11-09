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