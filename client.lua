local secretCode = {}
local attempts = {}
local startTime = 0
local timerRunning = false

-- Game settings (adjustable via exports)
GameSettings = {
    timer = 60,          -- seconds
    maxAttempts = 10
}

-- Helper: check if table contains value
local function TableContains(tbl, val)
    for _, v in ipairs(tbl) do
        if v == val then return true end
    end
    return false
end

-- Generate secret code of 4 unique digits
local function GenerateSecretCode()
    local numbers, code = {}, {}
    for i = 0, 9 do table.insert(numbers, i) end
    for i = 1, 4 do
        local idx = math.random(1, #numbers)
        table.insert(code, numbers[idx])
        table.remove(numbers, idx)
    end
    return code
end

-- Check player attempt
local function CheckAttempt(attempt)
    local result = {}
    local correct = true

    for i = 1, 4 do
        if attempt[i] == secretCode[i] then
            table.insert(result, "green")
        elseif TableContains(secretCode, attempt[i]) then
            table.insert(result, "yellow")
            correct = false
        else
            table.insert(result, "red")
            correct = false
        end
    end

    return result, correct
end

-- End game function
local function EndGame(state)
    SendNUIMessage({
        type = "gameOver",
        state = state,
        code = secretCode
    })
    timerRunning = false

    -- Auto-close UI after 3 seconds
    CreateThread(function()
        Wait(3000)
        SendNUIMessage({ type = "showUI", state = false })
        SetNuiFocus(false, false)
    end)
end

-- Start MiniGame
function StartMiniGame()
    secretCode = GenerateSecretCode()
    attempts = {}
    startTime = GetGameTimer()
    timerRunning = true

    SetNuiFocus(true, true)

    SendNUIMessage({
        type = "showUI",
        state = true,
        timer = GameSettings.timer,
        attempts = 0,
        maxAttempts = GameSettings.maxAttempts
    })

    -- Timer thread
    CreateThread(function()
        local endTime = startTime + (GameSettings.timer * 1000)
        while timerRunning and GetGameTimer() < endTime do
            Wait(1000)
            local timeLeft = math.floor((endTime - GetGameTimer()) / 1000)
            SendNUIMessage({
                type = "updateStatus",
                timer = timeLeft,
                attempts = #attempts,
                maxAttempts = GameSettings.maxAttempts
            })
        end
        if timerRunning then
            EndGame("lose")
        end
    end)
end

-- Receive attempt from NUI
RegisterNUICallback("attempt", function(data, cb)
    local guess = data.guess
    local res, correct = CheckAttempt(guess)
    table.insert(attempts, { guess = guess, result = res })

    SendNUIMessage({
        type = "newAttempt",
        guess = guess,
        result = res
    })

    if correct then
        EndGame("win")
    elseif #attempts >= GameSettings.maxAttempts then
        EndGame("lose")
    end

    cb("ok")
end)

-- Exports to adjust settings or start game
exports("StartMiniGame", StartMiniGame)
exports("SetAttempts", function(num) GameSettings.maxAttempts = num end)
exports("SetTimer", function(seconds) GameSettings.timer = seconds end)

-- Test command
RegisterCommand("stg", function()
    StartMiniGame()
end)
