/**
 * Sudoku Solver - Application Logic
 * 
 * This file contains all app configuration, state management,
 * UI rendering, and event handling.
 * 
 * Uses an Iterative Constraint Propagation (ICP) solver inspired by
 * the Tiny Recursive Model's approach of iterative refinement.
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

/** Difficulty settings: number of clues to remove from a full board */
const DIFFICULTY = {
    Easy: 30,
    Medium: 45,
    Hard: 54,
    Expert: 60,
    Custom: 0  // Empty board for user input
};

/** Animation delay in milliseconds between solve steps */
const SOLVE_DELAY_MS = 20;

/** SVG Icons (inline for offline support, consistent across all browsers) */
const ICONS = {
    sparkles: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon">
        <path fill-rule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036a2.63 2.63 0 0 0 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258a2.63 2.63 0 0 0-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.63 2.63 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.63 2.63 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5Z" clip-rule="evenodd"/>
    </svg>`,
    
    play: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon">
        <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd"/>
    </svg>`,
    
    stop: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon">
        <path fill-rule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clip-rule="evenodd"/>
    </svg>`,
    
    reset: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon">
        <path fill-rule="evenodd" d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z" clip-rule="evenodd"/>
    </svg>`,
    
    trash: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon">
        <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clip-rule="evenodd"/>
    </svg>`,
    
    pencil: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon">
        <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z"/>
        <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z"/>
    </svg>`,
    
    clock: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon">
        <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clip-rule="evenodd"/>
    </svg>`
};

// =============================================================================
// STATE
// =============================================================================

let initialBoard = Array(81).fill(0);  // Original puzzle (locked cells)
let currentBoard = Array(81).fill(0);  // Current game state
let selectedIndex = null;              // User-selected cell
let activeModelIndex = null;           // Cell being solved (for animation)
let difficulty = 'Easy';               // Current difficulty
let isSolved = false;                  // Puzzle completion state
let isSolving = false;                 // Solver running state
let timeElapsed = 0;                   // Timer in milliseconds
let solvingCancelled = false;          // Flag to cancel solving
let timerInterval = null;              // Timer interval reference
let useBruteForceSolver = false;       // Solver type: false=ICP, true=brute-force

// =============================================================================
// DOM REFERENCES
// =============================================================================

let gridEl, statusEl, controlsEl, numberpadEl, difficultySelect;
let solverToggleICP, solverToggleBrute;
let cells = [];  // Array of 81 cell DOM elements

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize the application when DOM is ready
 */
function init() {
    // Get DOM references
    gridEl = document.getElementById('grid');
    statusEl = document.getElementById('status');
    controlsEl = document.getElementById('controls');
    numberpadEl = document.getElementById('numberpad');
    difficultySelect = document.getElementById('difficulty');
    solverToggleICP = document.getElementById('solver-icp');
    solverToggleBrute = document.getElementById('solver-brute');
    
    // Set header icon
    document.getElementById('header-icon').innerHTML = ICONS.sparkles;
    
    // Initialize grid cells
    initGrid();
    
    // Initialize number pad
    initNumberPad();
    
    // Initialize controls
    initControls();
    
    // Initialize difficulty selector
    initDifficultySelector();
    
    // Initialize solver toggle
    initSolverToggle();
    
    // Add keyboard handler
    document.addEventListener('keydown', handleKeyDown);
    
    // Start a new game
    startNewGame('Easy');
}

/**
 * Initialize solver toggle buttons
 */
function initSolverToggle() {
    solverToggleICP.addEventListener('click', () => {
        if (isSolving) return; // Don't change while solving
        useBruteForceSolver = false;
        solverToggleICP.classList.add('active');
        solverToggleBrute.classList.remove('active');
    });
    
    solverToggleBrute.addEventListener('click', () => {
        if (isSolving) return; // Don't change while solving
        useBruteForceSolver = true;
        solverToggleBrute.classList.add('active');
        solverToggleICP.classList.remove('active');
    });
}

/**
 * Create the 81 grid cells (called once on load)
 */
function initGrid() {
    gridEl.innerHTML = '';
    cells = [];
    
    for (let i = 0; i < 81; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        
        // Add click handler
        cell.addEventListener('click', () => handleCellClick(i));
        
        gridEl.appendChild(cell);
        cells.push(cell);
    }
}

/**
 * Initialize the number pad buttons
 */
function initNumberPad() {
    numberpadEl.innerHTML = '';
    
    // Create buttons 1-9
    for (let num = 1; num <= 9; num++) {
        const btn = document.createElement('button');
        btn.className = 'numpad-btn';
        btn.textContent = num;
        btn.addEventListener('click', () => handleInput(num));
        numberpadEl.appendChild(btn);
    }
    
    // Create clear button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'numpad-btn numpad-clear';
    clearBtn.textContent = 'CLEAR';
    clearBtn.addEventListener('click', () => handleInput(0));
    numberpadEl.appendChild(clearBtn);
}

/**
 * Initialize control buttons
 */
function initControls() {
    controlsEl.innerHTML = `
        <button id="btn-reset" class="control-btn">
            ${ICONS.trash}
            <span>Reset</span>
        </button>
        <button id="btn-new" class="control-btn">
            ${ICONS.reset}
            <span>New</span>
        </button>
        <button id="btn-solve" class="control-btn control-btn-primary">
            ${ICONS.play}
            <span>Solve</span>
        </button>
    `;
    
    document.getElementById('btn-reset').addEventListener('click', clearUserInputs);
    document.getElementById('btn-new').addEventListener('click', () => startNewGame(difficulty));
    document.getElementById('btn-solve').addEventListener('click', deployModel);
}

/**
 * Initialize difficulty selector
 */
function initDifficultySelector() {
    difficultySelect.innerHTML = '';
    
    Object.keys(DIFFICULTY).forEach(d => {
        const option = document.createElement('option');
        option.value = d;
        option.textContent = d;
        difficultySelect.appendChild(option);
    });
    
    difficultySelect.addEventListener('change', (e) => {
        startNewGame(e.target.value);
    });
}

// =============================================================================
// GAME LOGIC
// =============================================================================

/**
 * Start a new game with the specified difficulty
 */
function startNewGame(diff) {
    // Stop any ongoing solving
    solvingCancelled = true;
    stopTimer();
    
    // Reset state
    isSolved = false;
    isSolving = false;
    timeElapsed = 0;
    selectedIndex = null;
    activeModelIndex = null;
    difficulty = diff;
    
    // Update difficulty selector
    difficultySelect.value = diff;
    
    // Generate puzzle
    const cluesToRemove = DIFFICULTY[diff];
    const newBoard = generateSudoku(cluesToRemove);
    initialBoard = [...newBoard];
    currentBoard = [...newBoard];
    
    // Update UI
    updateAllCells();
    updateStatus();
    updateButtons();
    updateNumberPadVisibility();
}

/**
 * Clear user inputs and reset to initial board
 */
function clearUserInputs() {
    solvingCancelled = true;
    stopTimer();
    
    isSolving = false;
    activeModelIndex = null;
    currentBoard = [...initialBoard];
    isSolved = false;
    timeElapsed = 0;
    
    updateAllCells();
    updateStatus();
    updateButtons();
}

/**
 * Deploy the selected solver (ICP or brute-force)
 */
async function deployModel() {
    if (isSolved) return;
    
    // Toggle solving (stop if already running)
    if (isSolving) {
        solvingCancelled = true;
        isSolving = false;
        activeModelIndex = null;
        stopTimer();
        updateAllCells();
        updateStatus();
        updateButtons();
        return;
    }
    
    // Validation for Custom Mode
    if (difficulty === 'Custom') {
        const conflicts = getConflicts(currentBoard);
        if (conflicts.length > 0) {
            alert("The board contains conflicts. Please fix them before solving.");
            return;
        }
        
        // Lock user inputs as initial board
        if (initialBoard.every(n => n === 0)) {
            initialBoard = [...currentBoard];
        }
    }
    
    // Start solving
    timeElapsed = 0;
    isSolving = true;
    solvingCancelled = false;
    selectedIndex = null;
    
    updateStatus();
    updateButtons();
    updateAllCells();
    startTimer();
    
    // Create generator based on selected solver
    const generator = useBruteForceSolver 
        ? bruteSolveSudokuGenerator(currentBoard)
        : solveSudokuGenerator(currentBoard);
    
    for (const step of generator) {
        if (solvingCancelled) break;
        
        activeModelIndex = step.index;
        currentBoard[step.index] = step.value;
        
        // Update only affected cell for performance
        updateCell(step.index);
        updateStatus();
        
        // Visualization delay
        await new Promise(r => setTimeout(r, SOLVE_DELAY_MS));
    }
    
    // Finalize
    stopTimer();
    
    if (!solvingCancelled) {
        // Check if solved
        if (!currentBoard.includes(0)) {
            isSolved = true;
        }
    }
    
    activeModelIndex = null;
    isSolving = false;
    solvingCancelled = false;
    
    updateAllCells();
    updateStatus();
    updateButtons();
}

// =============================================================================
// EVENT HANDLERS
// =============================================================================

/**
 * Handle cell click
 */
function handleCellClick(index) {
    if (isSolving) return;
    
    selectedIndex = index;
    activeModelIndex = null;
    updateAllCells();
}

/**
 * Handle number input (from keyboard or number pad)
 */
function handleInput(val) {
    if (selectedIndex === null || isSolved || isSolving) return;
    
    // Only allow editing in Custom Mode
    if (difficulty !== 'Custom') return;
    
    // Cannot edit initial cells
    if (initialBoard[selectedIndex] !== 0) return;
    
    currentBoard[selectedIndex] = val;
    updateCell(selectedIndex);
    updateStatus();
}

/**
 * Handle keyboard input
 */
function handleKeyDown(e) {
    if (selectedIndex === null) return;
    
    const key = e.key;
    
    if (key >= '1' && key <= '9') {
        handleInput(parseInt(key));
    } else if (key === 'Backspace' || key === 'Delete' || key === '0') {
        handleInput(0);
    } else if (key === 'ArrowUp' && selectedIndex >= 9) {
        selectedIndex -= 9;
        updateAllCells();
    } else if (key === 'ArrowDown' && selectedIndex < 72) {
        selectedIndex += 9;
        updateAllCells();
    } else if (key === 'ArrowLeft' && selectedIndex % 9 !== 0) {
        selectedIndex -= 1;
        updateAllCells();
    } else if (key === 'ArrowRight' && selectedIndex % 9 !== 8) {
        selectedIndex += 1;
        updateAllCells();
    }
}

// =============================================================================
// RENDERING
// =============================================================================

/**
 * Update all 81 cells
 */
function updateAllCells() {
    const conflicts = getConflicts(currentBoard);
    const selectedValue = selectedIndex !== null ? currentBoard[selectedIndex] : null;
    
    for (let i = 0; i < 81; i++) {
        updateCellWithContext(i, conflicts, selectedValue);
    }
}

/**
 * Update a single cell (for performance during solve animation)
 */
function updateCell(index) {
    const conflicts = getConflicts(currentBoard);
    const selectedValue = selectedIndex !== null ? currentBoard[selectedIndex] : null;
    updateCellWithContext(index, conflicts, selectedValue);
}

/**
 * Update cell with pre-computed context
 */
function updateCellWithContext(index, conflicts, selectedValue) {
    const cell = cells[index];
    const val = currentBoard[index];
    const row = Math.floor(index / 9);
    const col = index % 9;
    
    // Determine cell states
    const isInitial = initialBoard[index] !== 0;
    const isSelected = selectedIndex === index;
    const isActiveModel = activeModelIndex === index;
    const isConflict = conflicts.includes(index);
    
    // Check if related to selected cell
    let isRelated = false;
    if (selectedIndex !== null) {
        const selRow = Math.floor(selectedIndex / 9);
        const selCol = selectedIndex % 9;
        isRelated = (
            selRow === row ||  // Same row
            selCol === col ||  // Same col
            (Math.floor(row / 3) === Math.floor(selRow / 3) &&  // Same box
             Math.floor(col / 3) === Math.floor(selCol / 3))
        );
    }
    
    const isSameValue = selectedValue !== null && selectedValue !== 0 && val === selectedValue;
    
    // Build class list
    let classes = ['cell'];
    
    // Border classes for 3x3 subgrids
    if ((col + 1) % 3 === 0 && col !== 8) classes.push('border-right-thick');
    if ((row + 1) % 3 === 0 && row !== 8) classes.push('border-bottom-thick');
    
    // State classes (priority order matters)
    if (isActiveModel) {
        classes.push('cell-active-model');
    } else if (isSelected) {
        classes.push('cell-selected');
    } else if (isConflict) {
        classes.push('cell-conflict');
    } else if (isSameValue) {
        classes.push('cell-same-value');
    } else if (isRelated) {
        classes.push('cell-related');
    }
    
    if (isInitial) {
        classes.push('cell-initial');
    } else if (isSolved && !isActiveModel) {
        classes.push('cell-solved');
    } else {
        classes.push('cell-user');
    }
    
    cell.className = classes.join(' ');
    cell.textContent = val !== 0 ? val : '';
}

/**
 * Update status message
 */
function updateStatus() {
    const timeString = formatTime(timeElapsed);
    
    if (isSolving) {
        statusEl.innerHTML = `
            <span class="status-solving">
                ${ICONS.clock}
                <span>Thinking... ${timeString}</span>
            </span>
        `;
    } else if (isSolved) {
        statusEl.innerHTML = `
            <span class="status-solved">
                ${ICONS.clock}
                <span>Solved in ${timeString}</span>
            </span>
        `;
    } else if (difficulty === 'Custom') {
        if (initialBoard.every(n => n === 0)) {
            statusEl.innerHTML = `
                <span class="status-setup">
                    ${ICONS.pencil}
                    <span>Setup: Enter your puzzle</span>
                </span>
            `;
        } else {
            statusEl.innerHTML = `<span class="status-ready">Ready to solve</span>`;
        }
    } else {
        statusEl.innerHTML = `<span class="status-ready">AI Ready</span>`;
    }
}

/**
 * Update control buttons
 */
function updateButtons() {
    const btnSolve = document.getElementById('btn-solve');
    const btnNew = document.getElementById('btn-new');
    
    // Update New button text for Custom mode
    btnNew.querySelector('span').textContent = difficulty === 'Custom' ? 'Clear' : 'New';
    
    // Update Solve button
    if (isSolved) {
        btnSolve.innerHTML = `${ICONS.sparkles}<span>Done</span>`;
        btnSolve.className = 'control-btn control-btn-done';
    } else if (isSolving) {
        btnSolve.innerHTML = `${ICONS.stop}<span>Stop</span>`;
        btnSolve.className = 'control-btn control-btn-stop';
    } else {
        btnSolve.innerHTML = `${ICONS.play}<span>Solve</span>`;
        btnSolve.className = 'control-btn control-btn-primary';
    }
}

/**
 * Show/hide number pad based on difficulty
 */
function updateNumberPadVisibility() {
    numberpadEl.style.display = difficulty === 'Custom' ? 'grid' : 'none';
}

// =============================================================================
// TIMER
// =============================================================================

function startTimer() {
    const startTime = Date.now() - timeElapsed;
    timerInterval = setInterval(() => {
        timeElapsed = Date.now() - startTime;
        updateStatus();
    }, 51);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// =============================================================================
// STARTUP
// =============================================================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
