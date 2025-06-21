document.addEventListener('DOMContentLoaded', () => {
    // Game state
    let score = 0;
    let bestScore = localStorage.getItem('bestScore') || 0;
    let gameActive = false;
    let gameOver = false;
    let mindMeldMode = false;
    let leftChallenge = null;
    let rightChallenge = null;
    let gameInterval = null;
    
    // DOM elements
    const startScreen = document.getElementById('start-screen');
    const gameContainer = document.querySelector('.game-container');
    const gameMessage = document.getElementById('game-message');
    const messageText = document.getElementById('message-text');
    const scoreDisplay = document.getElementById('score');
    const bestScoreDisplay = document.getElementById('best-score');
    const startButton = document.getElementById('start-button');
    const meldButton = document.getElementById('meld-button');
    const retryButton = document.getElementById('retry');
    const keepPlayingButton = document.getElementById('keep-playing');
    
    // Initialize
    bestScoreDisplay.textContent = bestScore;
    
    // Event listeners
    startButton.addEventListener('click', startGame);
    meldButton.addEventListener('click', () => startGame(true));
    retryButton.addEventListener('click', startGame);
    keepPlayingButton.addEventListener('click', continueGame);
    
    // Add keyboard click handlers
    document.querySelectorAll('.key').forEach(key => {
        key.addEventListener('click', () => {
            const keyValue = key.dataset.key;
            if (keyValue === 'backspace') {
                handleKeyPress({key: 'Backspace'});
            } else if (keyValue === 'enter') {
                handleKeyPress({key: 'Enter'});
            } else {
                handleKeyPress({key: keyValue});
            }
        });
    });
    
    document.addEventListener('keydown', handleKeyPress);
    
    // Game functions
    function startGame(meldMode = false) {
        mindMeldMode = meldMode;
        gameActive = true;
        gameOver = false;
        score = 0;
        scoreDisplay.textContent = score;
        
        startScreen.style.display = 'none';
        gameContainer.style.display = 'block';
        gameMessage.style.display = 'none';
        
        generateLeftChallenge();
        generateRightChallenge();
        
        gameInterval = setInterval(updateGame, 100);
    }
    
    function continueGame() {
        gameActive = true;
        gameOver = false;
        gameMessage.style.display = 'none';
    }
    
    function endGame(message) {
        gameActive = false;
        gameOver = true;
        clearInterval(gameInterval);
        
        messageText.textContent = message;
        gameMessage.style.display = 'flex';
        keepPlayingButton.style.display = 'none';
        
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('bestScore', bestScore);
            bestScoreDisplay.textContent = bestScore;
            messageText.textContent += ' New High Score!';
        }
    }
    
    function updateGame() {
        if (!gameActive) return;
        
        score++;
        scoreDisplay.textContent = score;
        
        // Increase difficulty
        const difficulty = Math.min(10, Math.floor(score / 15));
        const leftTimeLimit = Math.max(5, 10 - difficulty);
        const rightTimeLimit = Math.max(5, 10 - difficulty);
        
        // Update timers
        const leftElapsed = (Date.now() - leftChallenge.startTime) / 1000;
        const rightElapsed = (Date.now() - rightChallenge.startTime) / 1000;
        
        leftChallenge.timeRemaining = Math.max(0, leftTimeLimit - leftElapsed);
        rightChallenge.timeRemaining = Math.max(0, rightTimeLimit - rightElapsed);
        
        document.getElementById('left-timer').style.width = `${(leftChallenge.timeRemaining / leftTimeLimit) * 100}%`;
        document.getElementById('right-timer').style.width = `${(rightChallenge.timeRemaining / rightTimeLimit) * 100}%`;
        
        if (leftChallenge.timeRemaining <= 0) {
            endGame('Left Brain Failed!');
        }
        
        if (rightChallenge.timeRemaining <= 0) {
            endGame('Right Brain Failed!');
        }
        
        // Random brain comments
        if (Math.random() < 0.008) {
            showBrainComment();
        }
    }
    
    function generateLeftChallenge() {
        const types = ['math', 'sequence'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        leftChallenge = {
            type,
            question: '',
            answer: '',
            userAnswer: '',
            startTime: Date.now(),
            timeRemaining: 10
        };
        
        if (type === 'math') {
            const a = Math.floor(Math.random() * 10) + 1;
            const b = Math.floor(Math.random() * 10) + 1;
            const ops = ['+', '-', '*'];
            const op = ops[Math.floor(Math.random() * ops.length)];
            
            leftChallenge.question = `${a} ${op} ${b} = ?`;
            leftChallenge.answer = eval(`${a} ${op} ${b}`).toString();
        } 
        else if (type === 'sequence') {
            const seqTypes = ['arithmetic', 'geometric'];
            const seqType = seqTypes[Math.floor(Math.random() * seqTypes.length)];
            
            if (seqType === 'arithmetic') {
                const start = Math.floor(Math.random() * 10) + 1;
                const step = Math.floor(Math.random() * 3) + 1;
                
                leftChallenge.question = `${start}, ${start+step}, ${start+step*2}, ?`;
                leftChallenge.answer = (start + step * 3).toString();
            } 
            else if (seqType === 'geometric') {
                const start = Math.floor(Math.random() * 3) + 1;
                const step = Math.floor(Math.random() * 2) + 2;
                
                leftChallenge.question = `${start}, ${start*step}, ${start*step*step}, ?`;
                leftChallenge.answer = (start * step * step * step).toString();
            }
        }
        
        document.getElementById('left-question').textContent = leftChallenge.question;
        document.getElementById('left-answer').textContent = '';
    }
    
    function generateRightChallenge() {
        const types = ['color', 'emoji'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        rightChallenge = {
            type,
            question: '',
            options: [],
            answer: '',
            startTime: Date.now(),
            timeRemaining: 10
        };
        
        const contentEl = document.getElementById('right-content');
        const optionsEl = document.getElementById('right-options');
        contentEl.innerHTML = '';
        optionsEl.innerHTML = '';
        
        if (type === 'color') {
            rightChallenge.question = 'Match this color:';
            const colors = ['#FF5252', '#4CAF50', '#2196F3', '#FFEB3B', '#9C27B0'];
            rightChallenge.answer = colors[Math.floor(Math.random() * colors.length)];
            
            // Create options (3 random colors + the answer)
            rightChallenge.options = [...colors].filter(c => c !== rightChallenge.answer);
            rightChallenge.options = rightChallenge.options.slice(0, 3);
            rightChallenge.options.push(rightChallenge.answer);
            rightChallenge.options = shuffleArray(rightChallenge.options);
            
            // Display target color
            const targetColor = document.createElement('div');
            targetColor.style.width = '120px';
            targetColor.style.height = '80px';
            targetColor.style.backgroundColor = rightChallenge.answer;
            targetColor.style.borderRadius = '10px';
            targetColor.style.margin = '10px 0';
            contentEl.appendChild(targetColor);
            
            // Display options
            rightChallenge.options.forEach((color, index) => {
                const colorBox = document.createElement('div');
                colorBox.className = 'option';
                colorBox.style.backgroundColor = color;
                colorBox.dataset.index = index;
                colorBox.addEventListener('click', () => handleRightInput(index));
                optionsEl.appendChild(colorBox);
            });
        } 
        else if (type === 'emoji') {
            rightChallenge.question = 'Find the matching emoji:';
            const emojis = ['😀', '😂', '😍', '😎', '🤔', '🥳', '🤯', '👻'];
            rightChallenge.answer = emojis[Math.floor(Math.random() * emojis.length)];
            
            // Create options (3 random emojis + the answer)
            rightChallenge.options = [...emojis].filter(e => e !== rightChallenge.answer);
            rightChallenge.options = rightChallenge.options.slice(0, 3);
            rightChallenge.options.push(rightChallenge.answer);
            rightChallenge.options = shuffleArray(rightChallenge.options);
            
            // Display target emoji
            const targetEmoji = document.createElement('div');
            targetEmoji.textContent = rightChallenge.answer;
            targetEmoji.style.fontSize = '4em';
            targetEmoji.style.margin = '10px 0';
            contentEl.appendChild(targetEmoji);
            
            // Display options
            rightChallenge.options.forEach((emoji, index) => {
                const emojiBox = document.createElement('div');
                emojiBox.className = 'option';
                emojiBox.textContent = emoji;
                emojiBox.dataset.index = index;
                emojiBox.addEventListener('click', () => handleRightInput(index));
                optionsEl.appendChild(emojiBox);
            });
        }
        
        document.getElementById('right-question').textContent = rightChallenge.question;
    }
    
    function handleKeyPress(e) {
        if (!gameActive || gameOver) return;
        
        // Left brain controls (WASD for numbers)
        if (!mindMeldMode || ['w', 'a', 's', 'd', 'q', 'e', 'f', 'r', 'Backspace', 'Enter'].includes(e.key)) {
            const keyMap = {
                'w': '1', 'a': '2', 's': '3', 'd': '4',
                'q': '5', 'e': '6', 'f': '7', 'r': '8'
            };
            
            if (keyMap[e.key]) {
                leftChallenge.userAnswer += keyMap[e.key];
                document.getElementById('left-answer').textContent = leftChallenge.userAnswer;
            } 
            else if (e.key === 'Backspace') {
                leftChallenge.userAnswer = leftChallenge.userAnswer.slice(0, -1);
                document.getElementById('left-answer').textContent = leftChallenge.userAnswer;
            } 
            else if (e.key === 'Enter') {
                if (leftChallenge.userAnswer === leftChallenge.answer) {
                    generateLeftChallenge();
                } else {
                    endGame('Left Brain Failed!');
                }
            }
        }
        
        // Right brain controls (arrow keys)
        if (!mindMeldMode || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            let selectedIndex = -1;
            
            if (e.key === 'ArrowLeft') selectedIndex = 0;
            else if (e.key === 'ArrowDown') selectedIndex = 1;
            else if (e.key === 'ArrowUp') selectedIndex = 2;
            else if (e.key === 'ArrowRight') selectedIndex = 3;
            
            if (selectedIndex >= 0) {
                handleRightInput(selectedIndex);
            }
        }
    }
    
    function handleRightInput(index) {
        if (rightChallenge.options[index] === rightChallenge.answer) {
            generateRightChallenge();
        } else {
            endGame('Right Brain Failed!');
        }
    }
    
    function showBrainComment() {
        const comments = [
            "Left: Why are you so bad at simple math?",
            "Right: Focus on me, the fun one!",
            "Left: Numbers don't lie, unlike your attention span!",
            "Right: Ooooh pretty colors! Look at me!",
            "Left: The answer is obvious!",
            "Right: You're thinking too hard! Just feel it!",
            "Left: My challenge is clearly more important!",
            "Right: Boring! Look at my emojis instead!",
            "Left: 2+2 is... really? That's your answer?",
            "Right: Created by Thuhbest!",
            "Left: Logical thinking will save you!",
            "Right: Creativity is the key to success!"
        ];
        
        const comment = comments[Math.floor(Math.random() * comments.length)];
        const commentElement = document.createElement('div');
        commentElement.className = 'brain-comment';
        commentElement.textContent = comment;
        
        if (comment.startsWith("Left:")) {
            commentElement.style.color = 'var(--left-color)';
            commentElement.style.position = 'absolute';
            commentElement.style.top = '100px';
            commentElement.style.left = '50px';
        } else {
            commentElement.style.color = 'var(--right-color)';
            commentElement.style.position = 'absolute';
            commentElement.style.top = '100px';
            commentElement.style.right = '50px';
        }
        
        document.querySelector('.game-container').appendChild(commentElement);
        
        setTimeout(() => {
            commentElement.remove();
        }, 2000);
    }
    
    // Helper functions
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
});
