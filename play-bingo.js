function resetGameState() {
    matchRanking.length = 0;
    nextRank = 1;
    finishedPlayers.clear();
    gameFinished = false;
}

function renderPlayerCards() {
    const players = window.bingoConfig.players || [];
    const numCardsPerPlayer = window.bingoConfig.numCardsPerPlayer || 6;
    const toggleShowWords = JSON.parse(sessionStorage.getItem('showWordsOnCards')) || false;

    const selectedWords = JSON.parse(sessionStorage.getItem('selectedWords')) || [];
    document.getElementById('game_words-left').textContent = `Words left: ${selectedWords.length}`;

    const wordDistribution = generateWordDistribution(players.length, numCardsPerPlayer, selectedWords);
    window.bingoConfig.wordDistribution = wordDistribution;

    const mainContainer = document.querySelector('.game_main-container');
    mainContainer.innerHTML = ''; // Limpiar contenido existente

    players.forEach((player, playerIndex) => {
        const playerCardBox = document.createElement('div');
        playerCardBox.className = 'game_player-card-box';
        playerCardBox.id = `game_pl-card_${player.name.toLowerCase().replace(/\s+/g, '-')}`;

        const playerNameDiv = document.createElement('div');
        playerNameDiv.className = 'game_player-name';
        playerNameDiv.innerHTML = `
            <img class="game_player-icon" src="${player.icon}" alt="Player icon">
            <h3>${player.name}</h3>
        `;

        const wordsContainer = document.createElement('div');
        wordsContainer.className = 'game_player-words-container';

        const playerWords = wordDistribution[playerIndex] || [];
        playerWords.forEach(word => {
            const wordPictureDiv = document.createElement('div');
            wordPictureDiv.className = 'game_word-picture';
            wordPictureDiv.innerHTML = `
                <img src="${word.image}" alt="${word.word}" data-category="${word.category}">
                ${toggleShowWords ? `<span>${word.word.toUpperCase().replace('-', ' ')}</span>` : ''}
            `;
            wordsContainer.appendChild(wordPictureDiv);
        });

        playerCardBox.appendChild(playerNameDiv);
        playerCardBox.appendChild(wordsContainer);
        mainContainer.appendChild(playerCardBox);
    });
}

function startNewMatch() {
    const initial = window.bingoInitialState;
    if (!initial) {
        alert('Unable to restart match: initial config missing.');
        window.location.href = 'index.html';
        return;
    }

    sessionStorage.setItem('selectedWords', JSON.stringify(initial.selectedWords));
    sessionStorage.setItem('players', JSON.stringify(initial.players));
    sessionStorage.setItem('numCardsPerPlayer', String(initial.numCardsPerPlayer));
    sessionStorage.setItem('showWordsOnCards', JSON.stringify(initial.toggleShowWords));

    window.bingoConfig = {
        players: JSON.parse(JSON.stringify(initial.players)),
        selectedWords: JSON.parse(JSON.stringify(initial.selectedWords)),
        numCardsPerPlayer: initial.numCardsPerPlayer,
        wordDistribution: []
    };

    resetGameState();
    hideWinnerAnnouncement();

    const existingFinal = document.querySelector('.final-ranking-container');
    if (existingFinal) existingFinal.remove();

    const footer = document.querySelector('.game_footer');
    if (footer) {
        footer.classList.remove('cross-out');
        const footerCurrentWord = document.getElementById('game_footer-current-word');
        if (footerCurrentWord) footerCurrentWord.remove();
    }

    renderPlayerCards();

    const btnNextWord = document.getElementById('btn_next-word');
    const btnCrossOut = document.getElementById('game_btn-cross-out-word');
    if (btnNextWord) {
        btnNextWord.disabled = false;
        btnNextWord.title = '';
    }
    if (btnCrossOut) btnCrossOut.disabled = false;
}

