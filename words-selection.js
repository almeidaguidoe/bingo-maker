//################################################################################################
//##################################### WORDS SELECTION PAGE ##########################################
//################################################################################################

import { colecciones } from './words-selection-data.js';

const mainContainer = document.getElementById('words-selection_main-container');
const mainElement = document.querySelector('main');

const todasLasFichas = [];
const fichasSeleccionadas = [];

const mensajePalabrasSeleccionadas = document.getElementById('w-selection_selected-words');

//##################################### GENERACIÓN DEL INDICE ##########################################

const wSelectIndex = document.getElementById('w-select_index');

colecciones.forEach(col => {
    const indexCategory = document.createElement('span');
    indexCategory.id = `index_${col.categoria}`;
    indexCategory.className = 'w-select_index-category';
    indexCategory.innerHTML = `${col.categoria.toUpperCase().replace('-', ' ')}`;
    wSelectIndex.appendChild(indexCategory);
})

const indexCategories = document.querySelectorAll('.w-select_index-category');

console.log(indexCategories);

indexCategories.forEach(cat => {
    cat.addEventListener('click', () => {
        const headerToGo = document.getElementById(`words-selection_category-${cat.id.replace('index_', '')}`)
        headerToGo.scrollIntoView({ behavior: 'smooth'});
    })
})


//##################################### GENERACIÓN DE FICHAS ##########################################

colecciones.forEach(col => {
    const categoryHeader = generarCategoria(col);
    generarSelectAll(col, categoryHeader);
    generarPicsContainer(col);
    generarFichas(col);
});


function generarCategoria(coleccion) {
    const headerWrapper = document.createElement('div');
    headerWrapper.className = 'words-selection_category-header';
    headerWrapper.id = `words-selection_category-${coleccion.categoria}`

    const categoria = document.createElement('h3');
    categoria.innerHTML = `${coleccion.categoria.toUpperCase().replace('-', ' ')}`;

    headerWrapper.appendChild(categoria);
    mainContainer.appendChild(headerWrapper);

    return headerWrapper;
};

function generarSelectAll(coleccion, headerWrapper) {
    const selectAll = document.createElement('span');
    selectAll.innerHTML = `
        <span class="words-selection_tick-box">
            <img src="./img/icons/tick2.png" class="w-select_tick oculto">
        </span>
        <span class="w-select_select-all-text">Select all</span>
    `;
    selectAll.id = `select-all_${coleccion.categoria}`;
    selectAll.className = 'w-select_select-all';

    selectAll.addEventListener('click', () => {
        const allFichas = Array.from(document.querySelectorAll(`#pictures-container_${coleccion.categoria} .words-selection_picture-box`));
        const allSelected = allFichas.every(f => f.classList.contains('ficha-seleccionada'));

        if (allSelected) {
            allFichas.forEach(deseleccionarFicha);
        } else {
            allFichas.forEach(seleccionarFicha);
        }

        actualizarContadorSeleccionadas();
        actualizarSelectAllState(coleccion.categoria);
    });

    headerWrapper.appendChild(selectAll);
}

function generarPicsContainer(coleccion) {
    const picsContainer = document.createElement('div');
    picsContainer.className = 'words-selection_pictures-container';
    picsContainer.id = `pictures-container_${coleccion.categoria}`;
    mainContainer.appendChild(picsContainer);
};

function generarFichas(coleccion) {
    const picsContainer = document.getElementById(`pictures-container_${coleccion.categoria}`);
    coleccion.palabras.forEach(palabra => {
        const ficha = document.createElement('div');
        ficha.className = 'words-selection_picture-box';
        ficha.id = `${coleccion.categoria}_${palabra.name}`;
        ficha.innerHTML = `
        <div class="words-selection_tick-box">
            <img src="./img/icons/tick.png" class="w-select_tick oculto">
        </div>
        <img src="./img/word-categories/${coleccion.categoria}/${palabra.name}.${palabra.ext}" class="w-select_img">
        <h4>${palabra.name.toUpperCase().replace('-', ' ')}</h4>
        `

        picsContainer.appendChild(ficha);
        todasLasFichas.push(ficha);
    });
};

//######################### SELECCIÓN DE FICHAS ############################################

todasLasFichas.forEach(ficha => {
    ficha.addEventListener('click', ()=> {
        const isSelected = ficha.classList.contains('ficha-seleccionada');

        if (isSelected) {
            deseleccionarFicha(ficha);
        } else {
            seleccionarFicha(ficha);
        }

        actualizarContadorSeleccionadas();

        const categoria = ficha.id.split('_')[0];
        actualizarSelectAllState(categoria);
    });
});

