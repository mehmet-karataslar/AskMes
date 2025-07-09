// Bileşen JavaScript Dosyası

// Modal Bileşeni
class Modal {
    constructor(options = {}) {
        this.options = {
            title: options.title || 'Modal',
            content: options.content || '',
            size: options.size || 'medium',
            closable: options.closable !== false,
            backdrop: options.backdrop !== false,
            ...options
        };
        
        this.element = null;
        this.isOpen = false;
        this.callbacks = {
            onOpen: options.onOpen || (() => {}),
            onClose: options.onClose || (() => {}),
            onConfirm: options.onConfirm || (() => {}),
            onCancel: options.onCancel || (() => {})
        };
        
        this.create();
    }
    
    create() {
        this.element = document.createElement('div');
        this.element.className = 'modal-overlay';
        this.element.innerHTML = `
            <div class="modal-content ${this.options.size}">
                <div class="modal-header">
                    <h3 class="modal-title">${this.options.title}</h3>
                    ${this.options.closable ? '<button class="modal-close"><i class="fas fa-times"></i></button>' : ''}
                </div>
                <div class="modal-body">
                    ${this.options.content}
                </div>
                <div class="modal-footer">
                    ${this.options.showCancel ? '<button class="btn btn-secondary modal-cancel">İptal</button>' : ''}
                    ${this.options.showConfirm ? '<button class="btn btn-primary modal-confirm">Tamam</button>' : ''}
                </div>
            </div>
        `;
        
        this.setupEventListeners();
        document.body.appendChild(this.element);
    }
    