function initializeGame() {
    const players = JSON.parse(sessionStorage.getItem('players')) || [];
    const selectedWords = JSON.parse(sessionStorage.getItem('selectedWords')) || [];
    const numCardsPerPlayer = parseInt(sessionStorage.getItem('numCardsPerPlayer'), 10) || 6;
    const toggleShowWords = JSON.parse(sessionStorage.getItem('showWordsOnCards')) || false;

    if (players.length === 0 || selectedWords.length === 0) {
        alert('No players or words selected. Please go back and configure the game.');
        window.location.href = 'index.html';
        return;
    }

    window.bingoInitialState = {
        players: JSON.parse(JSON.stringify(players)),
        selectedWords: JSON.parse(JSON.stringify(selectedWords)),
        numCardsPerPlayer,
        toggleShowWords
    };

    window.bingoConfig = {
        players,
        selectedWords,
        numCardsPerPlayer,
        wordDistribution: []
    };

    renderPlayerCards();
    resetGameState();
}

document.addEventListener('DOMContentLoaded', initializeGame);

// Estado global para el match y ranking
const matchRanking = [];
let nextRank = 1;
const finishedPlayers = new Set();
let gameFinished = false;

function hideWinnerAnnouncement() {
    const existing = document.querySelector('.winner-announcement-container');
    if (existing) {
        existing.remove();
    }
}

