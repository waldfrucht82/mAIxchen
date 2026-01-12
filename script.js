class Game {
    constructor() {
        this.currentRoll = { d1: 1, d2: 1, value: 0 };
        this.lastClaim = 0;
        this.turnState = 'START';

        // Game Settings
        this.players = []; // Array of {name, lives}
        this.currentPlayerIdx = 0;
        this.mode = 'classic'; // 'classic' or 'kids'

        // DOM Elements
        this.app = document.getElementById('app');
        this.setupScreen = document.getElementById('setup-screen');
        this.turnIndicator = document.getElementById('turn-indicator');
        this.scoreboard = document.getElementById('scoreboard');
        this.matchInfo = document.getElementById('match-info');

        this.cup = document.getElementById('cup');
        this.diceContainer = document.getElementById('dice-container');
        this.die1 = document.getElementById('die1');
        this.die2 = document.getElementById('die2');
        this.msgDisplay = document.getElementById('message-display');
        this.currentClaimDisplay = document.getElementById('current-claim');

        // Buttons
        this.btnRoll = document.getElementById('btn-roll');
        this.btnPeek = document.getElementById('btn-peek');
        this.btnReveal = document.getElementById('btn-reveal');
        this.actionButtons = document.getElementById('action-buttons');
        this.claimControls = document.getElementById('claim-controls');
        this.btnSubmitClaim = document.getElementById('btn-submit-claim');
        this.numpadBtns = document.querySelectorAll('.btn-numpad');

        // Setup UI
        this.modeBtns = document.querySelectorAll('.btn-mode');
        this.playerInputList = document.getElementById('player-input-list');
        this.playerSetupGroup = document.getElementById('player-setup-group');
        this.btnAddPlayer = document.getElementById('btn-add-player');
        this.btnStartGame = document.getElementById('btn-start-game');

        // Help UI
        this.btnHelp = document.getElementById('btn-help');
        this.helpModal = document.getElementById('help-modal');
        this.btnCloseHelp = document.getElementById('btn-close-help');
        this.btnHelpOk = document.getElementById('btn-help-ok');

        this.inputBuffer = '';

        this.init();
    }

    init() {
        // Setup Screen Events
        this.modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.mode = btn.dataset.mode;

                // Toggle Player Inputs
                if (this.mode === 'classic') {
                    this.playerSetupGroup.classList.add('hidden');
                } else {
                    this.playerSetupGroup.classList.remove('hidden');
                }
            });
        });

        // Init state: Hide inputs if default is classic (which it is)
        if (this.mode === 'classic') {
            this.playerSetupGroup.classList.add('hidden');
        }

        this.btnAddPlayer.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Spieler ${this.playerInputList.children.length + 1}`;
            input.className = 'inp-name';
            this.playerInputList.appendChild(input);
        });

        this.btnStartGame.addEventListener('click', () => this.startGame());

        // Game Events
        this.btnRoll.addEventListener('click', () => {
            if (this.turnState === 'GAME_OVER') {
                this.resetFullGame();
            } else if (this.turnState === 'ROUND_END') {
                this.nextRound();
            } else if (this.turnState === 'START') {
                this.roll();
            } else if (this.turnState === 'DECIDING') {
                this.roll();
            } else {
                this.roll();
            }
        });

        // Peek events
        const startPeek = (e) => { e.preventDefault(); this.peek(true); };
        const endPeek = (e) => { e.preventDefault(); this.peek(false); };

        this.btnPeek.addEventListener('pointerdown', startPeek);
        this.btnPeek.addEventListener('pointerup', endPeek);
        this.btnPeek.addEventListener('pointerleave', endPeek);

        this.btnReveal.addEventListener('click', () => this.reveal());
        this.btnSubmitClaim.addEventListener('click', () => this.submitClaim());

        this.numpadBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleNumpad(e.target.dataset.val));
        });

        // Help Events
        this.btnHelp.addEventListener('click', () => this.toggleHelp(true));
        this.btnCloseHelp.addEventListener('click', () => this.toggleHelp(false));
        this.btnHelpOk.addEventListener('click', () => this.toggleHelp(false));
    }

    toggleHelp(show) {
        if (show) {
            this.helpModal.classList.remove('hidden');
        } else {
            this.helpModal.classList.add('hidden');
        }
    }

    startGame() {
        if (this.mode === 'kids') {
            const inputs = document.querySelectorAll('.inp-name');
            this.players = [];
            inputs.forEach(inp => {
                if (inp.value.trim()) {
                    this.players.push({
                        name: inp.value.trim(),
                        lives: 5,
                        active: true
                    });
                }
            });

            if (this.players.length < 1) {
                alert("Mindestens 1 Spieler!");
                return;
            }
        } else {
            // Classic: Dummy Player
            this.players = [{ name: "Spieler", lives: 0 }];
        }

        this.currentPlayerIdx = 0;
        this.setupScreen.classList.add('hidden');
        this.matchInfo.classList.remove('hidden');

        this.updateScoreboard();
        this.updateTurnIndicator();
        this.updateUI('Erster Spieler: Bitte würfeln!');
        this.turnState = 'START';
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIdx];
    }

    getPreviousPlayer() {
        let idx = this.currentPlayerIdx;
        let p;
        let attempts = 0;

        // Loop backwards to find first ACTIVE player
        do {
            idx--;
            if (idx < 0) idx = this.players.length - 1;
            p = this.players[idx];
            attempts++;
        } while (this.mode === 'kids' && p.lives <= 0 && attempts < this.players.length);

        return p;
    }

    updateTurnIndicator() {
        const p = this.getCurrentPlayer();
        if (this.mode === 'classic') {
            this.turnIndicator.textContent = "";
        } else {
            this.turnIndicator.textContent = `${p.name} ist dran`;
        }
    }

    updateScoreboard() {
        if (this.mode === 'classic') {
            this.scoreboard.innerHTML = '';
            return;
        }

        let html = '';
        console.log("Updating scoreboard. Current player index:", this.currentPlayerIdx);
        this.players.forEach((p, i) => {
            const activeClass = i === this.currentPlayerIdx ? 'active-row' : '';
            const heart = '❤️';
            const livesStr = heart.repeat(p.lives);
            html += `<div class="score-row ${activeClass}">
                <span class="p-name">${p.name}</span>
                <span class="p-lives">${livesStr}</span>
            </div>`;
        });
        this.scoreboard.innerHTML = html;
    }

    calculateValue(d1, d2) {
        const v1 = Math.max(d1, d2);
        const v2 = Math.min(d1, d2);
        if (v1 === 2 && v2 === 1) return 1000;
        if (v1 === v2) return v1 * 100;
        return parseInt(`${v1}${v2}`);
    }

    getDisplayValue(internalScore) {
        if (internalScore === 1000) return "Mäxchen (21)!";
        if (internalScore >= 100) return `${internalScore / 100}${internalScore / 100} (Pasch)`;
        return `${internalScore}`;
    }

    formatClaim(val) {
        if (val === 21) return "Mäxchen (21)";
        if (val % 11 === 0) return `${val} (Pasch)`;
        return val;
    }

    roll() {
        this.btnPeek.style.display = 'block';
        this.btnReveal.textContent = 'AUFDECKEN';
        if (navigator.vibrate) navigator.vibrate(50);

        if (this.mode === 'classic') {
            this.updateUI(`Schüttelt...`);
        } else {
            this.updateUI(`${this.getCurrentPlayer().name} schüttelt...`);
        }

        this.cup.classList.add('shaking');

        setTimeout(() => {
            this.cup.classList.remove('shaking');
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            this.currentRoll = { d1, d2, value: this.calculateValue(d1, d2) };

            this.renderDice();
            this.turnState = 'ROLLED';
            this.updateUI('Würfel liegen! Schauen oder Aufdecken?');

            this.btnRoll.classList.add('hidden');
            this.actionButtons.classList.remove('hidden');
            this.diceContainer.classList.remove('hidden');

            if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
        }, 600);
    }

    renderDice() {
        this.die1.innerHTML = this.getDieSVG(this.currentRoll.d1);
        this.die2.innerHTML = this.getDieSVG(this.currentRoll.d2);
    }

    getDieSVG(val) {
        const pips = {
            1: [[50, 50]],
            2: [[20, 20], [80, 80]],
            3: [[20, 20], [50, 50], [80, 80]],
            4: [[20, 20], [20, 80], [80, 20], [80, 80]],
            5: [[20, 20], [20, 80], [50, 50], [80, 20], [80, 80]],
            6: [[20, 20], [20, 50], [20, 80], [80, 20], [80, 50], [80, 80]]
        };

        let circles = '';
        if (pips[val]) {
            pips[val].forEach(p => {
                circles += `<circle cx="${p[0]}" cy="${p[1]}" r="8" fill="#000"/>`;
            });
        }

        return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            ${circles}
        </svg>`;
    }

    peek(isPeeking) {
        if (isPeeking) {
            if (this.turnState !== 'ROLLED') return;
            this.turnState = 'PEEKING';
            this.cup.classList.add('lifted');
            this.msgDisplay.textContent = 'Psst...';
            this.die1.innerHTML = this.getDieSVG(this.currentRoll.d1);
            this.die2.innerHTML = this.getDieSVG(this.currentRoll.d2);
        } else {
            if (this.turnState !== 'PEEKING') return;
            this.turnState = 'CLAIMING';
            this.cup.classList.remove('lifted');
            this.enterClaimPhase();
        }
    }

    enterClaimPhase() {
        this.btnPeek.style.display = 'none';
        this.actionButtons.classList.remove('hidden');
        this.claimControls.classList.remove('hidden');
        this.inputBuffer = '';
        if (this.mode === 'classic') {
            this.msgDisplay.textContent = `Dein Gebot:`;
        } else {
            this.msgDisplay.textContent = `${this.getCurrentPlayer().name}, dein Gebot:`;
        }
    }

    handleNumpad(num) {
        if (this.inputBuffer.length < 2) {
            this.inputBuffer += num;
            this.msgDisplay.textContent = `Gebot: ${this.inputBuffer}`;
        }
    }

    submitClaim() {
        if (!this.inputBuffer) return;
        if (this.inputBuffer.length !== 2) {
            this.updateUI("Bitte eine zweistellige Zahl eingeben!");
            if (navigator.vibrate) navigator.vibrate(200);
            return;
        }
        let d1 = parseInt(this.inputBuffer[0]);
        let d2 = parseInt(this.inputBuffer[1]);
        if (d1 < d2) [d1, d2] = [d2, d1];

        const claimVal = parseInt(`${d1}${d2}`);
        const claimScore = this.calculateValue(d1, d2);

        if (this.lastClaim) {
            const lastD1 = Math.floor(this.lastClaim / 10);
            const lastD2 = this.lastClaim % 10;
            const lastScore = this.calculateValue(lastD1, lastD2);

            if (claimScore <= lastScore) {
                this.updateUI(`Gebot muss höher sein als ${this.formatClaim(this.lastClaim)}!`);
                if (navigator.vibrate) navigator.vibrate(200);
                this.inputBuffer = '';
                return;
            }
        }

        this.lastClaim = claimVal;
        this.currentClaimDisplay.textContent = this.formatClaim(claimVal);

        this.advancePlayer();

        this.turnState = 'DECIDING';
        this.claimControls.classList.add('hidden');

        if (this.mode === 'classic') {
            this.updateUI(`Glauben oder Anzweifeln?`);
        } else {
            this.updateUI(`${this.getCurrentPlayer().name}: Glauben oder Anzweifeln?`);
        }

        this.btnRoll.textContent = "GLAUBEN & WÜRFELN";
        this.btnRoll.classList.remove('hidden');
        this.actionButtons.classList.remove('hidden');
        this.btnPeek.style.display = 'none';
        this.btnReveal.textContent = 'ANZWEIFELN';
    }

    advancePlayer() {
        // Skip players with 0 lives
        let nextIdx = (this.currentPlayerIdx + 1) % this.players.length;
        if (this.mode === 'kids') {
            // Safety loop to prevent infinite loop if everyone is dead (should not happen if game ends)
            let attempts = 0;
            while (this.players[nextIdx].lives <= 0 && attempts < this.players.length) {
                nextIdx = (nextIdx + 1) % this.players.length;
                attempts++;
            }
        }
        this.currentPlayerIdx = nextIdx;
        this.updateTurnIndicator();
        this.updateScoreboard();
    }

    reveal() {
        this.cup.classList.add('lifted');
        this.diceContainer.classList.add('visible');

        let msg = `Ergebnis: ${this.getDisplayValue(this.currentRoll.value)}`;

        if (this.currentRoll.value === 1000) {
            // MÄXCHEN SPECIAL RULE
            let msg = `Mäxchen (21)! <br>`;

            if (this.mode === 'classic') {
                msg += `<span style="color:var(--danger-color)">ALLE ANDEREN TRINKEN!</span>`;
                this.turnState = 'ROUND_END';
                this.btnRoll.textContent = "NEUE RUNDE";
            } else {
                // Kids mode: All others lose a life
                msg += `<span style="color:var(--danger-color)">ALLE ANDEREN VERLIEREN EIN LEBEN!</span>`;
                let anyDead = false;
                let activePlayers = 0;

                this.players.forEach(p => {
                    if (p !== this.getCurrentPlayer() && p.lives > 0) {
                        p.lives--;
                        if (p.lives === 0) anyDead = true;
                    }
                    if (p.lives > 0) activePlayers++;
                });

                this.updateScoreboard();

                if (activePlayers < 1) { // Should usually leave at least winner alive
                    msg += `<br><strong>Spiel vorbei!</strong>`;
                    this.turnState = 'GAME_OVER';
                    this.btnRoll.textContent = "NEUSTART (Alle Leben voll)";
                } else {
                    this.turnState = 'ROUND_END';
                    this.btnRoll.textContent = "NEUE RUNDE";
                }
            }
            this.msgDisplay.innerHTML = msg;
            this.actionButtons.classList.add('hidden');
            this.claimControls.classList.add('hidden');
            this.btnRoll.classList.remove('hidden');
            this.cup.classList.add('lifted');
            this.diceContainer.classList.add('visible');
            return;
        }

        if (this.turnState === 'DECIDING') {
            const actualScore = this.currentRoll.value;
            let lastClaimScore = 0;
            if (this.lastClaim) {
                const d1 = Math.floor(this.lastClaim / 10);
                const d2 = this.lastClaim % 10;
                lastClaimScore = this.calculateValue(d1, d2);
            }

            let loser = null;

            if (actualScore >= lastClaimScore) {
                msg += ` <br><span style="color:var(--danger-color)">STIMMT!</span>`;
                loser = this.getCurrentPlayer();
            } else {
                msg += ` <br><span style="color:var(--primary-color)">GELOGEN!</span>`;
                loser = this.getPreviousPlayer();
            }

            msg += `<br> ${loser.name} verliert!`;

            if (this.mode === 'kids') {
                loser.lives--;

                if (loser.lives === 0) {
                    msg += `<br><strong>${loser.name} ist raus! Spiel vorbei!</strong>`;
                    this.turnState = 'GAME_OVER';
                    // Update scoreboard to show 0 lives (and no specific highlight or highlight loser)
                    this.updateScoreboard();
                    this.btnRoll.textContent = "NEUSTART (Alle Leben voll)";
                } else {
                    // Switch to loser immediately
                    this.currentPlayerIdx = this.players.indexOf(loser);

                    // Update everything once
                    this.updateTurnIndicator();
                    this.updateScoreboard();

                    this.turnState = 'ROUND_END';
                    this.btnRoll.textContent = "NEUE RUNDE";
                }
            } else {
                // Classic
                // msg already has "Du trinkst" / "Voriger Spieler trinkt"
                // remove the generic loser.name line which might look weird ("Spieler verliert!")
                msg = msg.replace(`<br> ${loser.name} verliert!`, "");
                this.turnState = 'ROUND_END';
                this.btnRoll.textContent = "NEUE RUNDE";
            }
        } else {
            // Premature reveal without Mäxchen
            msg += `<br><span style="color:var(--danger-color)">Kein Mäxchen!</span>`;

            if (this.mode === 'classic') {
                msg += `<br>Zu früh aufgedeckt: <span style="color:var(--danger-color)">Du trinkst!</span>`;
                this.turnState = 'ROUND_END';
                this.btnRoll.textContent = "NEUE RUNDE";
            } else {
                const loser = this.getCurrentPlayer();
                loser.lives--;
                msg += `<br>Zu früh aufgedeckt: ${loser.name} verliert ein Leben!`;

                if (loser.lives === 0) {
                    msg += `<br><strong>${loser.name} ist raus! Spiel vorbei!</strong>`;
                    this.turnState = 'GAME_OVER';
                    this.btnRoll.textContent = "NEUSTART (Alle Leben voll)";
                } else {
                    this.turnState = 'ROUND_END';
                    this.btnRoll.textContent = "NEUE RUNDE";
                }
                this.updateScoreboard();
            }
        }

        this.msgDisplay.innerHTML = msg;
        this.actionButtons.classList.add('hidden');
        this.claimControls.classList.add('hidden');
        this.btnRoll.classList.remove('hidden');
    }

    nextRound() {
        this.resetRound();
        this.lastClaim = 0;
        this.currentClaimDisplay.textContent = '-';
        this.turnState = 'START';

        if (this.mode === 'classic') {
            this.updateUI(`Neue Runde beginnt`);
        } else {
            this.updateUI(`${this.getCurrentPlayer().name} beginnt die Runde`);
        }

        this.updateScoreboard();
        this.updateTurnIndicator();
        this.btnRoll.textContent = "WÜRFELN";
    }

    resetFullGame() {
        this.players.forEach(p => p.lives = 5);
        this.currentPlayerIdx = 0;
        this.updateScoreboard();
        this.nextRound();
    }

    resetRound() {
        this.cup.classList.remove('lifted');
        this.diceContainer.classList.remove('visible');
    }

    updateUI(msg) {
        if (msg) this.msgDisplay.textContent = msg;
    }
}

const game = new Game();