    setupEventListeners() {
        // Kapatma butonları
        const closeBtn = this.element.querySelector('.modal-close');
        const cancelBtn = this.element.querySelector('.modal-cancel');
        const confirmBtn = this.element.querySelector('.modal-confirm');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.callbacks.onCancel();
                this.close();
            });
        }
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.callbacks.onConfirm();
                this.close();
            });
        }
        
        // Backdrop tıklama
        if (this.options.backdrop) {
            this.element.addEventListener('click', (e) => {
                if (e.target === this.element) {
                    this.close();
                }
            });
        }
        
        // ESC tuşu
        this.keyHandler = (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        };
        
        document.addEventListener('keydown', this.keyHandler);
    }
    
    open() {
        if (this.isOpen) return;
        
        this.element.classList.add('active');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
        
        this.callbacks.onOpen();
        
        // Focus yönetimi
        const firstFocusable = this.element.querySelector('button, input, textarea, select');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }
    
    close() {
        if (!this.isOpen) return;
        
        this.element.classList.remove('active');
        this.isOpen = false;
        document.body.style.overflow = '';
        
        this.callbacks.onClose();
        
        setTimeout(() => {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
        }, 300);
        
        document.removeEventListener('keydown', this.keyHandler);
    }
    
    updateContent(content) {
        const bodyElement = this.element.querySelector('.modal-body');
        if (bodyElement) {
            bodyElement.innerHTML = content;
        }
    }
    
    updateTitle(title) {
        const titleElement = this.element.querySelector('.modal-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }
}

// Form Bileşeni
class FormBuilder {
    constructor(container) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.fields = [];
        this.validators = [];
        this.data = {};
    }
    
    addField(config) {
        const field = {
            id: config.id || `field_${Date.now()}`,
            type: config.type || 'text',
            label: config.label || '',
            placeholder: config.placeholder || '',
            required: config.required || false,
            validation: config.validation || null,
            options: config.options || null,
            value: config.value || '',
            ...config
        };
        
        this.fields.push(field);
        return this;
    }
    
    render() {
        if (!this.container) return;
        
        const form = document.createElement('form');
        form.className = 'dynamic-form';
        
        this.fields.forEach(field => {
            const fieldElement = this.createFieldElement(field);
            form.appendChild(fieldElement);
        });
        
        this.container.innerHTML = '';
        this.container.appendChild(form);
        
        this.setupValidation();
        return this;
    }
    
    createFieldElement(field) {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';
        
        if (field.label) {
            const label = document.createElement('label');
            label.className = 'form-label';
            label.textContent = field.label;
            label.setAttribute('for', field.id);
            wrapper.appendChild(label);
        }
        
        let input;
        
        switch (field.type) {
            case 'textarea':
                input = document.createElement('textarea');
                input.className = 'form-textarea';
                input.rows = field.rows || 4;
                break;
                
            case 'select':
                input = document.createElement('select');
                input.className = 'form-input';
                
                if (field.options) {
                    field.options.forEach(option => {
                        const optionElement = document.createElement('option');
                        optionElement.value = option.value;
                        optionElement.textContent = option.text;
                        input.appendChild(optionElement);
                    });
                }
                break;
                
            case 'checkbox':
                input = document.createElement('input');
                input.type = 'checkbox';
                input.className = 'form-checkbox';
                break;
                
            case 'radio':
                const radioGroup = document.createElement('div');
                radioGroup.className = 'radio-group';
                
                if (field.options) {
                    field.options.forEach(option => {
                        const radioWrapper = document.createElement('div');
                        radioWrapper.className = 'radio-item';
                        
                        const radioInput = document.createElement('input');
                        radioInput.type = 'radio';
                        radioInput.name = field.id;
                        radioInput.value = option.value;
                        radioInput.id = `${field.id}_${option.value}`;
                        
                        const radioLabel = document.createElement('label');
                        radioLabel.textContent = option.text;
                        radioLabel.setAttribute('for', `${field.id}_${option.value}`);
                        
                        radioWrapper.appendChild(radioInput);
                        radioWrapper.appendChild(radioLabel);
                        radioGroup.appendChild(radioWrapper);
                    });
                }
                
                wrapper.appendChild(radioGroup);
                return wrapper;
                
            default:
                input = document.createElement('input');
                input.type = field.type;
                input.className = 'form-input';
        }
        
        input.id = field.id;
        input.name = field.id;
        input.placeholder = field.placeholder;
        input.value = field.value;
        
        if (field.required) {
            input.required = true;
        }
        
        wrapper.appendChild(input);
        
        // Validation mesajı için container
        const errorContainer = document.createElement('div');
        errorContainer.className = 'form-error';
        errorContainer.id = `${field.id}_error`;
        wrapper.appendChild(errorContainer);
        
        return wrapper;
    }
    
    setupValidation() {
        this.fields.forEach(field => {
            const input = document.getElementById(field.id);
            if (input && field.validation) {
                input.addEventListener('blur', () => this.validateField(field.id));
                input.addEventListener('input', () => this.clearFieldError(field.id));
            }
        });
    }
    
    validateField(fieldId) {
        const field = this.fields.find(f => f.id === fieldId);
        const input = document.getElementById(fieldId);
        const errorContainer = document.getElementById(`${fieldId}_error`);
        
        if (!field || !input || !errorContainer) return true;
        
        const value = input.value.trim();
        
        // Required validation
        if (field.required && !value) {
            this.showFieldError(fieldId, 'Bu alan zorunludur');
            return false;
        }
        
        // Custom validation
        if (field.validation && value) {
            const validationResult = field.validation(value);
            if (validationResult !== true) {
                this.showFieldError(fieldId, validationResult);
                return false;
            }
        }
        
        this.clearFieldError(fieldId);
        return true;
    }
    
    showFieldError(fieldId, message) {
        const errorContainer = document.getElementById(`${fieldId}_error`);
        const input = document.getElementById(fieldId);
        
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
        }
        
        if (input) {
            input.classList.add('error');
        }
    }
    
    clearFieldError(fieldId) {
        const errorContainer = document.getElementById(`${fieldId}_error`);
        const input = document.getElementById(fieldId);
        
        if (errorContainer) {
            errorContainer.style.display = 'none';
        }
        
        if (input) {
            input.classList.remove('error');
        }
    }
    
    validate() {
        let isValid = true;
        
        this.fields.forEach(field => {
            if (!this.validateField(field.id)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    getData() {
        const data = {};
        
        this.fields.forEach(field => {
            const input = document.getElementById(field.id);
            if (input) {
                if (field.type === 'checkbox') {
                    data[field.id] = input.checked;
                } else if (field.type === 'radio') {
                    const checkedRadio = document.querySelector(`input[name="${field.id}"]:checked`);
                    data[field.id] = checkedRadio ? checkedRadio.value : null;
                } else {
                    data[field.id] = input.value;
                }
            }
        });
        
        return data;
    }
    
    setData(data) {
        Object.keys(data).forEach(key => {
            const input = document.getElementById(key);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = data[key];
                } else if (input.type === 'radio') {
                    const radioInput = document.querySelector(`input[name="${key}"][value="${data[key]}"]`);
                    if (radioInput) {
                        radioInput.checked = true;
                    }
                } else {
                    input.value = data[key];
                }
            }
        });
    }
    
    reset() {
        this.fields.forEach(field => {
            const input = document.getElementById(field.id);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = false;
                } else if (input.type === 'radio') {
                    input.checked = false;
                } else {
                    input.value = '';
                }
            }
            this.clearFieldError(field.id);
        });
    }
}

