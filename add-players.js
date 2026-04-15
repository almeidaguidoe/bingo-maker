const playerIcons = ['star', 'moon', 'heart', 'music', 'fire', 'water', 'tree', 'plant', 'mushroom', 
    'flower', 'watermelon', 'avocado', 'lemon', 'strawberry', 'rainbow', 'joystick', 'brain', 'alien', 'skull', 
    'ghost', 'robot', 'poo', 'football', 'basketball', 'tennis-ball'
];

//################ PLAYER ICONS #################

function setupPlayerIcon(img) {
    const randomIndex = Math.floor(Math.random() * playerIcons.length);
    img.dataset.index = randomIndex;
    img.src = `./img/player-icons/${playerIcons[randomIndex]}.png`;

    img.addEventListener('click', () => {
        let index = Number(img.dataset.index);
        index = (index + 1) % playerIcons.length;
        img.dataset.index = index;
        img.src = `./img/player-icons/${playerIcons[index]}.png`;
    });

    img.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        let index = Number(img.dataset.index);
        index = (index - 1 + playerIcons.length) % playerIcons.length;
        img.dataset.index = index;
        img.src = `./img/player-icons/${playerIcons[index]}.png`;
    });
}

//################ UPDATE CONTINUE BUTTON #################

function updateContinueButton() {
    const playerBoxes = document.querySelectorAll('.add-pl_player-box');
    let validCount = 0;
    const playerNames = [];
    const duplicateNames = new Set();
    
    // Contar jugadores válidos e identificar duplicados
    playerBoxes.forEach(box => {
        const name = box.querySelector('.add-pl_player-name-input').value.trim();
        if (name.length > 0) {
            validCount++;
            playerNames.push({ name, box });
        }
    });
    
    // Identificar nombres duplicados
    playerNames.forEach((player, index) => {
        for (let i = index + 1; i < playerNames.length; i++) {
            if (player.name.toLowerCase() === playerNames[i].name.toLowerCase()) {
                duplicateNames.add(player.name.toLowerCase());
            }
        }
    });
    
    // Aplicar estilos de error a duplicados
    let hasDuplicates = false;
    playerBoxes.forEach(box => {
        const input = box.querySelector('.add-pl_player-name-input');
        const name = input.value.trim();
        
        if (duplicateNames.has(name.toLowerCase())) {
            input.classList.add('add-pl_player-name-input--duplicate');
            hasDuplicates = true;
        } else {
            input.classList.remove('add-pl_player-name-input--duplicate');
        }
    });
    
    // Mostrar/ocultar mensaje de error
    let errorMessage = document.getElementById('add-pl_error-message');
    if (hasDuplicates) {
        if (!errorMessage) {
            errorMessage = document.createElement('div');
            errorMessage.id = 'add-pl_error-message';
            errorMessage.className = 'add-pl_error-message';
            errorMessage.textContent = 'Players must have different names';
            document.querySelector('.add-players_players-container').appendChild(errorMessage);
        }
    } else {
        if (errorMessage) {
            errorMessage.remove();
        }
    }
    
    // Deshabilitar botón si hay menos de 3 jugadores o si hay duplicados
    continueButton.disabled = validCount < 3 || hasDuplicates;
    continueButton.style.opacity = (validCount < 3 || hasDuplicates) ? '0.5' : '1';
    
    if (validCount < 3 && hasDuplicates) {
        continueButton.title = 'Please add 3 or more players with different names';
    } else if (validCount < 3) {
        continueButton.title = 'Please add 3 or more players';
    } else if (hasDuplicates) {
        continueButton.title = 'Players must have different names';
    } else {
        continueButton.title = '';
    }
}

// Aplicar a los jugadores iniciales
document.querySelectorAll('.add-pl_player-icon').forEach(img => setupPlayerIcon(img));
document.querySelectorAll('.add-pl_player-name-input').forEach(input => {
    input.addEventListener('input', updateContinueButton);
});
document.querySelectorAll('.add-pl_player-box').forEach(box => setupRemovePlayerButton(box));


//################ ADD A PLAYER BUTTON ###################

const addPlayersButton = document.getElementById('add-player-box-btn');

if (addPlayersButton) {
    addPlayersButton.addEventListener('click', () => {
        const playersContainer = document.getElementById('add-players_players-container');
        const playerBox = document.createElement('div');
        playerBox.className = 'add-pl_player-box';
        playerBox.innerHTML = `
            <img class="add-pl_player-icon">
            <input class="add-pl_player-name-input" type="text" placeholder="Player's name...">
            <i class="fa-solid fa-x player-box_remove-player"></i>
            `;
        playersContainer.appendChild(playerBox);

        // Aplicar lógica al ícono del nuevo jugador
        const newIcon = playerBox.querySelector('.add-pl_player-icon');
        setupPlayerIcon(newIcon);

        // Agregar listener al input del nuevo jugador
        const newInput = playerBox.querySelector('.add-pl_player-name-input');
        newInput.addEventListener('input', updateContinueButton);

        // Agregar listener al botón para eliminar jugador
        setupRemovePlayerButton(playerBox);
    });
}

//################ REMOVE PLAYER CROSS ###################

function setupRemovePlayerButton(playerBox) {
    const removeButton = playerBox.querySelector('.player-box_remove-player');
    if (removeButton) {
        removeButton.addEventListener('click', () => {
            playerBox.remove();
            updateContinueButton();
        });
    }
}

//################ CONTINUE BUTTON ###################

const continueButton = document.getElementById('add-pl_select-words');

continueButton.addEventListener('click', () => {
    if (continueButton.disabled) {
        alert('Please add 3 or more players');
        return;
    }

    const playerBoxes = document.querySelectorAll('.add-pl_player-box');
    
    const players = [];
    playerBoxes.forEach(box => {
        const name = box.querySelector('.add-pl_player-name-input').value.trim();
        const icon = box.querySelector('.add-pl_player-icon').src;
        
        if (name.length > 0) {
            players.push({ name, icon });
        }
    });

    sessionStorage.setItem('players', JSON.stringify(players));
    window.location.href = 'words-selection.html';
});

//################ LOAD PLAYERS IF ALREADY ADDED ###################

const players = JSON.parse(sessionStorage.getItem('players'));

console.log(players);

if (players != null) {
    console.log('Ya hay jugadores agregados');
    playersContainer = document.getElementById('add-players_players-container');
    playersContainer.innerHTML = '';
    players.forEach(player => {
        const playerBox = document.createElement('div');
        playerBox.className = 'add-pl_player-box';
        playerBox.innerHTML = `
            <img class="add-pl_player-icon" src="${player.icon}">
            <input class="add-pl_player-name-input" type="text" placeholder="Player's name...">
            <i class="fa-solid fa-x player-box_remove-player"></i>
        `;
        playersContainer.appendChild(playerBox);

        // Establecer el valor del input después de agregarlo al DOM
        const input = playerBox.querySelector('.add-pl_player-name-input');
        input.value = player.name;

        // Agregar listener al input cargado
        input.addEventListener('input', updateContinueButton);

        // Agregar listener al botón para eliminar jugador
        setupRemovePlayerButton(playerBox);
    });
}

// Llamar a update al final para verificar el estado inicial
updateContinueButton();