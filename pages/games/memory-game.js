// Memory Game - Anı Hafızası Oyunu
class MemoryGame {
    constructor() {
        this.gameState = 'waiting'; // waiting, playing, paused, completed
        this.difficulty = null;
        this.score = 0;
        this.moves = 0;
        this.time = 0;
        this.timer = null;
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        
        // Aşk temalı kartlar
        this.symbols = ['💖', '💕', '💘', '💝', '💗', '💞', '💓', '💯', '🌹', '🌷', '🎁', '💍', '👑', '✨', '🌟', '💫', '🦋', '🌺', '🥰', '😍', '😘', '💋', '💐', '🍓'];
        
        this.initializeGame();
    }

    initializeGame() {
        this.updateDisplay();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Zorluk seçimi
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.difficulty = btn.onclick.toString().match(/'(\w+)'/)[1];
                document.getElementById('startBtn').disabled = false;
            });
        });
    }

    selectDifficulty(diff) {
        this.difficulty = diff;
        document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('selected'));
        event.target.closest('.difficulty-btn').classList.add('selected');
        document.getElementById('startBtn').disabled = false;
    }

    startGame() {
        if (!this.difficulty) return;

        this.gameState = 'playing';
        this.score = 0;
        this.moves = 0;
        this.time = 0;
        this.matchedPairs = 0;
        this.flippedCards = [];
        
        // Zorluk seviyesine göre ayarlar
        const settings = {
            easy: { cols: 4, rows: 3, pairs: 6 },
            medium: { cols: 4, rows: 4, pairs: 8 },
            hard: { cols: 6, rows: 4, pairs: 12 }
        };
        
        const setting = settings[this.difficulty];
        this.totalPairs = setting.pairs;
        
        // Ekranları değiştir
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        
        // Oyun tahtasını oluştur
        this.createGameBoard(setting);
        
        // Zamanlayıcıyı başlat
        this.startTimer();
        
        this.updateDisplay();
    }

    createGameBoard(setting) {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        gameBoard.className = `game-board ${this.difficulty}`;
        
        // Kart çiftlerini oluştur
        const gameSymbols = this.symbols.slice(0, this.totalPairs);
        const cardSymbols = [...gameSymbols, ...gameSymbols]; // Çiftleri oluştur
        
        // Kartları karıştır
        this.shuffleArray(cardSymbols);
        
        // Kartları oluştur
        this.cards = [];
        cardSymbols.forEach((symbol, index) => {
            const card = this.createCard(symbol, index);
            gameBoard.appendChild(card);
            this.cards.push({
                element: card,
                symbol: symbol,
                id: index,
                isFlipped: false,
                isMatched: false
            });
        });
    }

    createCard(symbol, id) {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.id = id;
        
        card.innerHTML = `
            <div class="card-front">${symbol}</div>
            <div class="card-back">❤️</div>
        `;
        
        card.addEventListener('click', () => this.flipCard(id));
        
        return card;
    }

    flipCard(cardId) {
        if (this.gameState !== 'playing') return;
        
        const card = this.cards[cardId];
        if (card.isFlipped || card.isMatched || this.flippedCards.length >= 2) return;
        
        // Kartı çevir
        card.element.classList.add('flipped');
        card.isFlipped = true;
        this.flippedCards.push(card);
        
        // İki kart çevrildi mi?
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateDisplay();
            
            setTimeout(() => {
                this.checkMatch();
            }, 1000);
        }
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        
        if (card1.symbol === card2.symbol) {
            // Eşleşme var
            card1.isMatched = true;
            card2.isMatched = true;
            card1.element.classList.add('matched');
            card2.element.classList.add('matched');
            
            this.matchedPairs++;
            this.score += this.calculateScore();
            
            // Tüm çiftler eşleşti mi?
            if (this.matchedPairs === this.totalPairs) {
                this.endGame();
            }
        } else {
            // Eşleşme yok
            card1.element.classList.remove('flipped');
            card2.element.classList.remove('flipped');
            card1.element.classList.add('shake');
            card2.element.classList.add('shake');
            
            setTimeout(() => {
                card1.element.classList.remove('shake');
                card2.element.classList.remove('shake');
            }, 500);
            
            card1.isFlipped = false;
            card2.isFlipped = false;
        }
        
        this.flippedCards = [];
        this.updateDisplay();
    }

    calculateScore() {
        const baseScore = 100;
        const timeBonus = Math.max(0, 60 - this.time);
        const movesPenalty = this.moves * 2;
        return Math.max(10, baseScore + timeBonus - movesPenalty);
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.time++;
            this.updateDisplay();
        }, 1000);
    }

    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('moves').textContent = this.moves;
        document.getElementById('time').textContent = this.formatTime(this.time);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    endGame() {
        this.gameState = 'completed';
        clearInterval(this.timer);
        
        // Final skorunu hesapla
        const finalScore = this.score + (this.totalPairs * 50) - (this.time * 2);
        
        // Ekranları değiştir
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'block';
        
        // Final istatistikleri göster
        document.getElementById('finalScore').textContent = finalScore;
        document.getElementById('finalMoves').textContent = this.moves;
        document.getElementById('finalTime').textContent = this.formatTime(this.time);
        
        // Performans mesajı
        const performanceMessage = document.getElementById('performanceMessage');
        if (this.moves <= this.totalPairs + 2) {
            performanceMessage.textContent = "Mükemmel hafıza! 🌟";
        } else if (this.moves <= this.totalPairs + 5) {
            performanceMessage.textContent = "Harika performans! 💫";
        } else if (this.moves <= this.totalPairs + 10) {
            performanceMessage.textContent = "İyi oynadın! ✨";
        } else {
            performanceMessage.textContent = "Pratikle daha da iyileşebilirsin! 💪";
        }
        
        // Ana sayfaya skor bildir
        if (window.reportGameResult) {
            window.reportGameResult('memory-game', finalScore);
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    restartGame() {
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('startScreen').style.display = 'block';
        this.gameState = 'waiting';
        clearInterval(this.timer);
    }

    goBack() {
        window.location.href = 'index.html';
    }
}

// Global fonksiyonlar
let game;

function selectDifficulty(difficulty) {
    if (game) {
        game.selectDifficulty(difficulty);
    }
}

function startGame() {
    if (game) {
        game.startGame();
    }
}

function restartGame() {
    if (game) {
        game.restartGame();
    }
}

function goBack() {
    if (game) {
        game.goBack();
    }
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    game = new MemoryGame();
}); 