function renderFinalRanking() {
    hideWinnerAnnouncement();

    const existing = document.querySelector('.final-ranking-container');
    if (existing) existing.remove();

    const finalContainer = document.createElement('div');
    finalContainer.className = 'final-ranking-container';
    finalContainer.innerHTML = `
        <div class="winner-announcement">
            <h2>Final Ranking</h2>
            ${matchRanking.map(entry => `
                <div class="rank-block">
                    <strong>${entry.rank}${entry.rank === 1 ? 'st' : entry.rank === 2 ? 'nd' : entry.rank === 3 ? 'rd' : 'th'}</strong>
                    ${entry.players.map(player => `<div class="rank-player"><img src="${player.icon}" alt="Player icon"><span>${player.name}</span></div>`).join('')}
                </div>
            `).join('')}
        </div>
        <div class="win-announ_btn-container">
            <button class="btn_win-announ" id="game_btn-new-match">Start New Match</button>
            <button class="btn_win-announ" id="game_btn-go-home">Go to Home</button>
        </div>
    `;

    document.body.appendChild(finalContainer);

    const newMatchBtn = finalContainer.querySelector('#game_btn-new-match');
    const goHomeBtn = finalContainer.querySelector('#game_btn-go-home');

    if (newMatchBtn) {
        newMatchBtn.addEventListener('click', () => {
            startNewMatch();
        });
    }

    if (goHomeBtn) {
        goHomeBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
}

// Función para generar la distribución equilibrada de palabras
function generateWordDistribution(numPlayers, numCardsPerPlayer, selectedWords) {
    const totalSlots = numPlayers * numCardsPerPlayer;
    const numWords = selectedWords.length;

    // Función para crear una clave única (word + category)
    const getWordKey = (word) => `${word.word}__${word.category || ''}`;

    // Calcular frecuencias base
    const baseFreq = Math.floor(totalSlots / numWords);
    const extra = totalSlots % numWords;

    // Crear mapa de frecuencias objetivo
    const targetFreq = {};
    selectedWords.forEach((word, index) => {
        targetFreq[getWordKey(word)] = baseFreq + (index < extra ? 1 : 0);
    });

    // Inicializar frecuencias actuales
    const currentFreq = {};
    selectedWords.forEach(word => {
        currentFreq[getWordKey(word)] = 0;
    });

    // Distribución: array de arrays, uno por jugador
    const distribution = Array.from({ length: numPlayers }, () => []);

    // Para cada slot
    for (let slot = 0; slot < totalSlots; slot++) {
        const playerIndex = Math.floor(slot / numCardsPerPlayer);
        const usedInContainer = new Set(distribution[playerIndex].map(w => getWordKey(w)));

        // Encontrar palabras candidatas: no usadas en este contenedor y con frecuencia actual < objetivo
        const candidates = selectedWords.filter(word =>
            !usedInContainer.has(getWordKey(word)) && currentFreq[getWordKey(word)] < targetFreq[getWordKey(word)]
        );

        if (candidates.length === 0) {
            // Si no hay candidatas perfectas, permitir repeticiones en contenedor (aunque no debería pasar)
            candidates.push(...selectedWords.filter(word => !usedInContainer.has(getWordKey(word))));
        }

        if (candidates.length === 0) {
            // Último recurso, permitir cualquier palabra
            candidates.push(...selectedWords);
        }

        // Elegir la palabra con menor frecuencia actual
        candidates.sort((a, b) => currentFreq[getWordKey(a)] - currentFreq[getWordKey(b)]);
        const minFreq = currentFreq[getWordKey(candidates[0])];
        const minFreqCandidates = candidates.filter(word => currentFreq[getWordKey(word)] === minFreq);

        // Elegir al azar entre las de menor frecuencia
        const chosenWord = minFreqCandidates[Math.floor(Math.random() * minFreqCandidates.length)];

        // Asignar
        distribution[playerIndex].push(chosenWord);
        currentFreq[getWordKey(chosenWord)]++;
    }

    return distribution;
}

// Manejar el botón de siguiente palabra
document.addEventListener('DOMContentLoaded', () => {
    const btnNextWord = document.getElementById('btn_next-word');
    const contCurrentWord = document.getElementById('game_cont-current-word');
    const imgCurrentWord = document.querySelector('#game_current-word img');
    const spanCurrentWord = document.getElementById('game_current-word-text');
    const wordsLeftSpan = document.getElementById('game_words-left');
    const btnCrossOut = document.getElementById('game_btn-cross-out-word');
    const footer = document.querySelector('.game_footer');

    let currentWord = null;
    let matchingWords = [];
    let crossedWords = 0;

    btnNextWord.addEventListener('click', () => {
        if (gameFinished) {
            return;
        }

        // Verificar si el botón está deshabilitado
        if (btnNextWord.disabled) {
            return;
        }

        // Obtener palabras del sessionStorage
        let selectedWords = JSON.parse(sessionStorage.getItem('selectedWords')) || [];

        // Verificar si quedan palabras
        if (selectedWords.length === 0) {
            alert('No more words available!');
            return;
        }

        // Seleccionar una palabra al azar
        const randomIndex = Math.floor(Math.random() * selectedWords.length);
        currentWord = selectedWords[randomIndex];

        // Obtener la opción de mostrar palabras en las tarjetas
        const showWordsOnCards = sessionStorage.getItem('showWordsOnCards') === 'true';

        // Mostrar la palabra en la imagen
        imgCurrentWord.src = currentWord.image;
        imgCurrentWord.alt = currentWord.word;

        // Mostrar el texto si la opción está activada
        if (showWordsOnCards) {
            spanCurrentWord.textContent = currentWord.word.toUpperCase().replace('-', ' ');
            spanCurrentWord.style.display = 'block';
        } else {
            spanCurrentWord.style.display = 'none';
        }

        // Hacer visible el contenedor de palabra actual
        contCurrentWord.classList.add('visible');

        //Hacer animación de word-reveal
        const revealSquare1 = document.createElement('div');
        revealSquare1.className = 'game_reveal-square magenta';
        contCurrentWord.appendChild(revealSquare1);
        const revealSquare2 = document.createElement('div');
        revealSquare2.className = 'game_reveal-square cyan';
        contCurrentWord.appendChild(revealSquare2);
        const revealSquare3 = document.createElement('div');
        revealSquare3.className = 'game_reveal-square yellow';
        contCurrentWord.appendChild(revealSquare3);
        setTimeout(() => {
            revealSquare1.classList.add('reveal-word');
        }, 100);
        setTimeout(() => {
            revealSquare2.classList.add('reveal-word');
        }, 300);
        setTimeout(() => {
            revealSquare3.classList.add('reveal-word');
        }, 500);
        setTimeout(() => {
            revealSquare1.remove();
            revealSquare2.remove();
            revealSquare3.remove();
        }, 3000);
    });

    btnCrossOut.addEventListener('click', () => {
        if (!currentWord) return;

        // Ocultar el contenedor
        contCurrentWord.classList.remove('visible');

        //Cambiar color del footer
        footer.classList.add('cross-out');

        // Eliminar la palabra de selectedWords
        let selectedWords = JSON.parse(sessionStorage.getItem('selectedWords')) || [];
        const index = selectedWords.findIndex(word => word.word === currentWord.word && word.category === currentWord.category);
        if (index !== -1) {
            selectedWords.splice(index, 1);
            sessionStorage.setItem('selectedWords', JSON.stringify(selectedWords));
        }

        // Actualizar el contador de palabras restantes
        wordsLeftSpan.textContent = `Words left: ${selectedWords.length}`;

        // Agregar la palabra actual al footer
        const currentWordDisplay = document.createElement('div');
        currentWordDisplay.id = 'game_footer-current-word';
        currentWordDisplay.innerHTML = `
            <img src="${currentWord.image}" alt="${currentWord.word}">
            ${sessionStorage.getItem('showWordsOnCards') === 'true' ? `<span>${currentWord.word.toUpperCase().replace('-', ' ')}</span>` : ''}
        `;
        footer.insertBefore(currentWordDisplay, btnNextWord);

        // Encontrar todas las palabras coincidentes en las tarjetas
        matchingWords = [];
        document.querySelectorAll('.game_word-picture').forEach(picture => {
            const img = picture.querySelector('img');
            const span = picture.querySelector('span');
            if (img.alt === currentWord.word && img.dataset.category === currentWord.category) {
                matchingWords.push({ picture, img, span });
            }
        });


        crossedWords = 0;

        // Habilitar clicks en las palabras coincidentes
        matchingWords.forEach(({ picture }) => {
            picture.classList.add('clickable');
            picture.addEventListener('click', handleWordClick);
        });

        // Deshabilitar el botón next word
        if (matchingWords.length > 0) {
            btnNextWord.disabled = true;
            btnNextWord.title = 'Cross out every word in the game!';
        } else {
            // Habilitar el botón next word
            btnNextWord.disabled = false;
            btnNextWord.title = '';
            // Volver al color original del footer
            footer.classList.remove('cross-out');
            // Limpiar el display de la palabra actual en el footer
            const footerCurrentWord = document.getElementById('game_footer-current-word');
            if (footerCurrentWord) {
                footerCurrentWord.remove();
            }

            currentWord = null;
            matchingWords = [];
            crossedWords = 0;
        }

    });

    function handleWordClick(event) {
        const picture = event.currentTarget;

        // Crear y mostrar la imagen de cruz
        const crossImg = document.createElement('img');
        crossImg.src = './img/icons/cross.png';
        crossImg.alt = 'Cross';
        crossImg.className = 'game_cross-overlay';
        picture.appendChild(crossImg);

        // Después de 2 segundos, ocultar la cruz y aplicar opacity
        setTimeout(() => {
            crossImg.remove();

            picture.classList.remove('clickable');
            picture.classList.add('crossed');

            crossedWords++;
            if (crossedWords === matchingWords.length) {
                // Habilitar el botón next word
                btnNextWord.disabled = false;
                btnNextWord.title = '';
                // Volver al color original del footer
                footer.classList.remove('cross-out');
                // Limpiar el display de la palabra actual en el footer
                const footerCurrentWord = document.getElementById('game_footer-current-word');
                if (footerCurrentWord) {
                    footerCurrentWord.remove();
                }
                // Remover event listeners
                matchingWords.forEach(({ picture }) => {
                    picture.style.cursor = '';
                    picture.removeEventListener('click', handleWordClick);
                });
                currentWord = null;
                matchingWords = [];
                crossedWords = 0;

                // Comprobar si hay un ganador (ignorando jugadores ya finalizados)
                const players = window.bingoConfig.players;
                const currentWinners = [];
                players.forEach(player => {
                    if (finishedPlayers.has(player.name)) return;

                    const cardId = `game_pl-card_${player.name.toLowerCase().replace(/\s+/g, '-')}`;
                    const card = document.getElementById(cardId);
                    if (card) {
                        const wordPictures = card.querySelectorAll('.game_word-picture');
                        const allCrossed = Array.from(wordPictures).every(pic => pic.classList.contains('crossed'));
                        if (allCrossed) {
                            currentWinners.push(player);
                        }
                    }
                });

                if (currentWinners.length > 0) {
                    // Añadir al ranking y marcar como finalizados
                    matchRanking.push({ rank: nextRank, players: currentWinners });
                    nextRank += currentWinners.length;
                    currentWinners.forEach(player => finishedPlayers.add(player.name));

                    // Anuncio de ganador(es)
                    const winnerDiv = document.createElement('div');
                    winnerDiv.className = 'winner-announcement-container';
                    const title = currentWinners.length === 1 ? 'We have a winner!' : 'We have a tie!';
                    winnerDiv.innerHTML = `
                        <div class='winner-announcement'>
                            <h2>${title}</h2>
                            ${currentWinners.map(player => `
                                <div class="winner-info">
                                    <img src="${player.icon}" alt="Winner icon">
                                    <span>${player.name}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="win-announ_btn-container">
                            <button class="btn_win-announ" id="game_btn-continue-match">Continue this match</button>
                            <button class="btn_win-announ" id="game_btn-finish-match">Finish this match</button>
                        </div>
                    `;
                    document.body.appendChild(winnerDiv);

                    const continueBtn = winnerDiv.querySelector('#game_btn-continue-match');
                    const finishBtn = winnerDiv.querySelector('#game_btn-finish-match');

                    continueBtn.addEventListener('click', () => {
                        hideWinnerAnnouncement();
                        if (finishedPlayers.size === players.length) {
                            gameFinished = true;
                            renderFinalRanking();
                            btnNextWord.disabled = true;
                            btnCrossOut.disabled = true;
                            return;
                        }

                        btnNextWord.disabled = false;
                        btnNextWord.title = '';
                        btnCrossOut.disabled = false;
                    });

                    finishBtn.addEventListener('click', () => {
                        gameFinished = true;
                        hideWinnerAnnouncement();
                        renderFinalRanking();
                        btnNextWord.disabled = true;
                        btnCrossOut.disabled = true;
                    });

                    // Si todos ganaron al mismo tiempo, cerrar automáticamente
                    if (finishedPlayers.size === players.length) {
                        gameFinished = true;
                        btnNextWord.disabled = true;
                        btnCrossOut.disabled = true;
                        renderFinalRanking();
                    }
                }
            }
        }, 2000);
    }
});

// #################### BOTÓN MENU #####################

const bodyElement = document.querySelector('body');


const btnMenu = document.getElementById('game_btn-menu');
btnMenu.addEventListener('click', () => {
    const menuContainer = document.createElement('div');
    menuContainer.className = 'full-black-container';
    menuContainer.innerHTML = `
        <div class="game-menu_box">
            <i class="fa-regular fa-circle-xmark btn_close-container" id="close-menu"></i>
            <h3>Menu</h3>
            <button class="game-menu_button" id="game-menu_btn-restart-game">Restart Game</button>
            <button class="game-menu_button" id="game-menu_btn-go-to-home">Go to Home</button>
        </div>
    `
    bodyElement.appendChild(menuContainer);

    setTimeout(() => {
        menuContainer.classList.add('visible');
    }, 100);

    
    function closeMenu() {
        
        menuContainer.classList.remove('visible');
        setTimeout(() => {
            menuContainer.remove();
        }, 200);
    }
    
    const btnCloseMenu = document.querySelector('#close-menu')
    btnCloseMenu.addEventListener('click', closeMenu);
   

    const btnRestartGame = document.getElementById('game-menu_btn-restart-game');
    if (btnRestartGame) {
        btnRestartGame.addEventListener('click', () => {
            startNewMatch();
            closeMenu();
        });
    }

    const goHomeBtn = document.getElementById('game-menu_btn-go-to-home');

    if (goHomeBtn) {
        goHomeBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
})