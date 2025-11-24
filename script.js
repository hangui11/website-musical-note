// --- Game State Variables ---
let currentPage = 'welcome-page';
let microphoneAccessGranted = false; 
let game1Notes = 0;
let game1Seconds = 0;
let numGrids = 0;

let countdownTimer;
let imageTimer;
let gridTimer;
let gridLabelTimer;

let allImages = []; 
let notesToShow = [];
let currentNoteIndex = 0;
let gridsToShow = [];
let currentGridIndex = 0;
let currentGridLabelIndex = 0;

let game2_grid_time = 25000; // Total time per grid in ms
let game2_grid_image = 3000; // Time per image highlight in ms

const music = document.getElementById('bg-music');
let music_playing = true;

// --- Utility Functions ---

function loadImages() {
    // Static list of notes and expected spoken phrases
    allImages = [
        {path: 'images/Clave de Sol/do_1...png', expected: 'clave de sol do'},
        {path: 'images/Clave de Sol/do_1..png', expected: 'clave de sol do'},
        {path: 'images/Clave de Sol/do_1.png', expected: 'clave de sol do'},
        {path: 'images/Clave de Sol/fa_4..png', expected: 'clave de sol fa'},
        {path: 'images/Clave de Sol/fa_4.png', expected: 'clave de sol fa'},
        {path: 'images/Clave de Sol/la_6..png', expected: 'clave de sol la'},
        {path: 'images/Clave de Sol/la_6.png', expected: 'clave de sol la'},
        {path: 'images/Clave de Sol/mi_3..png', expected: 'clave de sol mi'},
        {path: 'images/Clave de Sol/mi_3.png', expected: 'clave de sol mi'},
        {path: 'images/Clave de Sol/re_2..png', expected: 'clave de sol re'},
        {path: 'images/Clave de Sol/re_2.png', expected: 'clave de sol re'},
        {path: 'images/Clave de Sol/si_7..png', expected: 'clave de sol si'},
        {path: 'images/Clave de Sol/si_7.png', expected: 'clave de sol si'},
        {path: 'images/Clave de Sol/sol_5..png', expected: 'clave de sol sol'},
        {path: 'images/Clave de Sol/sol_5.png', expected: 'clave de sol sol'},

        {path: 'images/Clave de Fa/do_1...png', expected: 'clave de fa do'},
        {path: 'images/Clave de Fa/do_1..png', expected: 'clave de fa do'},
        {path: 'images/Clave de Fa/do_1.png', expected: 'clave de fa do'},
        {path: 'images/Clave de Fa/fa_4...png', expected: 'clave de fa fa'},
        {path: 'images/Clave de Fa/fa_4..png', expected: 'clave de fa fa'},
        {path: 'images/Clave de Fa/la_6...png', expected: 'clave de fa la'},
        {path: 'images/Clave de Fa/la_6..png', expected: 'clave de fa la'},
        {path: 'images/Clave de Fa/mi_3...png', expected: 'clave de fa mi'},
        {path: 'images/Clave de Fa/mi_3..png', expected: 'clave de fa mi'},
        {path: 'images/Clave de Fa/re_2...png', expected: 'clave de fa re'},
        {path: 'images/Clave de Fa/re_2..png', expected: 'clave de fa re'},
        {path: 'images/Clave de Fa/si_7...png', expected: 'clave de fa si'},
        {path: 'images/Clave de Fa/si_7..png', expected: 'clave de fa si'},
        {path: 'images/Clave de Fa/sol_5...png', expected: 'clave de fa sol'},
        {path: 'images/Clave de Fa/sol_5..png', expected: 'clave de fa sol'},
    ];
    console.log(`Loaded ${allImages.length} image variations.`);
}

/**
 * Simulates the QStackedWidget by toggling the 'active' class.
 */
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    currentPage = pageId;
}



// --- Game Flow Functions ---

function resetGame(gameType) {
    clearInterval(countdownTimer);
    clearInterval(imageTimer);
    clearInterval(gridTimer);
    clearInterval(gridLabelTimer);
    
    if (gameType === 1) {
        showPage('game1-config');
    } else {
        showPage('game2-config');
    }
}

function goToCountdown(gameType) {
    try {
        if (gameType === 1) {
            game1Notes = parseInt(document.getElementById('notes-input').value);
            game1Seconds = parseFloat(document.getElementById('seconds-input').value);
            
            if (isNaN(game1Notes) || isNaN(game1Seconds) || game1Notes <= 0 || game1Seconds < 3) {
                throw new Error("Invalid input.");
            }

        } else {
            numGrids = parseInt(document.getElementById('grids-input').value);
            if (isNaN(numGrids) || numGrids <= 0) {
                throw new Error("Invalid input.");
            }
        }
    } catch (e) {
        console.error(e);
        alert("Please enter valid positive numbers. Seconds must be at least 3.");
        return;
    }

    showPage('countdown-page');
    document.getElementById('countdown-label').textContent = "3";

    // Set up and start the global countdown timer
    let count = 3;
    document.getElementById('countdown-label').textContent = count;
    countdownTimer = setInterval(() => {
        count -= 1;
        if (count === 0) {
            clearInterval(countdownTimer);
            document.getElementById('countdown-label').textContent = "GO!";
            setTimeout(() => {
                gameType === 1 ? startGame1() : startGame2();
            }, 1000);
        } else {
            document.getElementById('countdown-label').textContent = count;
        }
    }, 1000);
}


