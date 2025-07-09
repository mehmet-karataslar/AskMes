// Login Sistemi JavaScript

// Login State
const LoginState = {
    selectedUser: null,
    isLoading: false,
    rememberMe: false,
    passwords: {
        mehmet: '15062023', // İlk buluşma tarihi
        sevgilim: '15062023' // Aynı tarih
    },
    currentMessageIndex: 0,
    messageInterval: null
};

// DOM Elements
let loginForm, userOptions, passwordSection, passwordInput, loginBtn, rememberMeCheckbox;

// DOM Yüklendikten Sonra
document.addEventListener('DOMContentLoaded', function() {
    initializeLogin();
    setupEventListeners();
    startBackgroundAnimations();
    startRomanticMessages();
    checkRememberedUser();
});

// Login Sistemi Başlatma
function initializeLogin() {
    loginForm = document.getElementById('loginForm');
    userOptions = document.querySelectorAll('.user-option');
    passwordSection = document.getElementById('passwordSection');
    passwordInput = document.getElementById('password');
    loginBtn = document.getElementById('loginBtn');
    rememberMeCheckbox = document.getElementById('rememberMe');
    
    console.log('Login sistemi başlatıldı');
}

// Event Listener'ları Ayarla
function setupEventListeners() {
    // Kullanıcı seçimi
    userOptions.forEach(option => {
        option.addEventListener('click', function() {
            selectUser(this.dataset.user);
        });
    });
    
    // Form gönderimi
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Parola input'u
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            clearError();
            if (this.value.length >= 8) {
                validatePassword();
            }
        });
        
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleLogin(e);
            }
        });
    }
    
    // Remember me checkbox
    if (rememberMeCheckbox) {
        rememberMeCheckbox.addEventListener('change', function() {
            LoginState.rememberMe = this.checked;
        });
    }
    
    // Müzik kontrolü
    const musicToggle = document.getElementById('music-toggle');
    if (musicToggle) {
        musicToggle.addEventListener('click', toggleMusic);
    }
}

// Kullanıcı Seçimi
function selectUser(userId) {
    LoginState.selectedUser = userId;
    
    // Görsel güncelleme
    userOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.user === userId) {
            option.classList.add('selected');
        }
    });
    
    // Parola bölümünü göster
    if (passwordSection) {
        passwordSection.style.display = 'block';
        
        // Parola ipucunu güncelle
        updatePasswordHint(userId);
        
        // Focus'u parola input'una ver
        setTimeout(() => {
            if (passwordInput) {
                passwordInput.focus();
            }
        }, 300);
    }
    
    // Kullanıcı durumunu güncelle
    updateUserStatus(userId, 'online');
    
    console.log(`Kullanıcı seçildi: ${userId}`);
}

// Parola İpucunu Güncelle
function updatePasswordHint(userId) {
    const passwordHint = document.getElementById('passwordHint');
    if (passwordHint) {
        const hints = {
            mehmet: 'İpucu: İlk buluşma tarihiniz (GGAAYYYY)',
            sevgilim: 'İpucu: İlk buluşma tarihiniz (GGAAYYYY)'
        };
        
        const hintSpan = passwordHint.querySelector('span');
        if (hintSpan) {
            hintSpan.textContent = hints[userId] || 'İpucu: Özel tarihinizi girin';
        }
    }
}

// Kullanıcı Durumunu Güncelle
function updateUserStatus(userId, status) {
    const statusElement = document.getElementById(`${userId}-status`);
    if (statusElement) {
        statusElement.className = `user-status ${status}`;
    }
}

// Login İşlemi
async function handleLogin(e) {
    e.preventDefault();
    
    if (LoginState.isLoading) return;
    
    const password = passwordInput.value.trim();
    
    if (!LoginState.selectedUser) {
        showError('Lütfen bir kullanıcı seçin');
        return;
    }
    
    if (!password) {
        showError('Lütfen parolanızı girin');
        passwordInput.focus();
        return;
    }
    
    // Loading state
    setLoadingState(true);
    
    try {
        // Parola kontrolü
        await validateLoginCredentials(LoginState.selectedUser, password);
        
        // Başarılı giriş
        await handleSuccessfulLogin();
        
    } catch (error) {
        showError(error.message);
        passwordInput.classList.add('error');
        passwordInput.focus();
        setLoadingState(false);
    }
}

// Parola Doğrulama
function validateLoginCredentials(userId, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const correctPassword = LoginState.passwords[userId];
            
            if (password === correctPassword) {
                resolve();
            } else {
                reject(new Error('Parola yanlış. Lütfen tekrar deneyin.'));
            }
        }, 1000); // Gerçekçi loading süresi
    });
}

// Başarılı Giriş İşlemi
async function handleSuccessfulLogin() {
    // Başarı mesajı göster
    showSuccess('Giriş başarılı! Yönlendiriliyorsunuz...');
    
    // Kullanıcı bilgilerini kaydet
    saveUserSession();
    
    // Kısa bir bekleme
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Ana sayfaya yönlendir
    window.location.href = 'index.html';
}

