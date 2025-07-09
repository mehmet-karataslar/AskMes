// Ana Sayfa JavaScript - Yeni Tasarım

// Uygulama Durumu
const AppState = {
    currentUser: 'mehmet',
    currentTab: 'messages',
    musicPlaying: false,
    notifications: [],
    data: {
        messages: [],
        games: [],
        gifts: [],
        memories: []
    }
};

// DOM Yüklendikten Sonra Çalışacak Fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadInitialData();
    startBackgroundAnimations();
});

// Uygulama Başlatma
function initializeApp() {
    console.log('Suprizler Uygulaması Başlatılıyor...');
    
    // Kullanıcı durumunu ayarla
    setActiveUser(AppState.currentUser);
    
    // Aktif sekmeyi ayarla
    switchTab(AppState.currentTab);
    
    // Bildirim sayılarını güncelle
    updateNotificationBadges();
    
    // Müzik durumunu ayarla
    updateMusicButton();
}

// Event Listener'ları Ayarla
function setupEventListeners() {
    // Kullanıcı Seçimi
    document.querySelectorAll('.user-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.dataset.user;
            setActiveUser(userId);
        });
    });
    
    // Sekme Navigasyonu
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            switchTab(tabId);
        });
    });
    
    // Müzik Kontrolü
    const musicToggle = document.getElementById('music-toggle');
    if (musicToggle) {
        musicToggle.addEventListener('click', toggleMusic);
    }
    
    // Ekleme Butonları
    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.dataset.section;
            openAddModal(section);
        });
    });
    
    // Modal Kapatma
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            closeModal();
        }
        if (e.target.classList.contains('modal-close')) {
            closeModal();
        }
    });
    
    // ESC tuşu ile modal kapatma
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Kullanıcı Değiştirme
function setActiveUser(userId) {
    AppState.currentUser = userId;
    
    // Aktif kullanıcı butonunu güncelle
    document.querySelectorAll('.user-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.user === userId) {
            btn.classList.add('active');
        }
    });
    
    // Kullanıcıya özel verileri yükle
    loadUserData(userId);
    
    // İçeriği güncelle
    updateCurrentTabContent();
    
    console.log(`Aktif kullanıcı: ${userId}`);
}

// Sekme Değiştirme
function switchTab(tabId) {
    AppState.currentTab = tabId;
    
    // Aktif sekmeyi güncelle
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabId) {
            tab.classList.add('active');
        }
    });
    
    // İçerik bölümlerini güncelle
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
        if (section.id === `${tabId}-section`) {
            section.classList.add('active');
        }
    });
    
    // Sekmeye özel içeriği yükle
    loadTabContent(tabId);
    
    console.log(`Aktif sekme: ${tabId}`);
}

// Müzik Kontrolü
function toggleMusic() {
    const musicToggle = document.getElementById('music-toggle');
    const musicPlayer = document.getElementById('background-music');
    
    if (AppState.musicPlaying) {
        if (musicPlayer) {
            musicPlayer.pause();
        }
        musicToggle.classList.remove('playing');
        musicToggle.innerHTML = '<i class="fas fa-play"></i>';
        AppState.musicPlaying = false;
    } else {
        if (musicPlayer) {
            musicPlayer.play().catch(e => {
                console.log('Müzik çalınamadı:', e);
                showNotification('Müzik çalınamadı. Tarayıcı izni gerekli.', 'warning');
            });
        }
        musicToggle.classList.add('playing');
        musicToggle.innerHTML = '<i class="fas fa-pause"></i>';
        AppState.musicPlaying = true;
    }
}

function updateMusicButton() {
    const musicToggle = document.getElementById('music-toggle');
    if (musicToggle) {
        if (AppState.musicPlaying) {
            musicToggle.classList.add('playing');
            musicToggle.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            musicToggle.classList.remove('playing');
            musicToggle.innerHTML = '<i class="fas fa-play"></i>';
        }
    }
}