function seleccionarFicha(ficha) {
    if (!fichasSeleccionadas.includes(ficha)) {
        fichasSeleccionadas.push(ficha);
    }

    ficha.classList.add('ficha-seleccionada');
    ficha.querySelector('.words-selection_tick-box img').classList.remove('oculto');
}

function deseleccionarFicha(ficha) {
    eliminarElementoDeLista(ficha, fichasSeleccionadas);
    ficha.classList.remove('ficha-seleccionada');
    ficha.querySelector('.words-selection_tick-box img').classList.add('oculto');
}

function actualizarContadorSeleccionadas() {
    mensajePalabrasSeleccionadas.innerHTML = `${fichasSeleccionadas.length} words selected`;
    updateFinishButton();
}

function updateFinishButton() {
    const selectedCount = fichasSeleccionadas.length;
    btnFinalizarSeleccion.disabled = selectedCount < 12;
    btnFinalizarSeleccion.style.opacity = selectedCount < 12 ? '0.5' : '1';
    btnFinalizarSeleccion.title = selectedCount < 12 ? 'Please select 12 or more words' : '';
}

function actualizarSelectAllState(categoria) {
    const allFichas = Array.from(document.querySelectorAll(`#pictures-container_${categoria} .words-selection_picture-box`));
    const selectAllSpan = document.getElementById(`select-all_${categoria}`);
    const tickImg = selectAllSpan?.querySelector('.words-selection_tick-box img');

    if (!tickImg) return;

    const allSelected = allFichas.length > 0 && allFichas.every(f => f.classList.contains('ficha-seleccionada'));
    if (allSelected) {
        tickImg.classList.remove('oculto');
    } else {
        tickImg.classList.add('oculto');
    }
}

function eliminarElementoDeLista(elemento, lista) {
    const indice = lista.indexOf(elemento);
    if (indice !== -1) {
        lista.splice(indice, 1);
    }
};

//######################### BOTÓN DE SUBIR ARRIBA ############################################

const botonSubirArriba = document.createElement('div');
botonSubirArriba.id = 'w-select_btn-subir-arriba';
botonSubirArriba.innerHTML = `
    <i class="fa-solid fa-circle-chevron-up"></i>
`;
mainContainer.appendChild(botonSubirArriba);

function mostrarBoton() {
    if(mainElement.scrollTop > 1000) {
        botonSubirArriba.style.display = "block";
    } else {
        botonSubirArriba.style.display = "none";
    }
}

mainElement.addEventListener('scroll', mostrarBoton);

function subirArriba() {
    mainElement.scrollTop = 0;
    
}

botonSubirArriba.addEventListener('click', subirArriba);


//######################### BOTÓN DE FINALIZAR SELECCIÓN ############################################
const btnFinalizarSeleccion = document.getElementById('w-select_finish-selection');
btnFinalizarSeleccion.addEventListener('click', () => {
    if (btnFinalizarSeleccion.disabled) {
        alert('Please select 12 or more words');
        return;
    }

    const palabrasSeleccionadas = fichasSeleccionadas.map(ficha => {
        const [categoria, palabraName] = ficha.id.split('_');
        const coleccion = colecciones.find(c => c.categoria === categoria);
        const palabra = coleccion.palabras.find(p => p.name === palabraName);
        return {
            word: palabraName,
            category: categoria,
            image: `./img/word-categories/${categoria}/${palabra.name}.${palabra.ext}`
        };
    });
    sessionStorage.setItem('selectedWords', JSON.stringify(palabrasSeleccionadas));
    window.location.href = 'game-settings.html';
});

//######################### CHEQUEO DE PALABRAS SELECCIONADAS AL CARGAR ############################################
window.addEventListener('pageshow', () => {
    const selectedWords = JSON.parse(sessionStorage.getItem('selectedWords')) || [];
    console.log('Selected words from sessionStorage:', selectedWords);
    selectedWords.forEach(item => {
        const imagePath = item.image;
        const parts = imagePath.split('/');
        const categoria = parts[3];  // Corregido: parts[3] es la categoría real
        const fichaId = `${categoria}_${item.word}`;
        console.log('Looking for ficha with ID:', fichaId);
        const ficha = document.getElementById(fichaId);
        if (ficha) {
            seleccionarFicha(ficha);
            console.log('Selected ficha:', fichaId);
        } else {
            console.log('Ficha not found:', fichaId);
        }
    });
    actualizarContadorSeleccionadas();
    colecciones.forEach(col => {
        actualizarSelectAllState(col.categoria);
    });
    updateFinishButton();
});

