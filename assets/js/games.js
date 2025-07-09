// Oyunlar JavaScript Dosyası

// Modal kontrol fonksiyonları
function openGameModal(title, content) {
    const modal = document.getElementById('gameModal');
    const gameTitle = document.getElementById('gameTitle');
    const gameContent = document.getElementById('gameContent');
    
    gameTitle.textContent = title;
    gameContent.innerHTML = content;
    modal.style.display = 'block';
    
    // Modal dışına tıklandığında kapat
    modal.onclick = function(event) {
        if (event.target === modal) {
            closeGameModal();
        }
    }
}

function closeGameModal() {
    const modal = document.getElementById('gameModal');
    modal.style.display = 'none';
}

// Zar Oyunu
function playDiceGame() {
    const content = `
        <div class="dice-game">
            <h3>🎲 Zar Oyunu</h3>
            <p>Her ikiniz de zar atın, kim daha yüksek sayı çıkarırsa kazanır!</p>
            
            <div class="dice-players">
                <div class="player">
                    <h4>Mehmet</h4>
                    <div class="dice" id="dice1">🎲</div>
                    <button onclick="rollDice(1)" class="game-btn">Zar At</button>
                    <p id="result1">-</p>
                </div>
                
                <div class="player">
                    <h4>Sevgilim</h4>
                    <div class="dice" id="dice2">🎲</div>
                    <button onclick="rollDice(2)" class="game-btn">Zar At</button>
                    <p id="result2">-</p>
                </div>
            </div>
            
            <div class="game-result" id="diceResult"></div>
            <button onclick="resetDiceGame()" class="game-btn secondary">Yeniden Oyna</button>
        </div>
        
        <style>
            .dice-game { text-align: center; }
            .dice-players { display: flex; gap: 2rem; justify-content: center; margin: 2rem 0; }
            .player { text-align: center; }
            .dice { font-size: 4rem; margin: 1rem 0; }
            .game-btn { 
                background: linear-gradient(135deg, #667eea, #764ba2); 
                color: white; 
                border: none; 
                padding: 0.8rem 1.5rem; 
                border-radius: 8px; 
                cursor: pointer; 
                margin: 0.5rem;
                transition: all 0.3s ease;
            }
            .game-btn:hover { transform: translateY(-2px); }
            .game-btn.secondary { background: #6c757d; }
            .game-result { 
                font-size: 1.2rem; 
                font-weight: bold; 
                margin: 1rem 0; 
                padding: 1rem; 
                border-radius: 8px; 
                background: #f8f9fa;
            }
            @media (max-width: 480px) {
                .dice-players { flex-direction: column; gap: 1rem; }
                .dice { font-size: 3rem; }
            }
        </style>
    `;
    
    openGameModal('Zar Oyunu', content);
}

let diceResults = [0, 0];

function rollDice(player) {
    const result = Math.floor(Math.random() * 6) + 1;
    diceResults[player - 1] = result;
    
    const diceElement = document.getElementById(`dice${player}`);
    const resultElement = document.getElementById(`result${player}`);
    
    // Animasyon efekti
    diceElement.style.transform = 'rotateY(360deg)';
    setTimeout(() => {
        diceElement.style.transform = 'rotateY(0deg)';
        diceElement.textContent = getDiceEmoji(result);
        resultElement.textContent = result;
        
        // Her iki oyuncu da attıysa sonucu göster
        if (diceResults[0] > 0 && diceResults[1] > 0) {
            showDiceResult();
        }
    }, 500);
}

function getDiceEmoji(number) {
    const emojis = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return emojis[number];
}

function showDiceResult() {
    const resultDiv = document.getElementById('diceResult');
    if (diceResults[0] > diceResults[1]) {
        resultDiv.innerHTML = '🎉 Mehmet Kazandı!';
        resultDiv.style.color = '#28a745';
    } else if (diceResults[1] > diceResults[0]) {
        resultDiv.innerHTML = '🎉 Sevgilim Kazandı!';
        resultDiv.style.color = '#28a745';
    } else {
        resultDiv.innerHTML = '🤝 Berabere!';
        resultDiv.style.color = '#ffc107';
    }
}

