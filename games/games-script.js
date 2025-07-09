// Ana Oyun Yönetimi
class GameManager {
    constructor() {
        this.stats = this.loadStats();
        this.updateStatsDisplay();
        this.createBackgroundAnimation();
    }

    // Oyun açma fonksiyonu
    openGame(gameId) {
        const gameUrls = {
            'heart-catcher': 'games/heart-catcher.html',
            'memory-game': 'games/memory-game.html',
            'word-finder': 'games/word-finder.html',
            'emoji-guess': 'games/emoji-guess.html',
            'love-quiz': 'games/love-quiz.html'
        };

        if (gameUrls[gameId]) {
            window.location.href = gameUrls[gameId];
        }
    }

    // İstatistikleri yükle
    loadStats() {
        const defaultStats = {
            totalGames: 0,
            highScore: 0,
            favoriteGame: '-',
            gameStats: {}
        };

        const saved = localStorage.getItem('loveGamesStats');
        return saved ? JSON.parse(saved) : defaultStats;
    }

    // İstatistikleri kaydet
    saveStats() {
        localStorage.setItem('loveGamesStats', JSON.stringify(this.stats));
    }

    // İstatistikleri güncelle
    updateGameStats(gameId, score) {
        this.stats.totalGames++;
        
        if (score > this.stats.highScore) {
            this.stats.highScore = score;
        }

        // Oyun bazlı istatistikler
        if (!this.stats.gameStats[gameId]) {
            this.stats.gameStats[gameId] = {
                played: 0,
                bestScore: 0,
                totalScore: 0
            };
        }

        this.stats.gameStats[gameId].played++;
        this.stats.gameStats[gameId].totalScore += score;
        
        if (score > this.stats.gameStats[gameId].bestScore) {
            this.stats.gameStats[gameId].bestScore = score;
        }

        // Favori oyunu hesapla
        this.calculateFavoriteGame();
        
        this.saveStats();
        this.updateStatsDisplay();
    }

    // Favori oyunu hesapla
    calculateFavoriteGame() {
        let maxPlayed = 0;
        let favorite = '-';

        const gameNames = {
            'heart-catcher': 'Kalp Yakalama',
            'memory-game': 'Anı Hafızası',
            'word-finder': 'Kelime Avcısı',
            'emoji-guess': 'Emoji Tahmin',
            'love-quiz': 'Aşk Testi'
        };

        for (const [gameId, stats] of Object.entries(this.stats.gameStats)) {
            if (stats.played > maxPlayed) {
                maxPlayed = stats.played;
                favorite = gameNames[gameId] || gameId;
            }
        }

        this.stats.favoriteGame = favorite;
    }

    // İstatistik ekranını güncelle
    updateStatsDisplay() {
        const totalGamesEl = document.getElementById('totalGames');
        const highScoreEl = document.getElementById('highScore');
        const favoriteGameEl = document.getElementById('favoriteGame');

        if (totalGamesEl) totalGamesEl.textContent = this.stats.totalGames;
        if (highScoreEl) highScoreEl.textContent = this.stats.highScore;
        if (favoriteGameEl) favoriteGameEl.textContent = this.stats.favoriteGame;
    }

    // Arka plan animasyonu oluştur
    createBackgroundAnimation() {
        const heartsContainer = document.querySelector('.hearts');
        const sparklesContainer = document.querySelector('.sparkles');

        // Kalp animasyonu
        setInterval(() => {
            this.createFloatingElement(heartsContainer, '💖', 'heart');
        }, 3000);

        // Yıldız animasyonu
        setInterval(() => {
            this.createFloatingElement(sparklesContainer, '✨', 'sparkle');
        }, 2000);
    }

    // Yüzen element oluştur
    createFloatingElement(container, symbol, className) {
        const element = document.createElement('div');
        element.textContent = symbol;
        element.className = `floating-${className}`;
        element.style.position = 'absolute';
        element.style.left = Math.random() * 100 + '%';
        element.style.fontSize = (Math.random() * 20 + 15) + 'px';
        element.style.opacity = '0.7';
        element.style.pointerEvents = 'none';
        element.style.animation = `floatUp ${Math.random() * 3 + 4}s linear`;

        container.appendChild(element);

        // Animasyon bitince elementi kaldır
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 7000);
    }
}

// Oyun yöneticisini başlat
const gameManager = new GameManager();

// Global fonksiyonlar
function openGame(gameId) {
    gameManager.openGame(gameId);
}

// CSS animasyonları
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        from {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 0.7;
        }
        90% {
            opacity: 0.7;
        }
        to {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
        }
    }
    
    .floating-heart, .floating-sparkle {
        z-index: 1;
        user-select: none;
    }
`;
document.head.appendChild(style);

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    // Oyun kartlarına hover efekti
    const gameCards = document.querySelectorAll('.game-card:not(.coming-soon)');
    gameCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Oyun sonucu bildirimi için global fonksiyon
window.reportGameResult = function(gameId, score) {
    gameManager.updateGameStats(gameId, score);
    
    // Başarı bildirimi göster
    showSuccessNotification(`Harika! ${score} puan aldın! 🎉`);
};

// Bildirim göster
function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #667eea, #764ba2);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-size: 1.1rem;
        z-index: 1000;
        animation: slideIn 0.5s ease;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

// Bildirim animasyonları
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyle); 