function startGame1() {
    showPage('game1-game');
    
    notesToShow = [];
    for(let i = 0; i < game1Notes; i++) {
        notesToShow.push(allImages[Math.floor(Math.random() * allImages.length)]);
    }
    
    currentNoteIndex = 0;
    
    // Start the image cycling timer
    showNextImage();
    imageTimer = setInterval(showNextImage, game1Seconds * 1000);
}

/**
 * Advances the image and updates the expected note for the continuous recognition.
 */
function showNextImage() {
    if (currentNoteIndex >= game1Notes) {
        clearInterval(imageTimer);
        alert("Game 1 Finished!");
        return;
    }
    
    const note = notesToShow[currentNoteIndex];
    document.getElementById('game1-image').src = note.path;
    // document.getElementById('game1-note-label').textContent = "🔊 Listening..."; // Continuous mode, no 1.5s timer
    
    // *** CRITICAL: UPDATE THE TARGET NOTE ***
    currentExpectedNote = note.expected; 
    
    currentNoteIndex++; 
}

function startGame2() {
    // ... (Your existing startGame2 logic) ...
    showPage('game2-game');
    
    const noteGrid = document.getElementById('note-grid');
    noteGrid.innerHTML = '';
    for(let i = 0; i < 8; i++) {
        const gridItem = document.createElement('div');
        gridItem.classList.add('grid-item');
        gridItem.innerHTML = `<img src="" alt="Note ${i}">`;
        noteGrid.appendChild(gridItem);
    }
    
    gridsToShow = [];
    for(let i = 0; i < numGrids; i++) {
        const grid = [];
        for(let j = 0; j < 8; j++) {
            grid.push(allImages[Math.floor(Math.random() * allImages.length)]);
        }
        gridsToShow.push(grid);
    }
    
    currentGridIndex = 0;
    
    updateGridCycle();
    gridTimer = setInterval(updateGridCycle, game2_grid_time);
}

function showNextGrid() {
    // ... (Your existing showNextGrid logic) ...
    if (currentGridIndex >= numGrids) {
        clearInterval(gridTimer);
        clearInterval(gridLabelTimer);
        alert("Game 2 Finished!");
        return false;
    }
    
    const grid = gridsToShow[currentGridIndex];
    const gridItems = document.querySelectorAll('#note-grid .grid-item img');

    grid.forEach((note, i) => {
        gridItems[i].src = note.path;
    });
    
    currentGridIndex++;
    return true; 
}

function highlightNextGridLabel() {
    // ... (Your existing highlightNextGridLabel logic) ...
    const gridItems = document.querySelectorAll('#note-grid .grid-item');

    if (currentGridLabelIndex > 0) {
        gridItems[currentGridLabelIndex - 1].classList.remove('highlight');
    }

    if (currentGridLabelIndex < gridItems.length) {
        gridItems[currentGridLabelIndex].classList.add('highlight');
        currentGridLabelIndex++;
    } else {
        clearInterval(gridLabelTimer);
        gridItems[gridItems.length - 1].classList.remove('highlight');
    }
}

function updateGridCycle() {
    // ... (Your existing updateGridCycle logic) ...
    clearInterval(gridLabelTimer);
    
    if (showNextGrid()) { 
        document.querySelectorAll('#note-grid .grid-item').forEach(item => {
            item.classList.remove('highlight');
        });
        
        currentGridLabelIndex = 0;
        
        highlightNextGridLabel();
        gridLabelTimer = setInterval(highlightNextGridLabel, game2_grid_image); 
    }
}




function toggleMute() {
    if (music.muted) {
        music.muted = false;
        document.getElementById('mute-btn').textContent = '🔊'
        } else {
            music.muted = true
            document.getElementById('mute-btn').textContent = '🔇';
        }
}

function activateMusic() {
    if (music_playing && music.paused) {
        // Attempt to play only if it hasn't started and is intended to play
        music.play().catch(error => {
            console.warn("Autoplay was prevented. Music will start on first click.");
            // You can add logic here to show a "Play Music" prompt to the user
        });
    }
}


// --- Initialization ---

window.onload = () => {
    loadImages();
    // Start on the Welcome/Permission page
    showPage('main-menu'); 
};

document.addEventListener('DOMContentLoaded', () => {
    const mainMenuPage = document.getElementById('main-menu');

    // Listener for the first interaction on the main menu page
    if (mainMenuPage) {
        mainMenuPage.addEventListener('click', function handler() {
            activateMusic();
            // Remove the listener so it only fires on the first click
            mainMenuPage.removeEventListener('click', handler); 
        });
    }
});