function resetDiceGame() {
    diceResults = [0, 0];
    document.getElementById('dice1').textContent = '🎲';
    document.getElementById('dice2').textContent = '🎲';
    document.getElementById('result1').textContent = '-';
    document.getElementById('result2').textContent = '-';
    document.getElementById('diceResult').innerHTML = '';
}

// Soru-Cevap Oyunu
function playQuizGame() {
    const questions = [
        {
            question: "İlk buluşmamız neredeydi?",
            options: ["Cafe", "Park", "Sinema", "Alışveriş Merkezi"],
            correct: 0
        },
        {
            question: "En sevdiğim renk nedir?",
            options: ["Mavi", "Kırmızı", "Yeşil", "Mor"],
            correct: 0
        },
        {
            question: "Hangi müzik türünü severim?",
            options: ["Pop", "Rock", "Klasik", "Jazz"],
            correct: 0
        },
        {
            question: "En sevdiğim mevsim hangisi?",
            options: ["İlkbahar", "Yaz", "Sonbahar", "Kış"],
            correct: 1
        }
    ];
    
    let currentQuestion = 0;
    let score = 0;
    
    const content = `
        <div class="quiz-game">
            <h3>❓ Soru-Cevap Oyunu</h3>
            <p>Birbirinizi ne kadar tanıyorsunuz? Test edin!</p>
            
            <div class="question-container">
                <div class="question-number">Soru <span id="questionNum">1</span> / ${questions.length}</div>
                <div class="question-text" id="questionText"></div>
                <div class="options" id="options"></div>
                <div class="quiz-result" id="quizResult"></div>
                <button onclick="nextQuestion()" class="game-btn" id="nextBtn" style="display: none;">Sonraki Soru</button>
            </div>
            
            <div class="score-container">
                <div class="score">Puan: <span id="score">0</span></div>
            </div>
        </div>
        
        <style>
            .quiz-game { text-align: center; }
            .question-container { margin: 2rem 0; }
            .question-number { font-size: 0.9rem; color: #666; margin-bottom: 1rem; }
            .question-text { font-size: 1.2rem; font-weight: bold; margin-bottom: 1.5rem; }
            .options { display: grid; gap: 0.5rem; margin-bottom: 1rem; }
            .option { 
                padding: 0.8rem; 
                border: 2px solid #e9ecef; 
                border-radius: 8px; 
                cursor: pointer; 
                transition: all 0.3s ease;
                background: white;
            }
            .option:hover { border-color: #667eea; background: #f8f9fa; }
            .option.correct { border-color: #28a745; background: #d4edda; }
            .option.wrong { border-color: #dc3545; background: #f8d7da; }
            .score-container { margin-top: 2rem; }
            .score { font-size: 1.1rem; font-weight: bold; }
        </style>
    `;
    
    openGameModal('Soru-Cevap Oyunu', content);
    
    // İlk soruyu göster
    showQuestion();
    
    function showQuestion() {
        const question = questions[currentQuestion];
        document.getElementById('questionNum').textContent = currentQuestion + 1;
        document.getElementById('questionText').textContent = question.question;
        
        const optionsDiv = document.getElementById('options');
        optionsDiv.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.textContent = option;
            optionDiv.onclick = () => selectAnswer(index);
            optionsDiv.appendChild(optionDiv);
        });
        
        document.getElementById('quizResult').innerHTML = '';
        document.getElementById('nextBtn').style.display = 'none';
    }
    
    window.selectAnswer = function(selectedIndex) {
        const question = questions[currentQuestion];
        const options = document.querySelectorAll('.option');
        
        options.forEach((option, index) => {
            option.onclick = null; // Disable further clicks
            if (index === question.correct) {
                option.classList.add('correct');
            } else if (index === selectedIndex) {
                option.classList.add('wrong');
            }
        });
        
        if (selectedIndex === question.correct) {
            score++;
            document.getElementById('quizResult').innerHTML = '✅ Doğru!';
            document.getElementById('quizResult').style.color = '#28a745';
        } else {
            document.getElementById('quizResult').innerHTML = '❌ Yanlış!';
            document.getElementById('quizResult').style.color = '#dc3545';
        }
        
        document.getElementById('score').textContent = score;
        
        if (currentQuestion < questions.length - 1) {
            document.getElementById('nextBtn').style.display = 'inline-block';
        } else {
            setTimeout(() => {
                showFinalScore();
            }, 2000);
        }
    }
    
    window.nextQuestion = function() {
        currentQuestion++;
        showQuestion();
    }
    
    function showFinalScore() {
        const percentage = (score / questions.length) * 100;
        let message = '';
        
        if (percentage >= 80) {
            message = '🎉 Mükemmel! Birbirinizi çok iyi tanıyorsunuz!';
        } else if (percentage >= 60) {
            message = '👍 İyi! Birbirinizi oldukça iyi tanıyorsunuz.';
        } else {
            message = '💕 Birbirinizi daha iyi tanımanız gerekiyor!';
        }
        
        document.getElementById('questionText').innerHTML = `
            <h3>Oyun Bitti!</h3>
            <p>Final Puanınız: ${score}/${questions.length} (${percentage.toFixed(0)}%)</p>
            <p>${message}</p>
        `;
        
        document.getElementById('options').innerHTML = '';
        document.getElementById('quizResult').innerHTML = '';
        document.getElementById('nextBtn').style.display = 'none';
    }
}

