// Global Müzik Kontrolü Sistemi
class MusicController {
    constructor() {
        this.isPlaying = false;
        this.isInitialized = false;
        this.audio = null;
        this.musicToggle = null;
        this.musicStatus = null;
        
        // LocalStorage'dan durum oku
        const savedState = localStorage.getItem('musicPlaying');
        this.isPlaying = savedState === 'true';
        
        this.init();
    }
    
    init() {
        // DOM yüklendiğinde çalıştır
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupMusic());
        } else {
            this.setupMusic();
        }
    }
    
    setupMusic() {
        // Audio elementi bul veya oluştur
        this.audio = document.getElementById('backgroundMusic');
        if (!this.audio) {
            this.createAudioElement();
        }
        
        // Kontrol elementlerini bul
        this.musicToggle = document.getElementById('musicToggle');
        this.musicStatus = document.getElementById('musicStatus');
        
        if (this.musicToggle) {
            this.musicToggle.addEventListener('click', () => this.toggle());
        }
        
        // Müzik durumunu güncelle
        this.updateUI();
        
        // Otomatik başlatma (sadece ana sayfada)
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            setTimeout(() => {
                if (!this.isPlaying) {
                    this.play();
                }
            }, 1500);
        } else {
            // Diğer sayfalarda saved state'e göre çal
            if (this.isPlaying) {
                setTimeout(() => this.play(), 500);
            }
        }
        
        this.isInitialized = true;
    }
    
    createAudioElement() {
        this.audio = document.createElement('audio');
        this.audio.id = 'backgroundMusic';
        this.audio.loop = true;
        this.audio.volume = 0.7;
        
        const source = document.createElement('source');
        source.src = this.getAudioPath();
        source.type = 'audio/mpeg';
        
        this.audio.appendChild(source);
        document.body.appendChild(this.audio);
    }
    
    getAudioPath() {
        // Sayfa konumuna göre doğru path döndür
        const currentPath = window.location.pathname;
        if (currentPath.includes('/pages/')) {
            return '../assets/audio/music.mp3';
        } else {
            return 'assets/audio/music.mp3';
        }
    }
    
    async play() {
        if (!this.audio) return;
        
        try {
            await this.audio.play();
            this.isPlaying = true;
            this.saveState();
            this.updateUI();
        } catch (error) {
            console.log('Müzik çalınamadı:', error);
            this.updateStatus('Müzik Hatası ⚠️');
        }
    }
    
    pause() {
        if (!this.audio) return;
        
        this.audio.pause();
        this.isPlaying = false;
        this.saveState();
        this.updateUI();
    }
    
    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    updateUI() {
        if (!this.musicToggle) return;
        
        if (this.isPlaying) {
            this.musicToggle.innerHTML = '<i class="fas fa-pause"></i>';
            this.musicToggle.classList.remove('paused');
            this.musicToggle.classList.add('playing');
            this.updateStatus('Müzik Çalıyor 🎵');
        } else {
            this.musicToggle.innerHTML = '<i class="fas fa-music"></i>';
            this.musicToggle.classList.remove('playing');
            this.musicToggle.classList.add('paused');
            this.updateStatus('Müzik Durdu 🎵');
        }
    }
    
    updateStatus(text) {
        if (this.musicStatus) {
            this.musicStatus.textContent = text;
        }
    }
    
    saveState() {
        localStorage.setItem('musicPlaying', this.isPlaying.toString());
    }
    
    // Sayfa değişimlerinde çağırılacak
    syncWithOtherPages() {
        // Diğer sayfalardan müzik durumu değiştiğinde
        window.addEventListener('storage', (e) => {
            if (e.key === 'musicPlaying') {
                const newState = e.newValue === 'true';
                if (newState !== this.isPlaying) {
                    if (newState) {
                        this.play();
                    } else {
                        this.pause();
                    }
                }
            }
        });
    }
}

// Global müzik kontrolcüsü oluştur
window.musicController = new MusicController();

// Eski fonksiyonlarla uyumluluk için
function toggleMusic() {
    if (window.musicController) {
        window.musicController.toggle();
    }
}

// Sayfa kapatılırken durumu kaydet
window.addEventListener('beforeunload', () => {
    if (window.musicController) {
        window.musicController.saveState();
    }
});

console.log('Global müzik kontrolcüsü yüklendi! 🎵'); 