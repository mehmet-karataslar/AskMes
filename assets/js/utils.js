// Yardımcı Fonksiyonlar

// Tarih Formatları
const DateUtils = {
    formatDate(date, format = 'full') {
        const d = new Date(date);
        const options = {
            full: {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            },
            short: {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            },
            time: {
                hour: '2-digit',
                minute: '2-digit'
            },
            relative: null // Özel işleme
        };
        
        if (format === 'relative') {
            return this.getRelativeTime(d);
        }
        
        return d.toLocaleDateString('tr-TR', options[format] || options.full);
    },
    
    getRelativeTime(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);
        
        if (years > 0) return `${years} yıl önce`;
        if (months > 0) return `${months} ay önce`;
        if (days > 0) return `${days} gün önce`;
        if (hours > 0) return `${hours} saat önce`;
        if (minutes > 0) return `${minutes} dakika önce`;
        return 'Az önce';
    },
    
    isToday(date) {
        const today = new Date();
        const d = new Date(date);
        return d.toDateString() === today.toDateString();
    },
    
    isYesterday(date) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const d = new Date(date);
        return d.toDateString() === yesterday.toDateString();
    }
};

// String Yardımcıları
const StringUtils = {
    truncate(str, length = 100, suffix = '...') {
        if (str.length <= length) return str;
        return str.substring(0, length) + suffix;
    },
    
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    slugify(str) {
        const turkishChars = {
            'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
            'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
        };
        
        return str
            .replace(/[çğıöşüÇĞİÖŞÜ]/g, char => turkishChars[char])
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },
    
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },
    
    unescapeHtml(str) {
        const div = document.createElement('div');
        div.innerHTML = str;
        return div.textContent;
    }
};

// Array Yardımcıları
const ArrayUtils = {
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },
    
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(item);
            return groups;
        }, {});
    },
    
    sortBy(array, key, order = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            
            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });
    },
    
    unique(array, key = null) {
        if (key) {
            const seen = new Set();
            return array.filter(item => {
                const value = item[key];
                if (seen.has(value)) {
                    return false;
                }
                seen.add(value);
                return true;
            });
        }
        return [...new Set(array)];
    }
};

// Local Storage Yardımcıları
const StorageUtils = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    },
    
    exists(key) {
        return localStorage.getItem(key) !== null;
    }
};

// Validation Yardımcıları
const ValidationUtils = {
    email(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },
    
    phone(phone) {
        const regex = /^(\+90|0)?[0-9]{10}$/;
        return regex.test(phone.replace(/\s/g, ''));
    },
    
    required(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    },
    
    minLength(value, min) {
        return value.toString().length >= min;
    },
    
    maxLength(value, max) {
        return value.toString().length <= max;
    },
    
    number(value) {
        return !isNaN(value) && !isNaN(parseFloat(value));
    },
    
    url(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
};

// DOM Yardımcıları
const DOMUtils = {
    createElement(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.innerHTML = content;
        return element;
    },
    
    getElement(selector) {
        return document.querySelector(selector);
    },
    
    getElements(selector) {
        return document.querySelectorAll(selector);
    },
    
    addClass(element, className) {
        if (element) element.classList.add(className);
    },
    
    removeClass(element, className) {
        if (element) element.classList.remove(className);
    },
    
    toggleClass(element, className) {
        if (element) element.classList.toggle(className);
    },
    
    hasClass(element, className) {
        return element ? element.classList.contains(className) : false;
    },
    
    show(element) {
        if (element) element.style.display = '';
    },
    
    hide(element) {
        if (element) element.style.display = 'none';
    },
    
    fadeIn(element, duration = 300) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.display = '';
        
        const start = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                element.style.opacity = progress;
                requestAnimationFrame(animate);
            } else {
                element.style.opacity = '1';
            }
        }
        
        requestAnimationFrame(animate);
    },
    
    fadeOut(element, duration = 300) {
        if (!element) return;
        
        const start = performance.now();
        const startOpacity = parseFloat(element.style.opacity) || 1;
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                element.style.opacity = startOpacity * (1 - progress);
                requestAnimationFrame(animate);
            } else {
                element.style.opacity = '0';
                element.style.display = 'none';
            }
        }
        
        requestAnimationFrame(animate);
    }
};

// Event Yardımcıları
const EventUtils = {
    on(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler);
        }
    },
    
    off(element, event, handler) {
        if (element) {
            element.removeEventListener(event, handler);
        }
    },
    
    once(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler, { once: true });
        }
    },
    
    delegate(parent, selector, event, handler) {
        if (parent) {
            parent.addEventListener(event, function(e) {
                if (e.target.matches(selector)) {
                    handler.call(e.target, e);
                }
            });
        }
    },
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Animasyon Yardımcıları
const AnimationUtils = {
    slideDown(element, duration = 300) {
        if (!element) return;
        
        element.style.overflow = 'hidden';
        element.style.height = '0px';
        element.style.display = '';
        
        const targetHeight = element.scrollHeight;
        const start = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                element.style.height = (targetHeight * progress) + 'px';
                requestAnimationFrame(animate);
            } else {
                element.style.height = '';
                element.style.overflow = '';
            }
        }
        
        requestAnimationFrame(animate);
    },
    
    slideUp(element, duration = 300) {
        if (!element) return;
        
        const startHeight = element.offsetHeight;
        element.style.overflow = 'hidden';
        element.style.height = startHeight + 'px';
        
        const start = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                element.style.height = (startHeight * (1 - progress)) + 'px';
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
                element.style.height = '';
                element.style.overflow = '';
            }
        }
        
        requestAnimationFrame(animate);
    },
    
    bounce(element, duration = 600) {
        if (!element) return;
        
        const keyframes = [
            { transform: 'translateY(0px)' },
            { transform: 'translateY(-20px)' },
            { transform: 'translateY(0px)' },
            { transform: 'translateY(-10px)' },
            { transform: 'translateY(0px)' }
        ];
        
        element.animate(keyframes, {
            duration: duration,
            easing: 'ease-in-out'
        });
    }
};

// Rastgele Yardımcılar
const RandomUtils = {
    number(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    string(length = 10) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },
    
    color() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    },
    
    boolean() {
        return Math.random() >= 0.5;
    },
    
    choice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
};

// Global olarak kullanılabilir hale getir
window.DateUtils = DateUtils;
window.StringUtils = StringUtils;
window.ArrayUtils = ArrayUtils;
window.StorageUtils = StorageUtils;
window.ValidationUtils = ValidationUtils;
window.DOMUtils = DOMUtils;
window.EventUtils = EventUtils;
window.AnimationUtils = AnimationUtils;
window.RandomUtils = RandomUtils;

// Kısa yollar
window.$ = DOMUtils.getElement;
window.$$ = DOMUtils.getElements;

console.log('Yardımcı fonksiyonlar yüklendi! 🛠️'); 