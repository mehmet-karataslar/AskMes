// Genel Ayarlar

const AppSettings = {
    // Uygulama Bilgileri
    appName: 'Bizim Özel Dünyamız',
    version: '1.0.0',
    description: 'Mehmet ve Sevgilisi için özel platform',
    
    // Kullanıcı Ayarları
    users: {
        mehmet: {
            name: 'Mehmet',
            displayName: 'Mehmet',
            avatar: 'M',
            color: '#667eea',
            theme: 'light'
        },
        sevgilim: {
            name: 'Sevgilim',
            displayName: 'Sevgilim',
            avatar: 'S',
            color: '#ff6b6b',
            theme: 'light'
        }
    },
    
    // Tema Ayarları
    themes: {
        light: {
            primaryColor: '#667eea',
            secondaryColor: '#764ba2',
            accentColor: '#ff6b6b',
            successColor: '#51cf66',
            warningColor: '#ffd43b',
            backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            textColor: '#333',
            cardBackground: 'rgba(255, 255, 255, 0.95)'
        },
        dark: {
            primaryColor: '#5a67d8',
            secondaryColor: '#553c9a',
            accentColor: '#e53e3e',
            successColor: '#38a169',
            warningColor: '#d69e2e',
            backgroundColor: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
            textColor: '#ecf0f1',
            cardBackground: 'rgba(44, 62, 80, 0.95)'
        },
        romantic: {
            primaryColor: '#e91e63',
            secondaryColor: '#9c27b0',
            accentColor: '#ff4081',
            successColor: '#4caf50',
            warningColor: '#ff9800',
            backgroundColor: 'linear-gradient(135deg, #e91e63 0%, #9c27b0 100%)',
            textColor: '#fff',
            cardBackground: 'rgba(255, 255, 255, 0.9)'
        }
    },
    
    // Özellik Ayarları
    features: {
        messages: {
            enabled: true,
            maxLength: 5000,
            allowImages: true,
            allowFiles: false,
            autoSave: true,
            readReceipts: true
        },
        games: {
            enabled: true,
            saveScores: true,
            showLeaderboard: true,
            allowGuests: false,
            maxGames: 10
        },
        gifts: {
            enabled: true,
            allowVirtual: true,
            allowPhysical: false,
            maxGifts: 50,
            autoNotify: true
        },
        memories: {
            enabled: true,
            allowImages: true,
            allowVideos: false,
            maxMemories: 100,
            autoBackup: true
        }
    },
    
    // Bildirim Ayarları
    notifications: {
        enabled: true,
        sound: true,
        desktop: false,
        email: false,
        duration: 5000,
        position: 'top-right',
        types: {
            newMessage: true,
            newGift: true,
            newMemory: true,
            gameScore: true,
            system: true
        }
    },
    
    // Müzik Ayarları
    music: {
        enabled: true,
        autoPlay: false,
        volume: 0.5,
        loop: true,
        fadeIn: true,
        fadeOut: true,
        tracks: [
            {
                name: 'Romantic Theme',
                file: 'assets/audio/music.mp3',
                duration: 180
            }
        ]
    },
    
    // Animasyon Ayarları
    animations: {
        enabled: true,
        duration: 300,
        easing: 'ease-in-out',
        particles: true,
        hearts: true,
        transitions: true,
        reducedMotion: false
    },
    
    // Veri Ayarları
    data: {
        localStorage: true,
        sessionStorage: false,
        autoSave: true,
        saveInterval: 30000, // 30 saniye
        backupInterval: 300000, // 5 dakika
        maxBackups: 10,
        compression: false
    },
    
    // Güvenlik Ayarları
    security: {
        sessionTimeout: 3600000, // 1 saat
        maxLoginAttempts: 5,
        lockoutDuration: 300000, // 5 dakika
        requireAuth: false,
        encryption: false
    },
    
    // Performans Ayarları
    performance: {
        lazyLoading: true,
        imageOptimization: true,
        caching: true,
        minification: false,
        compression: false,
        maxCacheSize: 50 * 1024 * 1024, // 50MB
        cleanupInterval: 3600000 // 1 saat
    },
    
    // Debugging Ayarları
    debug: {
        enabled: true,
        logLevel: 'info', // error, warn, info, debug
        showConsole: true,
        showPerformance: false,
        showNetworkRequests: false,
        logToFile: false
    },
    
    // API Ayarları (Gelecek için)
    api: {
        baseUrl: '',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    },
    
    // Sosyal Medya Ayarları (Gelecek için)
    social: {
        sharing: false,
        platforms: ['facebook', 'twitter', 'instagram'],
        hashtags: ['#BizimÖzelDünyamız', '#Aşk', '#Sevgi']
    },
    
    // Yedekleme Ayarları
    backup: {
        enabled: true,
        automatic: true,
        interval: 'daily', // daily, weekly, monthly
        location: 'localStorage',
        encryption: false,
        compression: true,
        maxBackups: 7
    }
};

// Ayarları yönetmek için yardımcı fonksiyonlar
const SettingsManager = {
    get(key) {
        const keys = key.split('.');
        let value = AppSettings;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return null;
            }
        }
        
        return value;
    },
    
    set(key, value) {
        const keys = key.split('.');
        let obj = AppSettings;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!(k in obj) || typeof obj[k] !== 'object') {
                obj[k] = {};
            }
            obj = obj[k];
        }
        
        obj[keys[keys.length - 1]] = value;
        this.save();
    },
    
    save() {
        try {
            localStorage.setItem('app_settings', JSON.stringify(AppSettings));
        } catch (error) {
            console.error('Settings save error:', error);
        }
    },
    
    load() {
        try {
            const saved = localStorage.getItem('app_settings');
            if (saved) {
                const savedSettings = JSON.parse(saved);
                Object.assign(AppSettings, savedSettings);
            }
        } catch (error) {
            console.error('Settings load error:', error);
        }
    },
    
    reset() {
        localStorage.removeItem('app_settings');
        location.reload();
    },
    
    export() {
        return JSON.stringify(AppSettings, null, 2);
    },
    
    import(settingsJson) {
        try {
            const importedSettings = JSON.parse(settingsJson);
            Object.assign(AppSettings, importedSettings);
            this.save();
            return true;
        } catch (error) {
            console.error('Settings import error:', error);
            return false;
        }
    }
};

// Ayarları yükle
SettingsManager.load();

// Global olarak kullanılabilir hale getir
window.AppSettings = AppSettings;
window.SettingsManager = SettingsManager;

console.log('Ayarlar yüklendi! ⚙️'); 