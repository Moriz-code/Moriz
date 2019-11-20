'use strict'
//timer
var gTimerInterval = null;
var seconds = 100;

//globals vars
var gBoard;

var gLevel = {
    SIZE: 4,
    MINES: 2,
    REGULARCELLS: 14,
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

// called when page loads
function initGame() {
    gBoard = buildBoard(gLevel);
    renderBoard();
}

// Builds the board - V
// Set mines at random locations Call setMinesNegsCount()
// Return the created board
function buildBoard(gLevel) {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            };
            board[i][j] = cell;
        }
    }
    // console.log(board)
    return board;
}

function locateRndMinesOnBoard() {
    var numsOfMines = gLevel.MINES
    for (var i = 0; i < numsOfMines; i++) {
        var firstRndNum = getRandomIntInclusive(0, gLevel.SIZE - 1)
        var sectRndNum = getRandomIntInclusive(0, gLevel.SIZE - 1)
        gBoard[firstRndNum][sectRndNum].isMine = true
    }
    renderBoard();
}

// Render the board as a <table> to the page
function renderBoard() {
    var minesDisplay;
    var strHTML = ' ';
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];
            var className = 'cell '
            if (cell.isShown) {
                minesDisplay = cell.minesAroundCount
                if (cell.isMine) {
                    minesDisplay = '💣';
                    // className += (cell.isMine) ? 'mine ' : '';
                }
            } else {
                minesDisplay = "";
            }
            className += (cell.isMarked) ? 'marked ' : '';

            strHTML += `\t<td
            data-i=${i}  data-j=${j}
            class="${className}"oncontextmenu="cellMarked(this)" onclick="cellClicked(event,${i},${j})">${minesDisplay}</td>\n`
        }
        strHTML += '</tr>\n'
    }

    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
    checkGameOver();
}

//checking per cell
function checkMinePerCell() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            gBoard[i][j].minesAroundCount = setMinesNegsCount(i, j)
        }
    }
    renderBoard();
}

//Count mines around each cell and set the cell's minesAroundCount. 
function setMinesNegsCount(posI, posJ) {
    var MinesCounter = 0;
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            if (i === posI && j === posJ) continue;
            if (gBoard[i][j].isMine)
                MinesCounter++
        }
    }
    return MinesCounter;
}


// Called when a cell (td) is clicked 
function cellClicked(elCell, i, j) {
    if (!gGame.isOn) {
        //start game!
        gGame.isOn = true;
        startCountDown();
        locateRndMinesOnBoard();
        checkMinePerCell();
        renderBoard();
    }

    // console.log(elCell)
    var currentCell = gBoard[i][j]
    currentCell.isShown = true;
    gGame.shownCount++

    //if you clicked on a mine - game over! 
    if (currentCell.isMine) {
        gameOver();
    }
    renderBoard();
}


// Called on right click to mark a cell (suspected to be a mine) Search the web (and implement) how to hide the context menu on right clic
function cellMarked(elCell) {
    var posI = elCell.dataset.i;
    var posJ = elCell.dataset.j;

    //if the cell is out there
    if (gBoard[posI][posJ].isShown) return

    //kind of toggle
    if (gBoard[posI][posJ].isMarked) {
        gGame.markedCount--
        gBoard[posI][posJ].isMarked = false
    } else {
        gBoard[posI][posJ].isMarked = true
        gGame.markedCount++
    }
    renderBoard();
}

// Game ends when all mines are marked and all the other cells are shown 
function checkGameOver() {
    //if all the mark equal to mines and 
    if (gGame.markedCount === gLevel.MINES && gGame.shownCount === gLevel.REGULARCELLS) {
        gameOver('Win');
        console.log('win')
    }
}

//game over function that getting win or lose perameter
function gameOver(winOrLose) {
    var elH1 = document.querySelector('h1')
    if (winOrLose === 'Win') {
        elH1.innerText = 'congratulations! you won :)'
    } else {
        elH1.innerText = 'loser.. you should try fortnite '
    }
    clearInterval(gTimerInterval)
    var display = document.querySelector('.timer')
    display.innerText = "";

}

//countDown Timer
function startCountDown() {
    var timer = 60 * 2,
        minutes, seconds;
        
        gTimerInterval = setInterval(function () {
        var display = document.querySelector('.timer')
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.innerText = minutes + ":" + seconds;

        if (--timer < 0) {
            display = 'Time is over';
            gameOver();
        }
    }, 100);
}