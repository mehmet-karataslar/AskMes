// Login JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const userOptions = document.querySelectorAll('.user-option');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.querySelector('.login-btn');
    
    let selectedUser = 'mehmet'; // Varsayılan seçim
    
    // Kullanıcı seçimi event listener'ları
    userOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Önceki seçimi kaldır
            userOptions.forEach(opt => opt.classList.remove('active'));
            
            // Yeni seçimi işaretle
            this.classList.add('active');
            selectedUser = this.dataset.user;
            
            // Focus'u password input'a ver
            passwordInput.focus();
        });
    });
    
    // Enter tuşu ile login
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });
    
    // Otomatik giriş kontrolü
    checkAutoLogin();
    
    // Sayfa yüklendiğinde password input'a focus ver
    setTimeout(() => {
        passwordInput.focus();
    }, 500);
});

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleBtn.className = 'fas fa-eye';
    }
}

function login() {
    console.log('Login fonksiyonu çağrıldı');
    
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const selectedUser = document.querySelector('.user-option.active')?.dataset.user || 'mehmet';
    
    console.log('Login bilgileri:', {
        password: password ? '***' : 'boş',
        rememberMe: rememberMe,
        selectedUser: selectedUser
    });
    
    if (!password) {
        showError('Lütfen şifrenizi girin!');
        return;
    }
    
    // Şifre kontrolü
    const correctPassword = '18032024'; // İlk tanışma tarihi
    
    if (password === correctPassword) {
        // Başarılı giriş
        showSuccess('Giriş başarılı! Yönlendiriliyorsunuz...');
        
        // Kullanıcı bilgilerini kaydet
        localStorage.setItem('currentUser', selectedUser);
        
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }
        
        // Butonu disable et
        const loginBtn = document.querySelector('.login-btn');
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Giriş yapılıyor...';
        
        // Ana sayfaya yönlendir
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } else {
        showError('Hatalı şifre! İpucu: İlk tanışma tarihimiz (GGAAYYYY)');
        
        // Şifre alanını temizle ve focus yap
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
        
        // Input'u kırmızı yap
        document.getElementById('password').style.borderColor = '#dc3545';
        setTimeout(() => {
            document.getElementById('password').style.borderColor = '#e9ecef';
        }, 3000);
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    errorText.textContent = message;
    errorDiv.style.display = 'flex';
    
    // 5 saniye sonra gizle
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    errorText.textContent = message;
    errorDiv.style.display = 'flex';
    errorDiv.style.background = '#d4edda';
    errorDiv.style.color = '#155724';
    errorDiv.style.borderColor = '#c3e6cb';
    
    // İkonu değiştir
    const icon = errorDiv.querySelector('i');
    icon.className = 'fas fa-check-circle';
}

function checkAutoLogin() {
    const rememberMe = localStorage.getItem('rememberMe');
    const currentUser = localStorage.getItem('currentUser');
    
    if (rememberMe === 'true' && currentUser) {
        // Otomatik giriş
        window.location.href = 'index.html';
    }
} 
