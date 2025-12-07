/**
 * ITERATIVE CONSTRAINT PROPAGATION SOLVER (ICP)
 * 
 * A TRM-inspired Sudoku solver that uses iterative refinement:
 * - Maintains candidate sets for each cell (like TRM's latent state z)
 * - Recursively refines candidates through constraint propagation (like TRM's supervision steps)
 * - Uses naked singles, hidden singles, and constraint elimination
 * - Falls back to minimal backtracking only when logic alone is insufficient
 * 
 * Inspired by the Tiny Recursive Model's approach of iteratively improving
 * answers through recursive refinement, but implemented as constraint logic
 * rather than neural network inference.
 */

// =============================================================================
// CANDIDATE MANAGEMENT
// =============================================================================

/**
 * Initialize candidate sets for all cells
 * Each cell has a Set of possible values (1-9), or empty if cell is filled
 * @param {number[]} board - 81-element array (0 = empty)
 * @returns {Set<number>[]} Array of 81 Sets
 */
function initCandidates(board) {
    const candidates = [];
    
    for (let i = 0; i < 81; i++) {
        if (board[i] !== 0) {
            // Cell is filled - no candidates
            candidates.push(new Set());
        } else {
            // Cell is empty - start with all possibilities
            candidates.push(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]));
        }
    }
    
    // Initial constraint propagation - eliminate based on existing values
    for (let i = 0; i < 81; i++) {
        if (board[i] !== 0) {
            eliminateFromPeers(candidates, i, board[i]);
        }
    }
    
    return candidates;
}

/**
 * Get all peer indices (same row, column, or box) for a cell
 * @param {number} index - Cell index (0-80)
 * @returns {number[]} Array of peer indices
 */
function getPeers(index) {
    const row = Math.floor(index / 9);
    const col = index % 9;
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    const peers = new Set();
    
    // Same row
    for (let c = 0; c < 9; c++) {
        peers.add(row * 9 + c);
    }
    
    // Same column
    for (let r = 0; r < 9; r++) {
        peers.add(r * 9 + col);
    }
    
    // Same 3x3 box
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            peers.add((boxRow + r) * 9 + (boxCol + c));
        }
    }
    
    // Remove self
    peers.delete(index);
    
    return Array.from(peers);
}

// Pre-compute peers for all cells (optimization)
const PEERS = [];
for (let i = 0; i < 81; i++) {
    PEERS.push(getPeers(i));
}

/**
 * Eliminate a value from all peers of a cell
 * @param {Set<number>[]} candidates - Candidate sets
 * @param {number} index - Cell index that was assigned
 * @param {number} value - Value to eliminate from peers
 */
function eliminateFromPeers(candidates, index, value) {
    for (const peer of PEERS[index]) {
        candidates[peer].delete(value);
    }
}

// =============================================================================
// CONSTRAINT PROPAGATION STRATEGIES
// =============================================================================

/**
 * Naked Singles: If a cell has only one candidate, assign it
 * @param {number[]} board - Current board state
 * @param {Set<number>[]} candidates - Candidate sets
 * @returns {{index: number, value: number}|null} Assignment made, or null
 */
function findNakedSingle(board, candidates) {
    for (let i = 0; i < 81; i++) {
        if (board[i] === 0 && candidates[i].size === 1) {
            const value = candidates[i].values().next().value;
            return { index: i, value };
        }
    }
    return null;
}

/**
 * Hidden Singles: If a value can only go in one cell within a unit, assign it
 * @param {number[]} board - Current board state
 * @param {Set<number>[]} candidates - Candidate sets
 * @returns {{index: number, value: number}|null} Assignment made, or null
 */
function findHiddenSingle(board, candidates) {
    // Check rows
    for (let row = 0; row < 9; row++) {
        const result = findHiddenSingleInUnit(board, candidates, getRowIndices(row));
        if (result) return result;
    }
    
    // Check columns
    for (let col = 0; col < 9; col++) {
        const result = findHiddenSingleInUnit(board, candidates, getColIndices(col));
        if (result) return result;
    }
    
    // Check boxes
    for (let box = 0; box < 9; box++) {
        const result = findHiddenSingleInUnit(board, candidates, getBoxIndices(box));
        if (result) return result;
    }
    
    return null;
}

function findHiddenSingleInUnit(board, candidates, indices) {
    for (let num = 1; num <= 9; num++) {
        let possibleCells = [];
        
        for (const idx of indices) {
            if (board[idx] === 0 && candidates[idx].has(num)) {
                possibleCells.push(idx);
            }
        }
        
        // If only one cell can hold this number, it's a hidden single
        if (possibleCells.length === 1) {
            return { index: possibleCells[0], value: num };
        }
    }
    
    return null;
}

function getRowIndices(row) {
    const indices = [];
    for (let c = 0; c < 9; c++) indices.push(row * 9 + c);
    return indices;
}

function getColIndices(col) {
    const indices = [];
    for (let r = 0; r < 9; r++) indices.push(r * 9 + col);
    return indices;
}

