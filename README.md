# Mäxchen (Meier) Browser Game

This repository contains the source code for a browser-based Mäxchen (also known as Meier, Macháček, or 21) game designed for multiple players and optimized for smartphone displays. The game is built using HTML, CSS, and JavaScript.

## Features
*   **Multiple Players:** Supports "Classic" mode (drink penalties) and "Kids" mode (lives).
*   **Interactive Dice Rolling:** Realistic shaking animation and vibration feedback (on supported devices).
*   **Game Logic:** Implements full Mäxchen rules including "Peeking", "Claiming", "Doubting", and "Revealing".
*   **Smartphone Optimized:** Designed with a mobile-first approach for easy play on the go.
*   **German Localization:** The entire game interface and instructions are in German.
*   **Help System:** Integrated "Spieleanleitung" (Game Instructions) modal.

## How to Play
1.  **Clone the Repository:** Clone this repository to your local machine.
2.  **Open `index.html`:** Open the `index.html` file in your web browser.
3.  **Select Mode:** Choose between "Classic" (pub rules) or "Kids" (lives tracking).
4.  **Roll the Dice:** Click "WÜRFELN" to shake the cup.
5.  **Peek:** Hold "UNTER DEN BECHER SCHAUEN" to secretly check your roll.
6.  **Make a Claim:** Enter a higher value than the previous player (or any value if starting).
7.  **Pass Turn:** The next player must decide to "Trust" (roll themselves) or "Doubt" (reveal).
8.  **Reveal:** If doubted, the cup is lifted. The loser takes a penalty (drink or life lost).

## Repository Contents
*   `index.html`: The main HTML file containing the structure of the game.
*   `style.css`: The CSS file containing the styles for the game.
*   `script.js`: The JavaScript file containing the game logic and functionality.
*   `simulation.html` / `simulation.js`: Files for running automated game simulations.
*   `test.html`: Unit tests for game logic.

## Development Workflows
*   `.agent/workflows/wsl-browser-testing.md`: A workflow guide for running browser tests in a WSL environment. This file is included to assist developers in setting up their testing environment correctly.

## Technologies Used
*   HTML5
*   CSS3
*   JavaScript

## Potential Improvements
*   Add network multiplayer support.
*   Enhance 3D dice animations.
*   Add more sound effects.

## Contributing
Feel free to fork this repository and submit pull requests for bug fixes or feature enhancements.

## License
This project is licensed under the [MIT License](LICENSE).