// Hafıza Oyunu
function playMemoryGame() {
    const cards = ['❤️', '💕', '💖', '💗', '💘', '💝', '💞', '💟'];
    let gameCards = [...cards, ...cards].sort(() => Math.random() - 0.5);
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    
    const content = `
        <div class="memory-game">
            <h3>🧠 Hafıza Oyunu</h3>
            <p>Aynı kartları eşleştirin!</p>
            
            <div class="game-stats">
                <div>Hamle: <span id="moves">0</span></div>
                <div>Eşleşen: <span id="matched">0</span>/${cards.length}</div>
            </div>
            
            <div class="memory-board" id="memoryBoard"></div>
            
            <div class="game-result" id="memoryResult"></div>
            <button onclick="resetMemoryGame()" class="game-btn secondary">Yeniden Oyna</button>
        </div>
        
        <style>
            .memory-game { text-align: center; }
            .game-stats { 
                display: flex; 
                justify-content: space-around; 
                margin: 1rem 0; 
                font-weight: bold;
            }
            .memory-board { 
                display: grid; 
                grid-template-columns: repeat(4, 1fr); 
                gap: 0.5rem; 
                max-width: 300px; 
                margin: 2rem auto;
            }
            .memory-card { 
                aspect-ratio: 1; 
                background: #f8f9fa; 
                border: 2px solid #e9ecef; 
                border-radius: 8px; 
                cursor: pointer; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                font-size: 1.5rem; 
                transition: all 0.3s ease;
            }
            .memory-card:hover { transform: scale(1.05); }
            .memory-card.flipped { background: white; border-color: #667eea; }
            .memory-card.matched { background: #d4edda; border-color: #28a745; }
            @media (max-width: 480px) {
                .memory-board { max-width: 250px; }
                .memory-card { font-size: 1.2rem; }
            }
        </style>
    `;
    
    openGameModal('Hafıza Oyunu', content);
    
    // Kartları oluştur
    const board = document.getElementById('memoryBoard');
    gameCards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'memory-card';
        cardElement.dataset.card = card;
        cardElement.dataset.index = index;
        cardElement.onclick = () => flipCard(cardElement);
        board.appendChild(cardElement);
    });
    
    function flipCard(cardElement) {
        if (flippedCards.length >= 2 || cardElement.classList.contains('flipped') || cardElement.classList.contains('matched')) {
            return;
        }
        
        cardElement.classList.add('flipped');
        cardElement.textContent = cardElement.dataset.card;
        flippedCards.push(cardElement);
        
        if (flippedCards.length === 2) {
            moves++;
            document.getElementById('moves').textContent = moves;
            
            setTimeout(() => {
                checkMatch();
            }, 1000);
        }
    }
    
    function checkMatch() {
        const [card1, card2] = flippedCards;
        
        if (card1.dataset.card === card2.dataset.card) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            document.getElementById('matched').textContent = matchedPairs;
            
            if (matchedPairs === cards.length) {
                setTimeout(() => {
                    document.getElementById('memoryResult').innerHTML = `
                        🎉 Tebrikler! ${moves} hamlede tamamladınız!
                    `;
                    document.getElementById('memoryResult').style.color = '#28a745';
                }, 500);
            }
        } else {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.textContent = '';
            card2.textContent = '';
        }
        
        flippedCards = [];
    }
    
    window.resetMemoryGame = function() {
        closeGameModal();
        setTimeout(() => playMemoryGame(), 300);
    }
}