// Notification Bileşeni
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.createContainer();
    }
    
    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1001;
            max-width: 400px;
        `;
        document.body.appendChild(this.container);
    }
    
    show(message, type = 'info', options = {}) {
        const notification = {
            id: Date.now(),
            message,
            type,
            duration: options.duration || 5000,
            closable: options.closable !== false,
            ...options
        };
        
        const element = this.createElement(notification);
        this.container.appendChild(element);
        this.notifications.push({ ...notification, element });
        
        // Animasyon
        setTimeout(() => {
            element.classList.add('show');
        }, 100);
        
        // Otomatik kapatma
        if (notification.duration > 0) {
            setTimeout(() => {
                this.remove(notification.id);
            }, notification.duration);
        }
        
        return notification.id;
    }
    
    createElement(notification) {
        const element = document.createElement('div');
        element.className = `notification ${notification.type}`;
        element.style.cssText = `
            padding: 15px 20px;
            margin-bottom: 10px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        // Tip'e göre renk
        const colors = {
            success: '#51cf66',
            error: '#ff6b6b',
            warning: '#ffd43b',
            info: '#667eea'
        };
        
        element.style.backgroundColor = colors[notification.type] || colors.info;
        
        // İçerik
        const content = document.createElement('div');
        content.className = 'notification-content';
        content.innerHTML = `
            <div class="notification-message">${notification.message}</div>
        `;
        
        element.appendChild(content);
        
        // Kapatma butonu
        if (notification.closable) {
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';
            closeBtn.style.cssText = `
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 5px;
                margin-left: 10px;
                opacity: 0.7;
                transition: opacity 0.3s ease;
            `;
            
            closeBtn.addEventListener('click', () => {
                this.remove(notification.id);
            });
            
            closeBtn.addEventListener('mouseenter', () => {
                closeBtn.style.opacity = '1';
            });
            
            closeBtn.addEventListener('mouseleave', () => {
                closeBtn.style.opacity = '0.7';
            });
            
            element.appendChild(closeBtn);
        }
        
        return element;
    }
    
    remove(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.element.classList.remove('show');
            
            setTimeout(() => {
                if (notification.element.parentNode) {
                    notification.element.parentNode.removeChild(notification.element);
                }
                this.notifications = this.notifications.filter(n => n.id !== id);
            }, 300);
        }
    }
    
    clear() {
        this.notifications.forEach(notification => {
            this.remove(notification.id);
        });
    }
    
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }
    
    error(message, options = {}) {
        return this.show(message, 'error', options);
    }
    
    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }
    
    info(message, options = {}) {
        return this.show(message, 'info', options);
    }
}

// Loading Bileşeni
class LoadingManager {
    constructor() {
        this.overlay = null;
        this.isLoading = false;
    }
    
