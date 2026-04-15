document.addEventListener('DOMContentLoaded', () => {
    const playersData = document.getElementById('game-set_players-data');
    const players = JSON.parse(sessionStorage.getItem('players')) || [];

    if (players.length === 0) {
        playersData.innerHTML = '<p>No players selected. Please go back and add players.</p>';
    } else {
        players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'game-set_player';
            playerDiv.innerHTML = `
                <img src="${player.icon}" alt="Player icon">
                <span></span>
            `;
            playersData.appendChild(playerDiv);

            // Establecer el texto del span de forma segura
            const span = playerDiv.querySelector('span');
            span.textContent = player.name;
        });
    }

    // Cargar palabras seleccionadas
    const wordsData = document.getElementById('game-set_words-data');
    const selectedWords = JSON.parse(sessionStorage.getItem('selectedWords')) || [];

    if (selectedWords.length === 0) {
        wordsData.innerHTML = '<p>No words selected. Please go back and select words.</p>';
    } else {
        selectedWords.forEach(word => {
            const wordDiv = document.createElement('div');
            wordDiv.className = 'game-set_player'; // Usando la misma clase para consistencia
            wordDiv.innerHTML = `
                <img src="${word.image}" alt="Word image">
                <span></span>
            `;
            wordsData.appendChild(wordDiv);

            // Establecer el texto del span de forma segura
            const span = wordDiv.querySelector('span');
            span.textContent = word.word.toUpperCase().replace('-', ' '); // Convertir a mayúsculas y eliminar guiones para mejor legibilidad
        });
    }

    // Toggle: show words on cards (used by the game generator on the next page)
    const toggleShowWords = document.getElementById('toggle-show-words');
    const demoCardImage = document.getElementById('game-set_demo-card');
    const STORAGE_KEY_SHOW_WORDS = 'showWordsOnCards';

    const getStoredShowWords = () => {
        const stored = sessionStorage.getItem(STORAGE_KEY_SHOW_WORDS);
        if (stored === null) return true;
        return stored === 'true';
    };

    const setStoredShowWords = (value) => {
        sessionStorage.setItem(STORAGE_KEY_SHOW_WORDS, value ? 'true' : 'false');
    };

    const updateDemoCardImage = (showWords) => {
        if (!demoCardImage) return;
        demoCardImage.src = showWords
            ? './img/game-settings_card-with-words.png'
            : './img/game-settings_card-without-words.png';
    };

    const initShowWordsToggle = () => {
        const showWords = getStoredShowWords();
        setStoredShowWords(showWords); // ensure key exists
        updateDemoCardImage(showWords);

        if (toggleShowWords) {
            toggleShowWords.checked = showWords;
            toggleShowWords.addEventListener('change', () => {
                setStoredShowWords(toggleShowWords.checked);
                updateDemoCardImage(toggleShowWords.checked);
            });
        }
    };

    initShowWordsToggle();

    // ------------------
    // Number of cards input
    // ------------------
    const STORAGE_KEY_NUM_CARDS = 'numCardsPerPlayer';
    const numCardsInput = document.getElementById('num-cards-input');

    const getStoredNumCards = () => {
        const stored = sessionStorage.getItem(STORAGE_KEY_NUM_CARDS);
        const parsed = parseInt(stored, 10);
        if (Number.isInteger(parsed)) {
            const min = parseInt(numCardsInput?.min ?? '4', 10);
            const max = parseInt(numCardsInput?.max ?? '10', 10);
            return Math.min(Math.max(parsed, min), max);
        }
        return parseInt(numCardsInput?.value ?? '6', 10);
    };

    const setStoredNumCards = (value) => {
        sessionStorage.setItem(STORAGE_KEY_NUM_CARDS, String(value));
    };

    const initNumCardsInput = () => {
        if (!numCardsInput) return;

        const storedValue = getStoredNumCards();
        numCardsInput.value = storedValue;
        setStoredNumCards(storedValue); // persist default if not already set

        numCardsInput.addEventListener('change', () => {
            let value = parseInt(numCardsInput.value, 10);
            const min = parseInt(numCardsInput.min || '4', 10);
            const max = parseInt(numCardsInput.max || '10', 10);
            if (Number.isNaN(value)) value = min;
            value = Math.min(Math.max(value, min), max);
            numCardsInput.value = value;
            setStoredNumCards(value);
        });
    };

    initNumCardsInput();
});

const btnStartGame = document.getElementById('btn_start-game');
if (btnStartGame) {
    btnStartGame.addEventListener('click', () => {
        window.location.href = 'play-bingo.html';
    });
}