// Aşk Testi
function playLoveTest() {
    const questions = [
        "Birlikte geçirdiğiniz en güzel an neydi?",
        "Partnerinizde en çok sevdiğiniz özellik nedir?",
        "Gelecekte birlikte yapmak istediğiniz şey nedir?",
        "Partnerinizi mutlu eden şey nedir?",
        "Aşkınızı bir kelimeyle nasıl tanımlarsınız?"
    ];
    
    let currentQuestion = 0;
    let answers = [];
    
    const content = `
        <div class="love-test">
            <h3>💕 Aşk Testi</h3>
            <p>Aşkınızı test edin! Sorulara içtenlikle cevap verin.</p>
            
            <div class="question-container">
                <div class="question-number">Soru <span id="loveQuestionNum">1</span> / ${questions.length}</div>
                <div class="question-text" id="loveQuestionText"></div>
                <textarea id="loveAnswer" placeholder="Cevabınızı buraya yazın..." rows="4"></textarea>
                <button onclick="submitLoveAnswer()" class="game-btn">Cevabı Gönder</button>
            </div>
            
            <div class="love-result" id="loveResult"></div>
        </div>
        
        <style>
            .love-test { text-align: center; }
            .question-container { margin: 2rem 0; }
            .question-number { font-size: 0.9rem; color: #666; margin-bottom: 1rem; }
            .question-text { font-size: 1.2rem; font-weight: bold; margin-bottom: 1.5rem; }
            #loveAnswer { 
                width: 100%; 
                padding: 1rem; 
                border: 2px solid #e9ecef; 
                border-radius: 8px; 
                font-family: inherit; 
                font-size: 1rem; 
                margin-bottom: 1rem;
                resize: vertical;
            }
            #loveAnswer:focus { 
                outline: none; 
                border-color: #667eea; 
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            .love-result { 
                margin-top: 2rem; 
                padding: 1rem; 
                background: #f8f9fa; 
                border-radius: 8px;
            }
        </style>
    `;
    
    openGameModal('Aşk Testi', content);
    
    showLoveQuestion();
    
    function showLoveQuestion() {
        document.getElementById('loveQuestionNum').textContent = currentQuestion + 1;
        document.getElementById('loveQuestionText').textContent = questions[currentQuestion];
        document.getElementById('loveAnswer').value = '';
        document.getElementById('loveResult').innerHTML = '';
    }
    
    window.submitLoveAnswer = function() {
        const answer = document.getElementById('loveAnswer').value.trim();
        
        if (!answer) {
            alert('Lütfen bir cevap yazın!');
            return;
        }
        
        answers.push(answer);
        currentQuestion++;
        
        if (currentQuestion < questions.length) {
            showLoveQuestion();
        } else {
            showLoveResult();
        }
    }
    
    function showLoveResult() {
        const loveScore = Math.floor(Math.random() * 20) + 80; // 80-100 arası
        
        document.getElementById('loveQuestionText').innerHTML = `
            <h3>💕 Aşk Testi Sonucu</h3>
            <div style="font-size: 3rem; margin: 1rem 0;">❤️</div>
            <p>Aşk Puanınız: <strong>${loveScore}%</strong></p>
        `;
        
        let message = '';
        if (loveScore >= 95) {
            message = '🌟 Mükemmel bir aşkınız var! Birbiriniz için yaratılmışsınız!';
        } else if (loveScore >= 90) {
            message = '💖 Harika bir ilişkiniz var! Aşkınız çok güçlü!';
        } else {
            message = '💕 Güzel bir aşkınız var! Birbirinizi çok seviyorsunuz!';
        }
        
        document.getElementById('loveResult').innerHTML = `
            <p style="font-size: 1.1rem; margin-top: 1rem;">${message}</p>
            <p style="margin-top: 1rem; font-style: italic; color: #666;">
                "Aşk, iki kişinin birbirine bakması değil, birlikte aynı yöne bakmasıdır."
            </p>
        `;
        
        document.getElementById('loveAnswer').style.display = 'none';
        document.querySelector('.game-btn').style.display = 'none';
    }
}