function getBoxIndices(box) {
    const indices = [];
    const startRow = Math.floor(box / 3) * 3;
    const startCol = (box % 3) * 3;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            indices.push((startRow + r) * 9 + (startCol + c));
        }
    }
    return indices;
}

// =============================================================================
// ITERATIVE REFINEMENT SOLVER (TRM-Inspired)
// =============================================================================

/**
 * Apply one refinement step - try constraint propagation strategies
 * Like TRM's single supervision step that improves the answer
 * @param {number[]} board - Current board state
 * @param {Set<number>[]} candidates - Candidate sets
 * @returns {{index: number, value: number}|null} Assignment made, or null if no progress
 */
function refineStep(board, candidates) {
    // Strategy 1: Naked singles (most direct)
    let result = findNakedSingle(board, candidates);
    if (result) return result;
    
    // Strategy 2: Hidden singles (requires unit analysis)
    result = findHiddenSingle(board, candidates);
    if (result) return result;
    
    return null;
}

/**
 * Apply an assignment to the board and propagate constraints
 * @param {number[]} board - Board to modify
 * @param {Set<number>[]} candidates - Candidates to modify
 * @param {number} index - Cell index
 * @param {number} value - Value to assign
 * @returns {boolean} True if assignment is valid (no empty candidate sets created)
 */
function applyAssignment(board, candidates, index, value) {
    board[index] = value;
    candidates[index].clear();
    eliminateFromPeers(candidates, index, value);
    
    // Check for contradictions (empty candidate set for unfilled cell)
    for (let i = 0; i < 81; i++) {
        if (board[i] === 0 && candidates[i].size === 0) {
            return false; // Contradiction detected
        }
    }
    
    return true;
}

/**
 * Check if the board is solved
 * @param {number[]} board - Board state
 * @returns {boolean} True if no empty cells
 */
function checkSolved(board) {
    return !board.includes(0);
}

/**
 * Check if placing num at board[index] is valid
 * @param {number[]} board - 81-element array
 * @param {number} index - Cell index (0-80)
 * @param {number} num - Number to place (1-9)
 * @returns {boolean} True if placement is valid
 */
function isValid(board, index, num) {
    const row = Math.floor(index / 9);
    const col = index % 9;

    // Check Row
    for (let c = 0; c < 9; c++) {
        if (board[row * 9 + c] === num) return false;
    }

    // Check Column
    for (let r = 0; r < 9; r++) {
        if (board[r * 9 + col] === num) return false;
    }

    // Check 3x3 Box
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (board[(startRow + r) * 9 + (startCol + c)] === num) return false;
        }
    }

    return true;
}

/**
 * Solve Sudoku using iterative constraint propagation with minimal backtracking
 * Inspired by TRM's recursive refinement approach
 * @param {number[]} board - 81-element array (0 = empty cell)
 * @returns {number[]|null} Solved board or null if no solution
 */
function solveSudoku(board) {
    const copy = [...board];
    const candidates = initCandidates(copy);
    
    // Check for initial contradictions
    for (let i = 0; i < 81; i++) {
        if (copy[i] === 0 && candidates[i].size === 0) {
            return null; // Unsolvable
        }
    }
    
    if (solveWithRefinement(copy, candidates)) {
        return copy;
    }
    return null;
}

/**
 * Core solving loop: iterative refinement with backtracking fallback
 * @param {number[]} board - Board to solve (modified in place)
 * @param {Set<number>[]} candidates - Candidate sets (modified in place)
 * @returns {boolean} True if solved
 */
function solveWithRefinement(board, candidates) {
    // Phase 1: Iterative constraint propagation (like TRM supervision steps)
    // Keep refining until no more progress can be made
    let progress = true;
    while (progress) {
        progress = false;
        
        const assignment = refineStep(board, candidates);
        if (assignment) {
            const valid = applyAssignment(board, candidates, assignment.index, assignment.value);
            if (!valid) {
                return false; // Contradiction - backtrack
            }
            progress = true;
        }
    }
    
    // Check if solved
    if (checkSolved(board)) {
        return true;
    }
    
    // Phase 2: Backtracking with MRV heuristic (Minimum Remaining Values)
    // Choose the cell with fewest candidates (like TRM focusing on uncertain positions)
    let minCandidates = 10;
    let bestCell = -1;
    
    for (let i = 0; i < 81; i++) {
        if (board[i] === 0 && candidates[i].size > 0 && candidates[i].size < minCandidates) {
            minCandidates = candidates[i].size;
            bestCell = i;
        }
    }
    
    if (bestCell === -1) {
        return false; // No valid moves - unsolvable state
    }
    
    // Try each candidate value
    const valuesToTry = Array.from(candidates[bestCell]);
    
    for (const value of valuesToTry) {
        // Create copies for backtracking
        const boardCopy = [...board];
        const candidatesCopy = candidates.map(s => new Set(s));
        
        // Try assignment
        const valid = applyAssignment(boardCopy, candidatesCopy, bestCell, value);
        if (valid && solveWithRefinement(boardCopy, candidatesCopy)) {
            // Success - copy solution back
            for (let i = 0; i < 81; i++) {
                board[i] = boardCopy[i];
                candidates[i] = candidatesCopy[i];
            }
            return true;
        }
    }
    
    return false; // All candidates failed
}

