// Ana JavaScript Dosyası

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    // Login sayfasında değilsek giriş kontrolü yap
    if (!window.location.pathname.includes('login.html')) {
        checkAuth();
    }
    
    // Navigasyon event listener'ları
    setupNavigation();
    
    // Müzik kontrolü
    setupMusicControl();
    
    // Kullanıcı bilgilerini güncelle
    updateUserDisplay();
});

// Navigasyon kurulumu
function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetSection = this.dataset.section;
            
            // Aktif nav butonunu güncelle
            navBtns.forEach(navBtn => navBtn.classList.remove('active'));
            this.classList.add('active');
            
            // Aktif section'ı güncelle
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// Müzik kontrolü
function setupMusicControl() {
    const musicToggle = document.getElementById('music-toggle');
    const backgroundMusic = document.getElementById('background-music');
    
    if (musicToggle && backgroundMusic) {
        musicToggle.addEventListener('click', function() {
            if (backgroundMusic.paused) {
                backgroundMusic.play();
                this.innerHTML = '<i class="fas fa-pause"></i>';
                this.classList.add('playing');
            } else {
                backgroundMusic.pause();
                this.innerHTML = '<i class="fas fa-music"></i>';
                this.classList.remove('playing');
            }
        });
    }
}

// Kullanıcı bilgilerini güncelle
function updateUserDisplay() {
    const currentUser = getCurrentUser();
    const userDisplays = document.querySelectorAll('[data-user-display]');
    
    userDisplays.forEach(display => {
        if (currentUser === 'mehmet') {
            display.textContent = 'Mehmet';
        } else if (currentUser === 'sevgilim') {
            display.textContent = 'Sevgilim';
        } else {
            display.textContent = 'Kullanıcı';
        }
    });
}

// Mevcut kullanıcıyı al
function getCurrentUser() {
    return localStorage.getItem('currentUser');
}

// Çıkış yap
async function logout() {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        try {
            await api.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        localStorage.removeItem('rememberMe');
        window.location.href = 'login.html';
    }
}

// Giriş kontrolü
function checkAuth() {
    // Login sayfasındaysak kontrol yapma
    if (window.location.pathname.includes('login.html')) {
        return;
    }
    
    const currentUser = getCurrentUser();
    const authToken = localStorage.getItem('authToken');
    
    console.log('CheckAuth - currentUser:', currentUser); // Debug log
    console.log('CheckAuth - authToken:', authToken); // Debug log
    
    // Eğer giriş yapılmamışsa veya token yoksa login sayfasına yönlendir
    if (!currentUser || !authToken) {
        console.log('Redirecting to login - missing user or token'); // Debug log
        window.location.href = 'login.html';
    }
}

// Sayfa geçişleri için smooth scroll
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Notification gösterme
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Notification stillerini ekle
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        padding: 1rem 1.5rem;
        border-radius: 8px;
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    // 3 saniye sonra kaldır
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// CSS animasyonları ekle
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .notification i {
        font-size: 1.2rem;
    }
`;
document.head.appendChild(style);

// Responsive menü için
function toggleMobileMenu() {
    const nav = document.querySelector('.main-nav');
    nav.classList.toggle('mobile-open');
}

// Sayfa yeniden boyutlandırıldığında
window.addEventListener('resize', function() {
    // Mobil menüyü kapat
    const nav = document.querySelector('.main-nav');
    if (nav) {
        nav.classList.remove('mobile-open');
    }
});

// Scroll event'i için header gizleme/gösterme
let lastScrollTop = 0;
window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const header = document.querySelector('.main-header');
    const nav = document.querySelector('.main-nav');
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Aşağı scroll - header'ı gizle
        header.style.transform = 'translateY(-100%)';
        nav.style.transform = 'translateY(-100%)';
    } else {
        // Yukarı scroll - header'ı göster
        header.style.transform = 'translateY(0)';
        nav.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop;
});

// Touch events için mobil optimizasyon
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function(event) {
    touchStartY = event.changedTouches[0].screenY;
});

document.addEventListener('touchend', function(event) {
    touchEndY = event.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Yukarı swipe
            console.log('Yukarı swipe');
        } else {
            // Aşağı swipe
            console.log('Aşağı swipe');
        }
    }
}

// Lazy loading için intersection observer
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Animasyon için elementleri gözlemle
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.action-card, .game-card');
    animateElements.forEach(el => {
        observer.observe(el);
    });
});

// Service Worker kaydı (PWA için)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Çevrimdışı durumu kontrol et
window.addEventListener('online', function() {
    showNotification('İnternet bağlantısı yeniden kuruldu!', 'success');
});

window.addEventListener('offline', function() {
    showNotification('İnternet bağlantısı kesildi!', 'error');
});

// Klavye kısayolları
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + 1-4 ile sekme değiştirme
    if ((event.ctrlKey || event.metaKey) && event.key >= '1' && event.key <= '4') {
        event.preventDefault();
        const sections = ['messages', 'games', 'gifts', 'memories'];
        const sectionIndex = parseInt(event.key) - 1;
        const targetBtn = document.querySelector(`[data-section="${sections[sectionIndex]}"]`);
        if (targetBtn) {
            targetBtn.click();
        }
    }
    
    // Escape ile modal kapatma
    if (event.key === 'Escape') {
        const modal = document.getElementById('gameModal');
        if (modal && modal.style.display === 'block') {
            closeGameModal();
        }
    }
});

// Performans optimizasyonu
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Resize event'ini debounce et
window.addEventListener('resize', debounce(function() {
    // Resize işlemleri
    updateLayout();
}, 250));

function updateLayout() {
    // Layout güncellemeleri
    const isMobile = window.innerWidth <= 768;
    document.body.classList.toggle('mobile-layout', isMobile);
}

// Sayfa yüklendiğinde layout'u güncelle
document.addEventListener('DOMContentLoaded', updateLayout);

// Error handling
window.addEventListener('error', function(event) {
    console.error('JavaScript hatası:', event.error);
    showNotification('Bir hata oluştu. Sayfa yeniden yüklenecek.', 'error');
    
    // 3 saniye sonra sayfayı yenile
    setTimeout(() => {
        window.location.reload();
    }, 3000);
});

// Unhandled promise rejection
window.addEventListener('unhandledrejection', function(event) {
    console.error('Promise hatası:', event.reason);
    showNotification('Bir işlem başarısız oldu.', 'error');
});

// Sayfa görünürlüğü değiştiğinde
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Sayfa gizlendi
        console.log('Sayfa gizlendi');
    } else {
        // Sayfa göründü
        console.log('Sayfa göründü');
        updateUserDisplay();
    }
});

// Memory cleanup
window.addEventListener('beforeunload', function() {
    // Cleanup işlemleri
    if (observer) {
        observer.disconnect();
    }
}); 