// Taş-Kağıt-Makas Oyunu
function playRockPaperScissors() {
    let playerScore = 0;
    let computerScore = 0;
    const choices = ['🗿', '📄', '✂️'];
    const choiceNames = ['Taş', 'Kağıt', 'Makas'];
    
    const content = `
        <div class="rps-game">
            <h3>✂️ Taş-Kağıt-Makas</h3>
            <p>Klasik oyunu oynayın!</p>
            
            <div class="score-board">
                <div class="score-item">
                    <div>Sen</div>
                    <div class="score" id="playerScore">0</div>
                </div>
                <div class="score-item">
                    <div>Bilgisayar</div>
                    <div class="score" id="computerScore">0</div>
                </div>
            </div>
            
            <div class="game-area">
                <div class="choice-display">
                    <div class="player-choice">
                        <div>Senin Seçimin</div>
                        <div class="choice-icon" id="playerChoice">❓</div>
                    </div>
                    <div class="vs">VS</div>
                    <div class="computer-choice">
                        <div>Bilgisayar</div>
                        <div class="choice-icon" id="computerChoice">❓</div>
                    </div>
                </div>
                
                <div class="choices">
                    <button onclick="makeChoice(0)" class="choice-btn">🗿<br>Taş</button>
                    <button onclick="makeChoice(1)" class="choice-btn">📄<br>Kağıt</button>
                    <button onclick="makeChoice(2)" class="choice-btn">✂️<br>Makas</button>
                </div>
            </div>
            
            <div class="game-result" id="rpsResult"></div>
            <button onclick="resetRPSGame()" class="game-btn secondary">Sıfırla</button>
        </div>
        
        <style>
            .rps-game { text-align: center; }
            .score-board { 
                display: flex; 
                justify-content: space-around; 
                margin: 1rem 0; 
                background: #f8f9fa; 
                padding: 1rem; 
                border-radius: 8px;
            }
            .score-item { font-weight: bold; }
            .score { font-size: 2rem; color: #667eea; }
            .choice-display { 
                display: flex; 
                justify-content: space-around; 
                align-items: center; 
                margin: 2rem 0;
            }
            .choice-icon { font-size: 4rem; margin: 0.5rem 0; }
            .vs { font-size: 1.5rem; font-weight: bold; color: #667eea; }
            .choices { display: flex; gap: 1rem; justify-content: center; margin: 2rem 0; }
            .choice-btn { 
                background: white; 
                border: 2px solid #e9ecef; 
                border-radius: 8px; 
                padding: 1rem; 
                cursor: pointer; 
                font-size: 1.5rem; 
                transition: all 0.3s ease;
            }
            .choice-btn:hover { 
                border-color: #667eea; 
                background: #f8f9fa; 
                transform: translateY(-2px);
            }
            @media (max-width: 480px) {
                .choice-display { flex-direction: column; gap: 1rem; }
                .choices { flex-direction: column; align-items: center; }
                .choice-icon { font-size: 3rem; }
            }
        </style>
    `;
    
    openGameModal('Taş-Kağıt-Makas', content);
    
    window.makeChoice = function(playerChoice) {
        const computerChoice = Math.floor(Math.random() * 3);
        
        document.getElementById('playerChoice').textContent = choices[playerChoice];
        document.getElementById('computerChoice').textContent = choices[computerChoice];
        
        let result = '';
        if (playerChoice === computerChoice) {
            result = '🤝 Berabere!';
        } else if (
            (playerChoice === 0 && computerChoice === 2) ||
            (playerChoice === 1 && computerChoice === 0) ||
            (playerChoice === 2 && computerChoice === 1)
        ) {
            result = '🎉 Kazandın!';
            playerScore++;
            document.getElementById('playerScore').textContent = playerScore;
        } else {
            result = '😔 Kaybettin!';
            computerScore++;
            document.getElementById('computerScore').textContent = computerScore;
        }
        
        document.getElementById('rpsResult').innerHTML = `
            <p style="font-size: 1.2rem; font-weight: bold; margin: 1rem 0;">${result}</p>
            <p>Sen: ${choiceNames[playerChoice]} - Bilgisayar: ${choiceNames[computerChoice]}</p>
        `;
    }
    
    window.resetRPSGame = function() {
        playerScore = 0;
        computerScore = 0;
        document.getElementById('playerScore').textContent = '0';
        document.getElementById('computerScore').textContent = '0';
        document.getElementById('playerChoice').textContent = '❓';
        document.getElementById('computerChoice').textContent = '❓';
        document.getElementById('rpsResult').innerHTML = '';
    }
}

