// Global Müzik Sistemi
class MusicPlayer {
    constructor() {
        this.audio = null;
        this.isPlaying = false;
        this.musicButton = null;
        this.musicStatus = null;
        this.currentTrack = 'assets/audio/music.mp3';
        
        this.init();
    }
    
    init() {
        // Audio element'i oluştur
        this.createAudioElement();
        
        // DOM yüklendiğinde kontrolleri bağla
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.bindControls());
        } else {
            this.bindControls();
        }
    }
    
    createAudioElement() {
        if (!this.audio) {
            this.audio = new Audio(this.currentTrack);
            this.audio.loop = true;
            this.audio.volume = 0.7;
            
            // Audio event listeners
            this.audio.addEventListener('loadstart', () => {
                console.log('Müzik yükleniyor...');
            });
            
            this.audio.addEventListener('canplay', () => {
                console.log('Müzik hazır');
            });
            
            this.audio.addEventListener('error', (e) => {
                console.error('Müzik hatası:', e);
                this.updateStatus('Müzik Hatası ⚠️');
            });
        }
    }
    
    bindControls() {
        this.musicButton = document.getElementById('musicToggle');
        this.musicStatus = document.getElementById('musicStatus');
        
        if (this.musicButton) {
            this.musicButton.addEventListener('click', () => this.toggle());
        }
        
        // Otomatik başlatma (1 saniye sonra)
        setTimeout(() => {
            if (!this.isPlaying) {
                this.play();
            }
        }, 1000);
    }
    
    async play() {
        try {
            await this.audio.play();
            this.isPlaying = true;
            this.updateUI();
            this.updateStatus('Müzik Çalıyor 🎵');
        } catch (error) {
            console.error('Müzik çalınamadı:', error);
            this.updateStatus('Müzik Çalınamadı ⚠️');
        }
    }
    
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updateUI();
        this.updateStatus('Müzik Durdu 🎵');
    }
    
    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    updateUI() {
        if (this.musicButton) {
            if (this.isPlaying) {
                this.musicButton.innerHTML = '<i class="fas fa-pause"></i>';
                this.musicButton.classList.add('playing');
                this.musicButton.classList.remove('paused');
            } else {
                this.musicButton.innerHTML = '<i class="fas fa-music"></i>';
                this.musicButton.classList.remove('playing');
                this.musicButton.classList.add('paused');
            }
        }
    }
    
    updateStatus(text) {
        if (this.musicStatus) {
            this.musicStatus.textContent = text;
        }
    }
    
    // Sayfa değişikliklerinde müziğin devam etmesi için
    static getInstance() {
        if (!window.globalMusicPlayer) {
            window.globalMusicPlayer = new MusicPlayer();
        }
        return window.globalMusicPlayer;
    }
}

// Global müzik player'ı başlat
const musicPlayer = MusicPlayer.getInstance();

// Global fonksiyon (eski kodlarla uyumluluk için)
window.toggleMusic = () => musicPlayer.toggle();

// Sayfa kapatılırken durumu kaydet
window.addEventListener('beforeunload', () => {
    if (window.musicController) {
        window.musicController.saveState();
    }
});

console.log('Global müzik kontrolcüsü yüklendi! 🎵'); 