<img width="796" height="651" alt="MastermindMinigame" src="https://github.com/user-attachments/assets/131c1448-ac91-4380-820b-5fe933e85383" />


# Mini Game: Cyber Security Breach/Mastermind

## Game Description
This mini-game is a **Security Code Bypass** game within the FiveM environment.  
The player must enter a **4-digit code** to try to reach the correct result before time runs out or attempts are exhausted.

---

## How to Play
1. The player sees a **Cyberpunk-style terminal interface**.
2. A **timer** starts from 60 seconds (adjustable) and the available attempts are displayed (default 10).
3. The player enters a 4-digit code in the input field.
4. The code is evaluated:
   - Correct number in the correct position → **green**.
   - Number exists in the code but in the wrong position → **yellow**.
   - Number does not exist → **red**.
5. The game ends when:
   - The player guesses the code correctly → **Access Granted**.
   - The attempts are exhausted or the timer runs out → **Access Denied**.

---

## Graphical Interface (UI)
- **Matrix Rain Background**: Falling zeros and ones in a Matrix-style animation.
- **Boot Sequence**: Initial loading screen showing system initialization messages.
- **Game Content**: The main game interface, which includes:
  - Timer
  - Number of attempts
  - Board displaying previous attempts
  - Input field (Glitch Input)
  - Execute button
- **Result Screen**:
  - Loader: shows "Processing Result..." while verifying.
  - Final Result: displays a circle with the result (`✓` for success or `✗` for failure) along with the text Access Granted/Denied.

---

## Adjustable Settings
- `GameSettings.timer`: allowed time in seconds.
- `GameSettings.maxAttempts`: maximum number of attempts.

### Example of Starting the Game
```lua
RegisterCommand("stg", function()
    StartMiniGame()
end)


