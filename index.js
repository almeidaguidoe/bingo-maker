const btnInstructions = document.getElementById('index_btn-instructions');

const instructionsArray = [
  {
    titulo: 'Add the players',
    img: './img/instructions/add-players.png',
    alt: "image showing how to add players"
  },
  {
    titulo: 'Select the words',
    img: './img/instructions/select-words.png',
    alt: "image showing how to select words"
  },
  {
    titulo: 'Final settings',
    img: './img/instructions/final-settings.png',
    alt: "image showing the final settings for the game"
  },
  {
    titulo: 'During the game',
    img: './img/instructions/during-the-game-1.png',
    alt: "image showing how to play the game"
  },
  {
    titulo: 'During the game',
    img: './img/instructions/during-the-game-2.png',
    alt: "image showing how to play the game"
  },
  {
    titulo: 'During the game',
    img: './img/instructions/during-the-game-3.png',
    alt: "image showing how to play the game"
  },
  // añade más pasos segun necesidad
];

let pasoActual = 0;

// El HTML de instrucciones se genera dinámicamente en renderPaso, así que
// no hay un .instr_nav-position en el inicio. Este bloque inicial ya no es necesario.

function renderPaso(index) {
  const paso = instructionsArray[index];
  const instrBox = document.querySelector('.instr_box');

  // Actualiza el contenido del paso
  const bodyHtml = `
    <i class="fa-regular fa-circle-xmark btn_close-container" id="close-instructions"></i>
    <h3>${paso.titulo}</h3>
    <div class="instr_picture-text">
      <img src="${paso.img}" class="instructions_img" alt="${paso.alt}">
    </div>
    <div class="instr_nav-cont">
      <i class="fa-solid fa-circle-chevron-left" id="instr_arrow-left"></i>
      <div class="instr_nav-position"></div>
      <i class="fa-solid fa-circle-chevron-right" id="instr_arrow-right"></i>
    </div>
  `;

  instrBox.innerHTML = bodyHtml;

  // Ahora selecciona navPos después de actualizar el HTML
  const navPos = instrBox.querySelector('.instr_nav-position');

  // Renderiza los puntos (dots)
  navPos.innerHTML = instructionsArray
    .map((_, i) => `<span class="dot ${i === index ? 'active' : ''}" data-step="${i}"></span>`)
    .join('');

  // Agrega eventos a las flechas
  const flechaIzq = instrBox.querySelector('#instr_arrow-left');
  const flechaDer = instrBox.querySelector('#instr_arrow-right');
  flechaIzq.addEventListener('click', () => cambiarPaso(-1));
  flechaDer.addEventListener('click', () => cambiarPaso(+1));
  if (pasoActual === 0) {
    flechaIzq.classList.add('disabled');
  } else {
    flechaIzq.classList.remove('disabled');
  }
  if (pasoActual === (instructionsArray.length - 1)) {
    flechaDer.classList.add('disabled');
  } else {
    flechaDer.classList.remove('disabled');
  }

  // Agrega evento al botón de cerrar
  instrBox.querySelector('#close-instructions').addEventListener('click', cerrarInstrucciones);

  // Opcional: Agrega eventos a los dots
  navPos.querySelectorAll('.dot').forEach(dot => {
    dot.addEventListener('click', () => {
      pasoActual = Number(dot.dataset.step);
      renderPaso(pasoActual);
    });
  });
}



function cambiarPaso(delta) {
  pasoActual = Math.max(0, Math.min(instructionsArray.length - 1, pasoActual + delta));
  renderPaso(pasoActual);
}



function cerrarInstrucciones() {
  const instructionsContainer = document.querySelector('.full-black-container');
  instructionsContainer.classList.remove('visible');
  setTimeout(() => {
    instructionsContainer.remove();
  }, 600);
  pasoActual = 0; // Reinicia al primer paso para la próxima apertura
}


//************************************************************************************ */
btnInstructions.addEventListener('click', () => {
    const instructionsContainer = document.createElement('div');
    instructionsContainer.className = 'full-black-container';
    instructionsContainer.innerHTML = `
        <div class="instr_box">
            <!-- El contenido se renderiza dinámicamente aquí -->
        </div>
    `;

    document.body.appendChild(instructionsContainer);
    setTimeout(() => {
        instructionsContainer.classList.add('visible');
    }, 1);

    // Inicia en el primer paso
    renderPaso(0);
});

