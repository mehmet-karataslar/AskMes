// Kimlik Doğrulama Sistemi

// Auth State
const AuthState = {
    currentUser: null,
    isAuthenticated: false,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 saat
    checkInterval: null
};

// Auth kontrolü geçici olarak devre dışı bırakıldı
// document.addEventListener('DOMContentLoaded', function() {
//     checkAuthentication();
//     startSessionCheck();
// });

// Kimlik Doğrulama Kontrolü
function checkAuthentication() {
    const sessionData = sessionStorage.getItem('user_session');
    
    if (!sessionData) {
        redirectToLogin();
        return false;
    }
    
    try {
        const session = JSON.parse(sessionData);
        const loginTime = new Date(session.loginTime);
        const now = new Date();
        
        // Oturum süresi kontrolü
        if (now - loginTime > AuthState.sessionTimeout) {
            clearSession();
            redirectToLogin();
            return false;
        }
        
        // Kullanıcı bilgilerini ayarla
        AuthState.currentUser = session.userId;
        AuthState.isAuthenticated = true;
        
        // Kullanıcı adını güncelle
        updateUserDisplay();
        
        return true;
        
    } catch (error) {
        console.error('Oturum verisi okunamadı:', error);
        clearSession();
        redirectToLogin();
        return false;
    }
}

// Kullanıcı Görüntüsünü Güncelle
function updateUserDisplay() {
    const userElements = document.querySelectorAll('[data-user-display]');
    const userNames = {
        mehmet: 'Mehmet',
        sevgilim: 'Sevgilim'
    };
    
    userElements.forEach(element => {
        element.textContent = userNames[AuthState.currentUser] || 'Kullanıcı';
    });
}

// Oturum Kontrolü Başlat
function startSessionCheck() {
    // Her 5 dakikada bir oturum kontrolü yap
    AuthState.checkInterval = setInterval(() => {
        if (!checkAuthentication()) {
            clearInterval(AuthState.checkInterval);
        }
    }, 5 * 60 * 1000);
}

// Oturumu Temizle
function clearSession() {
    sessionStorage.removeItem('user_session');
    AuthState.currentUser = null;
    AuthState.isAuthenticated = false;
    
    if (AuthState.checkInterval) {
        clearInterval(AuthState.checkInterval);
    }
}

// Login Sayfasına Yönlendir
function redirectToLogin() {
    // Eğer zaten login sayfasında değilsek yönlendir
    if (!window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
    }
}

// Çıkış Yap
function logout() {
    // Oturum verilerini temizle
    clearSession();
    localStorage.removeItem('remembered_user');
    
    // Login sayfasına yönlendir
    redirectToLogin();
}

// Geçerli Kullanıcıyı Al
function getCurrentUser() {
    return AuthState.currentUser;
}

// Kimlik Doğrulama Durumunu Kontrol Et
function isAuthenticated() {
    return AuthState.isAuthenticated;
}

// Oturum Süresini Yenile
function refreshSession() {
    const sessionData = sessionStorage.getItem('user_session');
    if (sessionData) {
        try {
            const session = JSON.parse(sessionData);
            session.loginTime = new Date().toISOString();
            sessionStorage.setItem('user_session', JSON.stringify(session));
        } catch (error) {
            console.error('Oturum yenilenemedi:', error);
        }
    }
}

// Sayfa Kapatılırken Temizlik
window.addEventListener('beforeunload', function() {
    if (AuthState.checkInterval) {
        clearInterval(AuthState.checkInterval);
    }
});

console.log('Auth sistemi yüklendi! 🔐'); 