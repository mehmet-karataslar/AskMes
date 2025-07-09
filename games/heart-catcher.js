// Kalp Yakalama Oyunu
class HeartCatcherGame {
    constructor() {
        this.gameArea = document.getElementById('gameArea');
        this.gameCanvas = document.getElementById('gameCanvas');
        this.player = document.getElementById('player');
        this.scoreElement = document.getElementById('score');
        this.timeElement = document.getElementById('time');
        this.livesElement = document.getElementById('lives');
        
        this.gameState = 'waiting'; // waiting, playing, gameOver
        this.score = 0;
        this.lives = 3;
        this.timeLeft = 60;
        this.playerPosition = 50; // Yüzde olarak
        
        this.fallingObjects = [];
        this.powerUps = [];
        this.activeEffects = {};
        
        this.gameSpeed = 1;
        this.spawnRate = 0.02;
        this.powerUpSpawnRate = 0.005;
        
        this.setupControls();
        this.setupGameLoop();
    }

    setupControls() {
        // Fare kontrolü
        this.gameArea.addEventListener('mousemove', (e) => {
            if (this.gameState === 'playing') {
                const rect = this.gameArea.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percentage = (x / rect.width) * 100;
                this.playerPosition = Math.max(5, Math.min(95, percentage));
                this.updatePlayerPosition();
            }
        });

        // Dokunma kontrolü
        this.gameArea.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing') {
                const rect = this.gameArea.getBoundingClientRect();
                const x = e.touches[0].clientX - rect.left;
                const percentage = (x / rect.width) * 100;
                this.playerPosition = Math.max(5, Math.min(95, percentage));
                this.updatePlayerPosition();
            }
        });

        // Klavye kontrolü
        document.addEventListener('keydown', (e) => {
            if (this.gameState === 'playing') {
                switch(e.key) {
                    case 'ArrowLeft':
                    case 'a':
                    case 'A':
                        this.playerPosition = Math.max(5, this.playerPosition - 5);
                        this.updatePlayerPosition();
                        break;
                    case 'ArrowRight':
                    case 'd':
                    case 'D':
                        this.playerPosition = Math.min(95, this.playerPosition + 5);
                        this.updatePlayerPosition();
                        break;
                }
            }
        });
    }

    updatePlayerPosition() {
        this.player.style.left = this.playerPosition + '%';
    }

    setupGameLoop() {
        this.gameLoop = setInterval(() => {
            if (this.gameState === 'playing') {
                this.updateGame();
            }
        }, 16); // ~60 FPS
    }

    startGame() {
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.timeLeft = 60;
        this.playerPosition = 50;
        this.fallingObjects = [];
        this.powerUps = [];
        this.activeEffects = {};
        
        this.updateDisplay();
        this.updatePlayerPosition();
        
        // Zamanlayıcı
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    updateGame() {
        // Yeni objeler oluştur
        this.spawnObjects();
        
        // Objeleri hareket ettir
        this.moveObjects();
        
        // Çarpışmaları kontrol et
        this.checkCollisions();
        
        // Ölü objeleri temizle
        this.cleanupObjects();
        
        // Güç artırıcı efektlerini güncelle
        this.updatePowerUps();
    }

    spawnObjects() {
        // Kalp spawn
        if (Math.random() < this.spawnRate * this.gameSpeed) {
            this.createFallingHeart();
        }
        
        // Güç artırıcı spawn
        if (Math.random() < this.powerUpSpawnRate) {
            this.createPowerUp();
        }
    }

    createFallingHeart() {
        const heart = document.createElement('div');
        heart.className = 'falling-heart';
        
        const types = ['pink', 'blue', 'purple', 'black'];
        const weights = [50, 30, 15, 5]; // Yüzde olasılıklar
        const type = this.weightedRandom(types, weights);
        
        heart.classList.add(type);
        heart.textContent = this.getHeartSymbol(type);
        
        heart.style.left = Math.random() * 90 + '%';
        heart.style.animationDuration = (Math.random() * 2 + 3) / this.gameSpeed + 's';
        
        heart.points = this.getHeartPoints(type);
        heart.type = type;
        
        this.gameCanvas.appendChild(heart);
        this.fallingObjects.push(heart);
    }

    createPowerUp() {
        const powerUp = document.createElement('div');
        powerUp.className = 'power-up';
        
        const types = ['slow', 'double', 'shield'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        powerUp.classList.add(type);
        powerUp.textContent = this.getPowerUpSymbol(type);
        
        powerUp.style.left = Math.random() * 90 + '%';
        powerUp.style.animationDuration = (Math.random() * 2 + 4) / this.gameSpeed + 's';
        
        powerUp.powerType = type;
        
        this.gameCanvas.appendChild(powerUp);
        this.powerUps.push(powerUp);
    }

    weightedRandom(items, weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        return items[0];
    }

    getHeartSymbol(type) {
        const symbols = {
            pink: '💖',
            blue: '💙',
            purple: '💜',
            black: '🖤'
        };
        return symbols[type] || '💖';
    }

    getPowerUpSymbol(type) {
        const symbols = {
            slow: '⚡',
            double: '🌟',
            shield: '🛡️'
        };
        return symbols[type] || '⚡';
    }

    getHeartPoints(type) {
        const points = {
            pink: 10,
            blue: 20,
            purple: 30,
            black: -10
        };
        return points[type] || 10;
    }

    moveObjects() {
        // Düşen kalpler için hareket kontrolü gereksiz (CSS animation ile)
        // Sadece pozisyon kontrolü yapacağız
    }

    checkCollisions() {
        const playerRect = this.player.getBoundingClientRect();
        const gameRect = this.gameArea.getBoundingClientRect();
        
        // Kalpler ile çarpışma
        this.fallingObjects.forEach((heart, index) => {
            const heartRect = heart.getBoundingClientRect();
            
            if (this.isColliding(playerRect, heartRect)) {
                this.collectHeart(heart);
                heart.remove();
                this.fallingObjects.splice(index, 1);
            } else if (heartRect.top > gameRect.bottom) {
                // Kalp kaçtı
                if (heart.type !== 'black') {
                    this.loseLife();
                }
                heart.remove();
                this.fallingObjects.splice(index, 1);
            }
        });
        
        // Güç artırıcılar ile çarpışma
        this.powerUps.forEach((powerUp, index) => {
            const powerUpRect = powerUp.getBoundingClientRect();
            
            if (this.isColliding(playerRect, powerUpRect)) {
                this.activatePowerUp(powerUp.powerType);
                powerUp.remove();
                this.powerUps.splice(index, 1);
            } else if (powerUpRect.top > gameRect.bottom) {
                powerUp.remove();
                this.powerUps.splice(index, 1);
            }
        });
    }

    isColliding(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }

    collectHeart(heart) {
        let points = heart.points;
        
        // Çift puan efekti
        if (this.activeEffects.double) {
            points *= 2;
        }
        
        this.score += points;
        this.updateDisplay();
        
        // Puan popup efekti
        this.showScorePopup(points, heart.getBoundingClientRect());
        
        // Negatif puan durumunda can kaybı
        if (points < 0 && !this.activeEffects.shield) {
            this.loseLife();
        }
    }

    activatePowerUp(type) {
        switch(type) {
            case 'slow':
                this.activeEffects.slow = Date.now() + 3000;
                this.gameSpeed = 0.5;
                this.showPowerUpEffect('Yavaşlatma! ⚡', 'slow');
                break;
            case 'double':
                this.activeEffects.double = Date.now() + 5000;
                this.showPowerUpEffect('Çift Puan! 🌟', 'double');
                break;
            case 'shield':
                this.activeEffects.shield = Date.now() + 10000;
                this.showPowerUpEffect('Kalkan! 🛡️', 'shield');
                break;
        }
    }

    updatePowerUps() {
        const now = Date.now();
        
        // Yavaşlatma efekti
        if (this.activeEffects.slow && now > this.activeEffects.slow) {
            delete this.activeEffects.slow;
            this.gameSpeed = 1;
            this.removePowerUpEffect();
        }
        
        // Çift puan efekti
        if (this.activeEffects.double && now > this.activeEffects.double) {
            delete this.activeEffects.double;
            this.removePowerUpEffect();
        }
        
        // Kalkan efekti
        if (this.activeEffects.shield && now > this.activeEffects.shield) {
            delete this.activeEffects.shield;
            this.removePowerUpEffect();
        }
    }

    showScorePopup(points, rect) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.classList.add(points > 0 ? 'positive' : 'negative');
        popup.textContent = (points > 0 ? '+' : '') + points;
        
        popup.style.left = rect.left + 'px';
        popup.style.top = rect.top + 'px';
        
        document.body.appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 1000);
    }

    showPowerUpEffect(message, type) {
        const existing = document.querySelector('.power-up-effect');
        if (existing) existing.remove();
        
        const effect = document.createElement('div');
        effect.className = 'power-up-effect';
        effect.classList.add(type);
        effect.textContent = message;
        
        this.gameCanvas.appendChild(effect);
    }

    removePowerUpEffect() {
        const effect = document.querySelector('.power-up-effect');
        if (effect) effect.remove();
    }

    loseLife() {
        this.lives--;
        this.updateDisplay();
        
        if (this.lives <= 0) {
            this.endGame();
        }
    }

    cleanupObjects() {
        // Ekrandan çıkan objeleri temizle
        this.fallingObjects = this.fallingObjects.filter(heart => {
            if (heart.parentNode) return true;
            return false;
        });
        
        this.powerUps = this.powerUps.filter(powerUp => {
            if (powerUp.parentNode) return true;
            return false;
        });
    }

    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.timeElement.textContent = this.timeLeft;
        this.livesElement.textContent = '💖'.repeat(this.lives);
    }

    endGame() {
        this.gameState = 'gameOver';
        clearInterval(this.timer);
        
        // Tüm objeleri temizle
        this.fallingObjects.forEach(heart => heart.remove());
        this.powerUps.forEach(powerUp => powerUp.remove());
        
        // Efektleri temizle
        const effects = document.querySelectorAll('.power-up-effect');
        effects.forEach(effect => effect.remove());
        
        // Oyun bitti ekranını göster
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'block';
        
        // Final skorunu göster
        document.getElementById('finalScore').textContent = this.score;
        
        // Skor mesajı
        const scoreMessage = document.getElementById('scoreMessage');
        if (this.score >= 500) {
            scoreMessage.textContent = "Mükemmel! Sen gerçek bir kalp avcısısın! 💖";
        } else if (this.score >= 300) {
            scoreMessage.textContent = "Harika! Çok iyi oynadın! 🌟";
        } else if (this.score >= 150) {
            scoreMessage.textContent = "İyi! Biraz daha pratik yapabilirsin! 😊";
        } else {
            scoreMessage.textContent = "Başlangıç için fena değil! Tekrar dene! 💪";
        }
        
        // Ana sayfaya skor bildir
        if (window.parent && window.parent.reportGameResult) {
            window.parent.reportGameResult('heart-catcher', this.score);
        }
    }
}

// Oyun yönetimi
let game;

function startGame() {
    if (!game) {
        game = new HeartCatcherGame();
    }
    game.startGame();
}

function restartGame() {
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'block';
}

function goBack() {
    window.location.href = '../games.html';
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    // Oyun nesnesi oluştur ama başlatma
    game = new HeartCatcherGame();
}); 