// Kullanıcı Oturumunu Kaydet
function saveUserSession() {
    const sessionData = {
        userId: LoginState.selectedUser,
        loginTime: new Date().toISOString(),
        rememberMe: LoginState.rememberMe
    };
    
    // Session storage'a kaydet
    sessionStorage.setItem('user_session', JSON.stringify(sessionData));
    
    // Remember me seçiliyse localStorage'a da kaydet
    if (LoginState.rememberMe) {
        localStorage.setItem('remembered_user', LoginState.selectedUser);
    }
    
    console.log('Kullanıcı oturumu kaydedildi:', sessionData);
}

// Hatırlanmış Kullanıcıyı Kontrol Et
function checkRememberedUser() {
    const rememberedUser = localStorage.getItem('remembered_user');
    if (rememberedUser) {
        selectUser(rememberedUser);
        if (rememberMeCheckbox) {
            rememberMeCheckbox.checked = true;
            LoginState.rememberMe = true;
        }
    }
}

// Loading State
function setLoadingState(isLoading) {
    LoginState.isLoading = isLoading;
    
    if (loginBtn) {
        loginBtn.disabled = isLoading;
        loginBtn.classList.toggle('loading', isLoading);
    }
    
    if (passwordInput) {
        passwordInput.disabled = isLoading;
    }
    
    userOptions.forEach(option => {
        option.style.pointerEvents = isLoading ? 'none' : 'auto';
    });
}

// Parola Validasyonu
function validatePassword() {
    const password = passwordInput.value.trim();
    
    if (password.length < 8) {
        return false;
    }
    
    // Tarih formatı kontrolü (GGAAYYYY)
    const dateRegex = /^\d{8}$/;
    if (!dateRegex.test(password)) {
        return false;
    }
    
    return true;
}

// Hata Mesajı Göster
function showError(message) {
    clearMessages();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
    `;
    
    const passwordSection = document.getElementById('passwordSection');
    if (passwordSection) {
        passwordSection.appendChild(errorDiv);
    }
    
    // Otomatik temizleme
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

// Başarı Mesajı Göster
function showSuccess(message) {
    clearMessages();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    const passwordSection = document.getElementById('passwordSection');
    if (passwordSection) {
        passwordSection.appendChild(successDiv);
    }
}

// Mesajları Temizle
function clearMessages() {
    const existingMessages = document.querySelectorAll('.error-message, .success-message');
    existingMessages.forEach(msg => {
        if (msg.parentNode) {
            msg.parentNode.removeChild(msg);
        }
    });
}

// Hata Durumunu Temizle
function clearError() {
    if (passwordInput) {
        passwordInput.classList.remove('error');
    }
    clearMessages();
}

// Romantik Mesajları Başlat
function startRomanticMessages() {
    const messageItems = document.querySelectorAll('.message-item');
    
    if (messageItems.length === 0) return;
    
    // İlk mesajı göster
    showMessage(0);
    
    // Otomatik geçiş
    LoginState.messageInterval = setInterval(() => {
        LoginState.currentMessageIndex = (LoginState.currentMessageIndex + 1) % messageItems.length;
        showMessage(LoginState.currentMessageIndex);
    }, 5000);
}

// Mesaj Göster
function showMessage(index) {
    const messageItems = document.querySelectorAll('.message-item');
    
    messageItems.forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Müzik Kontrolü
function toggleMusic() {
    const musicToggle = document.getElementById('music-toggle');
    const musicPlayer = document.getElementById('background-music');
    
    if (musicPlayer.paused) {
        musicPlayer.play().catch(e => {
            console.log('Müzik çalınamadı:', e);
        });
        musicToggle.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        musicPlayer.pause();
        musicToggle.innerHTML = '<i class="fas fa-music"></i>';
    }
}

// Arka Plan Animasyonları
function startBackgroundAnimations() {
    createParticles();
    createFlyingHearts();
}

function createParticles() {
    const container = document.querySelector('.particle-background');
    if (!container) return;
    
    setInterval(() => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = particle.style.height = Math.random() * 10 + 5 + 'px';
        particle.style.animationDuration = Math.random() * 10 + 10 + 's';
        
        container.appendChild(particle);
        
        setTimeout(() => {
            if (container.contains(particle)) {
                container.removeChild(particle);
            }
        }, 20000);
    }, 3000);
}

function createFlyingHearts() {
    const container = document.querySelector('.heart-container');
    if (!container) return;
    
    setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'flying-heart';
        heart.innerHTML = '💕';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.top = Math.random() * 100 + '%';
        heart.style.animationDuration = Math.random() * 4 + 4 + 's';
        
        container.appendChild(heart);
        
        setTimeout(() => {
            if (container.contains(heart)) {
                container.removeChild(heart);
            }
        }, 8000);
    }, 4000);
}

// Sayfa Kapatılırken Temizlik
window.addEventListener('beforeunload', function() {
    if (LoginState.messageInterval) {
        clearInterval(LoginState.messageInterval);
    }
});

// Hata Yakalama
window.addEventListener('error', function(e) {
    console.error('Login sayfası hatası:', e.error);
});

console.log('Login sistemi yüklendi! 🔐'); 