// =============================================================================
// GENERATOR FOR STEP-BY-STEP VISUALIZATION
// =============================================================================

/**
 * Generator-based solver for step-by-step visualization
 * Yields each assignment as it's made
 * @param {number[]} board - 81-element array (0 = empty cell)
 * @yields {{index: number, value: number}} Each step: cell index and value placed
 * @returns {boolean} True if solved successfully
 */
function* solveSudokuGenerator(board) {
    const copy = [...board];
    const candidates = initCandidates(copy);
    
    // Check for initial contradictions
    for (let i = 0; i < 81; i++) {
        if (copy[i] === 0 && candidates[i].size === 0) {
            return false;
        }
    }
    
    const result = yield* solveWithRefinementGenerator(copy, candidates);
    return result;
}

function* solveWithRefinementGenerator(board, candidates) {
    // Phase 1: Iterative constraint propagation
    let progress = true;
    while (progress) {
        progress = false;
        
        const assignment = refineStep(board, candidates);
        if (assignment) {
            const valid = applyAssignment(board, candidates, assignment.index, assignment.value);
            if (!valid) {
                return false;
            }
            yield { index: assignment.index, value: assignment.value };
            progress = true;
        }
    }
    
    if (checkSolved(board)) {
        return true;
    }
    
    // Phase 2: Backtracking with MRV
    let minCandidates = 10;
    let bestCell = -1;
    
    for (let i = 0; i < 81; i++) {
        if (board[i] === 0 && candidates[i].size > 0 && candidates[i].size < minCandidates) {
            minCandidates = candidates[i].size;
            bestCell = i;
        }
    }
    
    if (bestCell === -1) {
        return false;
    }
    
    const valuesToTry = Array.from(candidates[bestCell]);
    
    for (const value of valuesToTry) {
        const boardCopy = [...board];
        const candidatesCopy = candidates.map(s => new Set(s));
        
        const valid = applyAssignment(boardCopy, candidatesCopy, bestCell, value);
        if (!valid) continue;
        
        yield { index: bestCell, value: value };
        
        const result = yield* solveWithRefinementGenerator(boardCopy, candidatesCopy);
        
        if (result) {
            for (let i = 0; i < 81; i++) {
                board[i] = boardCopy[i];
                candidates[i] = candidatesCopy[i];
            }
            return true;
        }
        
        // Backtrack - yield the undo
        yield { index: bestCell, value: 0 };
    }
    
    return false;
}

// =============================================================================
// PUZZLE GENERATION
// =============================================================================

/**
 * Generate a Sudoku puzzle by creating a solved board and removing clues
 * @param {number} cluesToRemove - Number of cells to remove (higher = harder)
 * @returns {number[]} 81-element puzzle array (0 = empty cell)
 */
function generateSudoku(cluesToRemove) {
    // Handle empty board (Custom mode)
    if (cluesToRemove === 0) {
        return Array(81).fill(0);
    }

    // 1. Start with empty board
    const board = Array(81).fill(0);

    // 2. Fill diagonal 3x3 boxes (independent of each other)
    function fillBox(startRow, startCol) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        // Fisher-Yates shuffle
        for (let i = nums.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nums[i], nums[j]] = [nums[j], nums[i]];
        }

        let idx = 0;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                board[(startRow + r) * 9 + (startCol + c)] = nums[idx++];
            }
        }
    }

    fillBox(0, 0);
    fillBox(3, 3);
    fillBox(6, 6);

    // 3. Solve the rest to get a complete valid board
    const solved = solveSudoku(board);
    if (!solved) throw new Error("Failed to generate base board");

    // 4. Remove numbers based on difficulty
    const puzzle = [...solved];
    let attempts = 0;

    while (attempts < cluesToRemove) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        const index = row * 9 + col;

        if (puzzle[index] !== 0) {
            puzzle[index] = 0;
            attempts++;
        }
    }

    return puzzle;
}

// =============================================================================
// CONFLICT DETECTION (for UI feedback)
// =============================================================================

/**
 * Find all cells that have conflicts (duplicate values in row/col/box)
 * @param {number[]} board - 81-element array
 * @returns {number[]} Array of conflicting cell indices
 */
function getConflicts(board) {
    const conflicts = new Set();

    function checkGroup(indices) {
        const seen = new Map();
        indices.forEach(idx => {
            const val = board[idx];
            if (val !== 0) {
                if (seen.has(val)) {
                    conflicts.add(idx);
                    conflicts.add(seen.get(val));
                } else {
                    seen.set(val, idx);
                }
            }
        });
    }

    // Check Rows
    for (let r = 0; r < 9; r++) {
        checkGroup(getRowIndices(r));
    }

    // Check Columns
    for (let c = 0; c < 9; c++) {
        checkGroup(getColIndices(c));
    }

    // Check 3x3 Boxes
    for (let b = 0; b < 9; b++) {
        checkGroup(getBoxIndices(b));
    }

    return Array.from(conflicts);
}
