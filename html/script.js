// DOM elements
const gameUI = document.getElementById("gameUI");
const timerEl = document.getElementById("timer");
const attemptsEl = document.getElementById("attempts");
const boardEl = document.getElementById("board");
const input = document.getElementById("guessInput");
const submitBtn = document.getElementById("submitBtn");
const body = document.body;
const bootSequence = document.getElementById("bootSequence");
const gameContent = document.getElementById("gameContent");
const matrixRain = document.getElementById("matrixRain");
const resultScreen = document.getElementById("resultScreen");
const resultLoader = document.querySelector(".result-loader");
const resultFinal = document.querySelector(".result-final");
const resultCircle = document.querySelector(".result-circle");
const resultIcon = document.querySelector(".result-icon");
const resultText = document.querySelector(".result-text");

// Create waterfall matrix effect
function createWaterfallMatrix() {
    matrixRain.innerHTML = ''; // Clear previous matrix rain
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes waterfall {
            0% {
                transform: translateY(-100%);
                opacity: 0;
            }
            5% {
                opacity: 1;
            }
            95% {
                opacity: 1;
            }
            100% {
                transform: translateY(100vh);
                opacity: 0;
            }
        }
        
        .waterfall-column {
            position: absolute;
            top: 0;
            width: 14px;
            height: 100%;
            overflow: hidden;
        }
        
        .waterfall-stream {
            position: absolute;
            width: 100%;
            animation: waterfall 3s linear infinite;
            white-space: nowrap;
        }
        
        .matrix-char {
            display: block;
            color: #00ff41;
            font-size: 14px;
            line-height: 1.2;
            font-family: 'Share Tech Mono', monospace;
        }
        
        .fast { animation-duration: 2s !important; }
        .medium { animation-duration: 4s !important; }
        .slow { animation-duration: 6s !important; }
    `;
    document.head.appendChild(style);
    
    const characters = "010101010011010101010010101010100101010101001010101";
    const columns = Math.floor(window.innerWidth / 14);
    
    for (let i = 0; i < columns; i++) {
        const column = document.createElement("div");
        column.className = "waterfall-column";
        column.style.left = (i * 14) + "px";
        
        // Create multiple streams in each column for waterfall effect
        const streamCount = 3 + Math.floor(Math.random() * 3);
        
        for (let j = 0; j < streamCount; j++) {
            const stream = document.createElement("div");
            stream.className = "waterfall-stream";
            
            // Random speed for each stream
            const speeds = ["fast", "medium", "slow"];
            stream.classList.add(speeds[Math.floor(Math.random() * speeds.length)]);
            
            // Random delay for each stream
            stream.style.animationDelay = `${Math.random() * 3}s`;
            
            // Create characters for this stream
            const charCount = 30; // Number of characters per stream
            for (let k = 0; k < charCount; k++) {
                const char = document.createElement("span");
                char.className = "matrix-char";
                char.textContent = characters.charAt(Math.floor(Math.random() * characters.length));
                char.style.opacity = (0.3 + Math.random() * 0.7).toString();
                stream.appendChild(char);
            }
            
            column.appendChild(stream);
        }
        
        matrixRain.appendChild(column);
    }
}

// Show result with loader animation
function showResultWithLoader(isWin) {
    console.log("Showing result with loader:", isWin);
    
    // Hide game content and show result screen
    gameContent.classList.add("hidden");
    resultScreen.classList.remove("hidden");
    resultLoader.classList.remove("hidden");
    resultFinal.classList.add("hidden");
    
    // After 2 seconds, show final result
    setTimeout(() => {
        resultLoader.classList.add("hidden");
        resultFinal.classList.remove("hidden");
        
        if (isWin) {
            resultCircle.className = "result-circle success";
            resultIcon.className = "result-icon success";
            resultIcon.textContent = "✓";
            resultText.className = "result-text success";
            resultText.textContent = "ACCESS GRANTED";
        } else {
            resultCircle.className = "result-circle failure";
            resultIcon.className = "result-icon failure";
            resultIcon.textContent = "✗";
            resultText.className = "result-text failure";
            resultText.textContent = "ACCESS DENIED";
        }
        
        // Show result with animation
        setTimeout(() => {
            resultFinal.classList.add("show");
        }, 100);
        
        // Auto-close after 3 seconds
        setTimeout(() => {
            gameUI.classList.add("closing");
            setTimeout(() => {
                gameUI.classList.add("hidden");
                body.classList.add("hidden");
                
                // Reset UI for next game
                resetUI();
            }, 500);
        }, 3000);
    }, 2000);
}

// Reset UI for next game
function resetUI() {
    gameContent.classList.remove("hidden");
    resultScreen.classList.add("hidden");
    resultLoader.classList.add("hidden");
    resultFinal.classList.remove("show");
    boardEl.innerHTML = '';
    input.value = '';
    input.disabled = false;
    submitBtn.disabled = false;
}

// Clear previous attempts
function clearPreviousAttempts() {
    boardEl.innerHTML = ''; // Clear the board
}

// Submit button event listener
submitBtn.addEventListener("click", () => {
    const val = input.value;
    if (val.length !== 4 || !/^\d+$/.test(val)) {
        // Add glitch effect for invalid input
        input.classList.add('invalid');
        setTimeout(() => input.classList.remove('invalid'), 1000);
        return;
    }
    
    const nums = val.split("").map(Number);
    
    fetch(`https://${GetParentResourceName()}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess: nums })
    });
    
    input.value = "";
});