    show(message = 'Yükleniyor...') {
        if (this.isLoading) return;
        
        this.overlay = document.createElement('div');
        this.overlay.className = 'loading-overlay';
        this.overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-message">${message}</div>
            </div>
        `;
        
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1002;
            backdrop-filter: blur(5px);
        `;
        
        const content = this.overlay.querySelector('.loading-content');
        content.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;
        
        const spinner = this.overlay.querySelector('.loading-spinner');
        spinner.style.cssText = `
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        `;
        
        const messageEl = this.overlay.querySelector('.loading-message');
        messageEl.style.cssText = `
            color: #333;
            font-size: 1.1rem;
            font-weight: 500;
        `;
        
        // Spinner animasyonu
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(this.overlay);
        document.body.style.overflow = 'hidden';
        this.isLoading = true;
    }
    
    hide() {
        if (!this.isLoading || !this.overlay) return;
        
        this.overlay.style.opacity = '0';
        
        setTimeout(() => {
            if (this.overlay && this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
            this.overlay = null;
            this.isLoading = false;
            document.body.style.overflow = '';
        }, 300);
    }
    
    updateMessage(message) {
        if (this.overlay) {
            const messageEl = this.overlay.querySelector('.loading-message');
            if (messageEl) {
                messageEl.textContent = message;
            }
        }
    }
}

// Tooltip Bileşeni
class TooltipManager {
    constructor() {
        this.tooltip = null;
        this.init();
    }
    
    init() {
        // Tooltip elementini oluştur
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tooltip';
        this.tooltip.style.cssText = `
            position: absolute;
            background: #333;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.9rem;
            pointer-events: none;
            z-index: 1003;
            opacity: 0;
            transform: translateY(-5px);
            transition: opacity 0.3s ease, transform 0.3s ease;
            max-width: 200px;
            word-wrap: break-word;
        `;
        
        document.body.appendChild(this.tooltip);
        
        // Event listener'ları ekle
        document.addEventListener('mouseenter', this.handleMouseEnter.bind(this), true);
        document.addEventListener('mouseleave', this.handleMouseLeave.bind(this), true);
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    }
    
    handleMouseEnter(e) {
        const target = e.target;
        const tooltipText = target.getAttribute('data-tooltip') || target.title;
        
        if (tooltipText) {
            // Title attribute'unu temizle
            if (target.title) {
                target.setAttribute('data-original-title', target.title);
                target.removeAttribute('title');
            }
            
            this.show(tooltipText, e);
        }
    }
    
    handleMouseLeave(e) {
        const target = e.target;
        
        // Title attribute'unu geri yükle
        if (target.getAttribute('data-original-title')) {
            target.title = target.getAttribute('data-original-title');
            target.removeAttribute('data-original-title');
        }
        
        this.hide();
    }
    
    handleMouseMove(e) {
        if (this.tooltip.style.opacity === '1') {
            this.position(e);
        }
    }
    
    show(text, event) {
        this.tooltip.textContent = text;
        this.position(event);
        this.tooltip.style.opacity = '1';
        this.tooltip.style.transform = 'translateY(0)';
    }
    
    hide() {
        this.tooltip.style.opacity = '0';
        this.tooltip.style.transform = 'translateY(-5px)';
    }
    
    position(event) {
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let left = event.pageX + 10;
        let top = event.pageY - tooltipRect.height - 10;
        
        // Sağ kenar kontrolü
        if (left + tooltipRect.width > viewportWidth) {
            left = event.pageX - tooltipRect.width - 10;
        }
        
        // Üst kenar kontrolü
        if (top < 0) {
            top = event.pageY + 10;
        }
        
        this.tooltip.style.left = left + 'px';
        this.tooltip.style.top = top + 'px';
    }
}

// Global örnekler
window.NotificationManager = new NotificationManager();
window.LoadingManager = new LoadingManager();
window.TooltipManager = new TooltipManager();

// Utility fonksiyonlar
window.createModal = function(options) {
    return new Modal(options);
};

window.createForm = function(container) {
    return new FormBuilder(container);
};

window.showNotification = function(message, type, options) {
    return window.NotificationManager.show(message, type, options);
};

window.showLoading = function(message) {
    return window.LoadingManager.show(message);
};

window.hideLoading = function() {
    return window.LoadingManager.hide();
};

console.log('Bileşenler yüklendi! 🎉'); 