// Bildirim Sistemi
function updateNotificationBadges() {
    const badges = {
        messages: getUnreadMessageCount(),
        games: getNewGameCount(),
        gifts: getNewGiftCount(),
        memories: getNewMemoryCount()
    };
    
    Object.keys(badges).forEach(section => {
        const badge = document.querySelector(`[data-tab="${section}"] .notification-badge`);
        if (badge) {
            const count = badges[section];
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    });
}

function getUnreadMessageCount() {
    return AppState.data.messages.filter(msg => 
        !msg.read && msg.recipient === AppState.currentUser
    ).length;
}

function getNewGameCount() {
    return AppState.data.games.filter(game => 
        game.isNew && !game.played
    ).length;
}

function getNewGiftCount() {
    return AppState.data.gifts.filter(gift => 
        gift.recipient === AppState.currentUser && !gift.opened
    ).length;
}

function getNewMemoryCount() {
    return AppState.data.memories.filter(memory => 
        memory.isNew && !memory.viewed
    ).length;
}

// Veri Yükleme
function loadInitialData() {
    // Başlangıç verileri
    AppState.data.messages = [
        {
            id: 1,
            sender: 'mehmet',
            recipient: 'sevgilim',
            title: 'Günaydın Canım Aşkım',
            content: `Günaydın canım aşkım ❤️

Bugün de gözlerimi açtığımda aklıma ilk gelen sen oldun. Umarım güzel rüyalar görmüşsündür ve bugün senin için harika bir gün olur.

Seni çok seviyorum ve her geçen gün daha da çok seviyorum. Sen benim hayatımın en güzel hediyesisin.

Öpücüklerle,
Mehmet 💕`,
            date: new Date('2024-01-15'),
            read: false,
            featured: true,
            type: 'Aşk Mektubu'
        }
    ];
    
    AppState.data.games = [
        {
            id: 1,
            name: 'Kalp Yakalama',
            description: 'Düşen kalpleri yakala ve puan kazan!',
            icon: '💖',
            difficulty: 'Kolay',
            played: false,
            isNew: true,
            highScore: 0,
            lastPlayed: null
        },
        {
            id: 2,
            name: 'Hafıza Oyunu',
            description: 'Kartları eşleştir ve hafızanı güçlendir!',
            icon: '🧠',
            difficulty: 'Orta',
            played: false,
            isNew: true,
            highScore: 0,
            lastPlayed: null
        }
    ];
    
    AppState.data.gifts = [
        {
            id: 1,
            sender: 'mehmet',
            recipient: 'sevgilim',
            title: 'Sanal Gül Buketi',
            description: 'Sana olan sevgimin bir göstergesi',
            icon: '🌹',
            date: new Date(),
            opened: false,
            content: '12 adet kırmızı gül ve sonsuz sevgi 💕'
        }
    ];
    
    AppState.data.memories = [
        {
            id: 1,
            title: 'İlk Tanışma',
            description: 'O güzel günü hiç unutmayacağım',
            date: new Date('2023-06-15'),
            image: null,
            content: 'İlk kez gözlerinin içine baktığım o an...',
            isNew: true,
            viewed: false
        }
    ];
}

function loadUserData(userId) {
    // Kullanıcıya özel verileri localStorage'dan yükle
    const userData = localStorage.getItem(`user_${userId}_data`);
    if (userData) {
        const parsedData = JSON.parse(userData);
        AppState.data = { ...AppState.data, ...parsedData };
    }
}

function saveUserData() {
    // Kullanıcı verilerini localStorage'a kaydet
    localStorage.setItem(`user_${AppState.currentUser}_data`, JSON.stringify(AppState.data));
}

// İçerik Yükleme
function loadTabContent(tabId) {
    switch(tabId) {
        case 'messages':
            renderMessages();
            break;
        case 'games':
            renderGames();
            break;
        case 'gifts':
            renderGifts();
            break;
        case 'memories':
            renderMemories();
            break;
    }
}

function updateCurrentTabContent() {
    loadTabContent(AppState.currentTab);
}

// Mesajlar Render
function renderMessages() {
    const container = document.getElementById('messages-container');
    if (!container) return;
    
    const userMessages = AppState.data.messages.filter(msg => 
        msg.recipient === AppState.currentUser || msg.sender === AppState.currentUser
    );
    
    if (userMessages.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-envelope" style="font-size: 3rem; color: var(--text-light); margin-bottom: 20px;"></i>
                <p>Henüz mesaj yok. İlk mesajı gönderin!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = userMessages.map(msg => `
        <div class="message-card ${msg.featured ? 'featured' : ''}">
            <div class="message-header">
                <div class="sender-info">
                    <div class="sender-avatar">
                        ${msg.sender === 'mehmet' ? 'M' : 'S'}
                    </div>
                    <div class="sender-details">
                        <div class="sender-name">${msg.sender === 'mehmet' ? 'Mehmet' : 'Sevgilim'}</div>
                        <div class="message-date">${formatDate(msg.date)}</div>
                    </div>
                </div>
                <div class="message-type">
                    <i class="fas fa-heart"></i>
                    ${msg.type}
                </div>
            </div>
            <div class="message-preview">
                <h3>${msg.title}</h3>
                <p>${msg.content.substring(0, 150)}${msg.content.length > 150 ? '...' : ''}</p>
                <div class="message-actions">
                    <button class="action-btn primary" onclick="openMessage(${msg.id})">
                        <i class="fas fa-eye"></i> Oku
                    </button>
                    <button class="action-btn" onclick="replyToMessage(${msg.id})">
                        <i class="fas fa-reply"></i> Yanıtla
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Oyunlar Render
function renderGames() {
    const container = document.getElementById('games-container');
    if (!container) return;
    
    container.innerHTML = AppState.data.games.map(game => `
        <div class="game-card ${game.played ? '' : 'new'}" onclick="playGame(${game.id})">
            <div class="difficulty-badge ${game.difficulty.toLowerCase()}">${game.difficulty}</div>
            <div class="game-icon">${game.icon}</div>
            <h3>${game.name}</h3>
            <p>${game.description}</p>
            <div class="game-stats">
                <span>En Yüksek: ${game.highScore}</span>
                <span>${game.lastPlayed ? formatDate(game.lastPlayed) : 'Hiç oynanmadı'}</span>
            </div>
        </div>
    `).join('') + `
        <div class="game-card coming-soon">
            <div class="coming-soon-badge">Yakında</div>
            <div class="game-icon">🎮</div>
            <h3>Yeni Oyun</h3>
            <p>Yeni bir oyun geliştiriliyor...</p>
        </div>
    `;
}

// Hediyeler Render
function renderGifts() {
    const container = document.getElementById('gifts-container');
    if (!container) return;
    
    const userGifts = AppState.data.gifts.filter(gift => 
        gift.recipient === AppState.currentUser
    );
    
    if (userGifts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-gift" style="font-size: 3rem; color: var(--text-light); margin-bottom: 20px;"></i>
                <p>Henüz hediye yok. İlk hediyeyi gönderin!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = userGifts.map(gift => `
        <div class="gift-card ${gift.opened ? 'opened' : 'new'}">
            <div class="gift-icon">${gift.icon}</div>
            <div class="gift-info">
                <h3>${gift.title}</h3>
                <p>${gift.description}</p>
                <div class="gift-date">${formatDate(gift.date)}</div>
            </div>
            ${gift.opened ? 
                `<button class="gift-view-btn" onclick="viewGift(${gift.id})">
                    <i class="fas fa-eye"></i> Görüntüle
                </button>` :
                `<button class="gift-open-btn" onclick="openGift(${gift.id})">
                    <i class="fas fa-gift"></i> Aç
                </button>`
            }
        </div>
    `).join('');
}

// Anılar Render
function renderMemories() {
    const container = document.getElementById('memories-container');
    if (!container) return;
    
    const memoriesHtml = AppState.data.memories.map(memory => `
        <div class="memory-card" onclick="viewMemory(${memory.id})">
            <div class="memory-image">
                ${memory.image ? `<img src="${memory.image}" alt="${memory.title}">` : '<i class="fas fa-heart"></i>'}
            </div>
            <div class="memory-info">
                <h3>${memory.title}</h3>
                <p>${memory.description}</p>
                <div class="memory-date">${formatDate(memory.date)}</div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = memoriesHtml + `
        <div class="add-memory-card" onclick="openAddModal('memories')">
            <div class="add-memory-icon">
                <i class="fas fa-plus"></i>
            </div>
            <p>Yeni Anı Ekle</p>
        </div>
    `;
}

// Yardımcı Fonksiyonlar
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Modal Fonksiyonları
function openAddModal(section) {
    console.log(`${section} için ekleme modalı açılıyor`);
    showNotification(`${section} ekleme özelliği yakında aktif olacak!`, 'info');
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay.active');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Oyun Fonksiyonları
function playGame(gameId) {
    const game = AppState.data.games.find(g => g.id === gameId);
    if (game) {
        console.log(`${game.name} oyunu başlatılıyor`);
        showNotification(`${game.name} oyunu yakında aktif olacak!`, 'info');
    }
}

// Mesaj Fonksiyonları
function openMessage(messageId) {
    const message = AppState.data.messages.find(m => m.id === messageId);
    if (message) {
        console.log(`Mesaj açılıyor: ${message.title}`);
        showNotification('Mesaj detay sayfası yakında aktif olacak!', 'info');
    }
}

function replyToMessage(messageId) {
    console.log(`Mesaj yanıtlanıyor: ${messageId}`);
    showNotification('Mesaj yanıtlama özelliği yakında aktif olacak!', 'info');
}

// Hediye Fonksiyonları
function openGift(giftId) {
    const gift = AppState.data.gifts.find(g => g.id === giftId);
    if (gift) {
        gift.opened = true;
        saveUserData();
        renderGifts();
        updateNotificationBadges();
        showNotification(`${gift.title} hediyesi açıldı!`, 'success');
    }
}

function viewGift(giftId) {
    const gift = AppState.data.gifts.find(g => g.id === giftId);
    if (gift) {
        console.log(`Hediye görüntüleniyor: ${gift.title}`);
        showNotification('Hediye detay sayfası yakında aktif olacak!', 'info');
    }
}

// Anı Fonksiyonları
function viewMemory(memoryId) {
    const memory = AppState.data.memories.find(m => m.id === memoryId);
    if (memory) {
        memory.viewed = true;
        saveUserData();
        updateNotificationBadges();
        console.log(`Anı görüntüleniyor: ${memory.title}`);
        showNotification('Anı detay sayfası yakında aktif olacak!', 'info');
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
    }, 2000);
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
    }, 3000);
}

// Uygulama başlatma
console.log('Suprizler Uygulaması Yüklendi! 💕'); 