// Input validation
input.addEventListener("input", function() {
    this.value = this.value.replace(/[^0-9]/g, '');
    if (this.value.length > 4) {
        this.value = this.value.slice(0, 4);
    }
});

// Enter key support
input.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        submitBtn.click();
    }
});

// Listen for messages from FiveM
window.addEventListener("message", (event) => {
    const data = event.data;
    console.log("Received message:", data);

    if (data.type === "showUI") {
        console.log("Showing UI");
        // Show UI and body
        body.classList.remove("hidden");
        gameUI.classList.remove("hidden");
        gameUI.classList.remove("closing");
        
        // Clear previous attempts
        clearPreviousAttempts();
        
        // Enable input and button
        input.disabled = false;
        submitBtn.disabled = false;
        
        // Create waterfall matrix effect
        createWaterfallMatrix();
        
        // Start boot sequence
        bootSequence.classList.remove("hidden");
        gameContent.classList.add("hidden");
        resultScreen.classList.add("hidden");
        
        // After boot sequence, show game content
        setTimeout(() => {
            bootSequence.classList.add("hidden");
            gameContent.classList.remove("hidden");
            input.focus();
        }, 7000);
        
    } else if (data.type === "updateStatus") {
        timerEl.innerHTML = `${data.timer}s`;
        attemptsEl.innerHTML = `${data.attempts}/${data.maxAttempts}`;
        
        // Change color when time is running out
        if (data.timer <= 10) {
            timerEl.style.color = "#ff3333";
            timerEl.style.textShadow = "0 0 5px #ff3333";
        } else {
            timerEl.style.color = "#ffffff";
            timerEl.style.textShadow = "0 0 5px #ffffff";
        }
    } else if (data.type === "newAttempt") {
        const row = document.createElement("div");
        data.guess.forEach((num, i) => {
            const span = document.createElement("span");
            span.className = data.result[i];
            span.textContent = num;
            row.appendChild(span);
        });
        boardEl.appendChild(row);
        boardEl.scrollTop = boardEl.scrollHeight;
    } else if (data.type === "gameOver") {
        // Show result with loader animation
        showResultWithLoader(data.state === "win");
    } else if (data.type === "hideUI") {
        // Immediate hide without animation
        gameUI.classList.add("hidden");
        body.classList.add("hidden");
    }
});

// Handle escape key to close UI
document.addEventListener("keyup", (e) => {
    if (e.key === "Escape") {
        fetch(`https://${GetParentResourceName()}/escape`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({})
        });
    }
});

// Handle resource stop to clear UI
window.addEventListener('beforeunload', function() {
    // Clear UI when resource is stopped
    gameUI.classList.add("hidden");
    body.classList.add("hidden");
});

// Initialize UI state on load
document.addEventListener('DOMContentLoaded', function() {
    // Make sure everything is hidden initially
    body.classList.add("hidden");
    gameUI.classList.add("hidden");
    bootSequence.classList.add("hidden");
    gameContent.classList.add("hidden");
    resultScreen.classList.add("hidden");
    resultLoader.classList.add("hidden");
    resultFinal.classList.add("hidden");
    
    console.log("UI initialized and hidden");
});