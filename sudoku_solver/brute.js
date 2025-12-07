/**
 * BRUTE-FORCE SUDOKU SOLVER
 * A recursive backtracking algorithm to solve Sudoku.
 * 
 * This file contains the brute-force solver as an alternative to the
 * ICP (Iterative Constraint Propagation) solver in solver.js.
 * 
 * All functions are prefixed with 'brute' to avoid conflicts.
 */

/**
 * Check if placing num at board[index] is valid
 * @param {number[]} board - 81-element array representing the Sudoku grid
 * @param {number} index - Cell index (0-80)
 * @param {number} num - Number to place (1-9)
 * @returns {boolean} True if placement is valid
 */
function bruteIsValid(board, index, num) {
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
 * Solve Sudoku instantly using recursive backtracking
 * @param {number[]} board - 81-element array (0 = empty cell)
 * @returns {number[]|null} Solved board or null if no solution
 */
function bruteSolveSudoku(board) {
    const copy = [...board];

    function solve() {
        // Find first empty cell
        const emptyIndex = copy.indexOf(0);
        if (emptyIndex === -1) return true; // Solved

        // Try digits 1-9
        for (let num = 1; num <= 9; num++) {
            if (bruteIsValid(copy, emptyIndex, num)) {
                copy[emptyIndex] = num;
                if (solve()) return true;
                copy[emptyIndex] = 0; // Backtrack
            }
        }
        return false;
    }

    if (solve()) return copy;
    return null;
}

/**
 * Generator-based solver for step-by-step visualization
 * @param {number[]} board - 81-element array (0 = empty cell)
 * @yields {{index: number, value: number}} Each step: cell index and value placed
 * @returns {boolean} True if solved successfully
 */
function* bruteSolveSudokuGenerator(board) {
    const copy = [...board];

    function* solve() {
        const emptyIndex = copy.indexOf(0);
        if (emptyIndex === -1) return true; // Solved

        for (let num = 1; num <= 9; num++) {
            if (bruteIsValid(copy, emptyIndex, num)) {
                copy[emptyIndex] = num;
                yield { index: emptyIndex, value: num };

                if (yield* solve()) return true;

                // Backtrack
                copy[emptyIndex] = 0;
                yield { index: emptyIndex, value: 0 };
            }
        }
        return false;
    }

    return yield* solve();
}