// Doğruluk-Cesaret Oyunu
function playTruthOrDare() {
    const truths = [
        "En büyük korkunuz nedir?",
        "Hayatınızda en çok pişman olduğunuz şey nedir?",
        "Gizli bir yeteneğiniz var mı?",
        "Çocukluğunuzdan en güzel anınız nedir?",
        "Kimseye söylemediğiniz bir sırrınız var mı?",
        "Hayalinizdeki tatil nerede olurdu?",
        "En sevdiğiniz çocukluk oyunu neydi?",
        "Hangi ünlü ile tanışmak isterdiniz?",
        "Geçmişe dönebilseydiniz neyi değiştirirdiniz?",
        "En büyük hayaliniz nedir?"
    ];
    
    const dares = [
        "En sevdiğiniz şarkıyı söyleyin!",
        "Komik bir dans yapın!",
        "En sevdiğiniz hayvanı taklit edin!",
        "Gözlerinizi kapatıp 30 saniye bekleyin!",
        "En komik yüz ifadenizi yapın!",
        "Favori şiirinizden bir kıta okuyun!",
        "10 saniye boyunca tek ayak üzerinde durun!",
        "En sevdiğiniz çizgi film karakterini taklit edin!",
        "Alfabeyi tersten söyleyin!",
        "En sevdiğiniz yemeğin tarifini anlatın!"
    ];
    
    const content = `
        <div class="truth-dare-game">
            <h3>🎭 Doğruluk mu Cesaret mi?</h3>
            <p>Eğlenceli sorular ve görevler!</p>
            
            <div class="game-buttons">
                <button onclick="getTruth()" class="game-btn truth-btn">
                    🤔 Doğruluk
                </button>
                <button onclick="getDare()" class="game-btn dare-btn">
                    😈 Cesaret
                </button>
            </div>
            
            <div class="question-result" id="truthDareResult"></div>
            <button onclick="newTruthDare()" class="game-btn secondary" id="newBtn" style="display: none;">
                Yeni Soru/Görev
            </button>
        </div>
        
        <style>
            .truth-dare-game { text-align: center; }
            .game-buttons { 
                display: flex; 
                gap: 1rem; 
                justify-content: center; 
                margin: 2rem 0;
            }
            .truth-btn { background: linear-gradient(135deg, #28a745, #20c997); }
            .dare-btn { background: linear-gradient(135deg, #dc3545, #fd7e14); }
            .question-result { 
                margin: 2rem 0; 
                padding: 1.5rem; 
                background: #f8f9fa; 
                border-radius: 12px; 
                font-size: 1.1rem; 
                min-height: 100px; 
                display: flex; 
                align-items: center; 
                justify-content: center;
            }
            @media (max-width: 480px) {
                .game-buttons { flex-direction: column; align-items: center; }
            }
        </style>
    `;
    
    openGameModal('Doğruluk-Cesaret', content);
    
    window.getTruth = function() {
        const randomTruth = truths[Math.floor(Math.random() * truths.length)];
        document.getElementById('truthDareResult').innerHTML = `
            <div>
                <h4 style="color: #28a745; margin-bottom: 1rem;">🤔 DOĞRULUK</h4>
                <p>${randomTruth}</p>
            </div>
        `;
        document.getElementById('newBtn').style.display = 'inline-block';
    }
    
    window.getDare = function() {
        const randomDare = dares[Math.floor(Math.random() * dares.length)];
        document.getElementById('truthDareResult').innerHTML = `
            <div>
                <h4 style="color: #dc3545; margin-bottom: 1rem;">😈 CESARET</h4>
                <p>${randomDare}</p>
            </div>
        `;
        document.getElementById('newBtn').style.display = 'inline-block';
    }
    
    window.newTruthDare = function() {
        document.getElementById('truthDareResult').innerHTML = '';
        document.getElementById('newBtn').style.display = 'none';
    }
}

// Escape tuşu ile modal kapatma
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeGameModal();
    }
}); 