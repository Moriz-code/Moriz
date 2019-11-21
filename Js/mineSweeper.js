'use strict'
var gStartTime;
var gTimerInterval = null;
var gMines = [];

//globals vars
var gBoard;
var gIsHint = false;

var gLevel = {
    SIZE: 4,
    MINES: 2,
    REGULARCELLS: 14,
    life: 2
}

var gGame = {
    isOn: false,
    shownCounter: 0,
    markedCount: 0,
    secsPassed: 0,
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
    return board;
}

function locateRndMinesOnBoard(exsistIcell, exsistJcell) {
    var numsOfMines = gLevel.MINES
    for (var i = 0; i < numsOfMines; i++) {
        var firstRndNum = getRandomIntInclusive(0, gLevel.SIZE - 1)
        var sectRndNum = getRandomIntInclusive(0, gLevel.SIZE - 1)

        while ((firstRndNum === exsistIcell) && (sectRndNum === exsistJcell)) {
            firstRndNum = getRandomIntInclusive(0, gLevel.SIZE - 1)
            sectRndNum = getRandomIntInclusive(0, gLevel.SIZE - 1)
            // console.log('program pick ',firstRndNum, sectRndNum,  'instead of ', exsistIcell,exsistJcell)
        }
        gBoard[firstRndNum][sectRndNum].isMine = true
        gMines.push(gBoard[firstRndNum][sectRndNum])
    }
    renderBoard();
}

// Render the board as a <table> to the page
function renderBoard() {
    var shownOnTheBoard = 0;
    var minesDisplay;
    var strHTML = ' ';
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];
            var className = 'cell '
            if (cell.isShown) {
                shownOnTheBoard++
                minesDisplay = cell.minesAroundCount
                if (cell.isMine) {
                    minesDisplay = '💣';
                    // className += (cell.isMine) ? 'mine ' : '';
                }
            } else {
                minesDisplay = "";
            }
            if (cell.isMarked) {
                minesDisplay = '🚩'
            }

            strHTML += `\t<td
            data-i=${i}  data-j=${j}
            class="${className}"oncontextmenu="cellMarked(this)" onclick="cellClicked(event,${i},${j})">${minesDisplay}</td>\n`
        }

        strHTML += '</tr>\n'
    }

    gGame.shownCounter = shownOnTheBoard;
    var lifeCounter = document.querySelector('.life')
    lifeCounter.innerText = 'Life: '
    for (var i = 0; i < gLevel.life; i++) {
        lifeCounter.innerText += '❤️'
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
    var currentCell = gBoard[i][j]

    if (currentCell.isShown || currentCell.isMarked) {
        return
    }

    var posI = i;
    var posJ = j;

    if (!gGame.isOn) {
        //start game!
        gGame.isOn = true;
        gStartTime = Date.now();
        gTimerInterval = setInterval(gameTimer, 100);
        locateRndMinesOnBoard(i, j);
        checkMinePerCell();
        renderBoard();
    }

    currentCell.isShown = true;

    //collect hints for future undo
    var hintCells = []

    //checking what cells it should present
    if (currentCell.minesAroundCount === 0 || gIsHint) {
        for (var i = posI - 1; i <= posI + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue;
            for (var j = posJ - 1; j <= posJ + 1; j++) {
                if (j < 0 || j >= gBoard[0].length) continue;
                if (i === posI && j === posJ) continue;
                //if its a regular click
                if (!gBoard[i][j].isMine && !gIsHint) {
                    gBoard[i][j].isShown = true
                }
                //if its a hint click
                if (gIsHint && gBoard[i][j].isShown === false) {
                    gBoard[i][j].isShown = true
                    hintCells.push(gBoard[i][j])
                }

            }
        }
    }

    //Undo the hints
    if (gIsHint) {
        hintCells.push(currentCell)
        setTimeout(function () {
            undoHints(hintCells);
        }, 1000)
    } else if (currentCell.isMine) {
        gLevel.life -= 1
        if (gLevel.life === 0) {
            //show all mines
            for (var i = 0; i < gMines.length; i++) {
                gMines[i].isShown = true;
            }
            gameOver();


        }
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
    if (gGame.markedCount === gLevel.MINES && gGame.shownCounter === gLevel.REGULARCELLS) {
        gameOver('Win');
 
    }
}

//game over function that getting win or lose perameter
function gameOver(winOrLose) {
    // var gBestime = localStorage.getItem('bestime');

    // //best time!
    // if (totaltime > bestime) {
    //     localStorage.setItem('shortestTime', totaltime);s
    //     bestime = totaltime;
    // }
    // document.querySelector(".shortestTime").innerHTML = "you did it on " + totaltime + " seconds";

    // var shortesTimeSofar = localStorage.getItem('shortesTime');
    // if (shortesTimeSofar > gTimerInterval) {
    //     shortesTimeSofar = localStorage.setItem('shortesTime', gTimerInterval);
    // }
    // document.getElementById('shortestTime').innerHTML = 'The best time so far is ' + localStorage.getItem('shortesTime');

    var elSmiley = document.querySelector('.smiley');
    var elFeedbackTxt = document.querySelector('.feedBackTxt')
    // Store
    if (winOrLose === 'Win') {
        elFeedbackTxt.innerText = 'congratulations! you won :)'
        elSmiley.src = "./imgs/win.png";
    } else {
        elFeedbackTxt.innerText = 'loser.. you should try fortnite '
        elSmiley.src = "./imgs/sad.png";
    }
    clearInterval(gTimerInterval)
}

//Timer
function gameTimer() {
    var now = Date.now();
    var time = (now - gStartTime) / 1000;
    var elTimer = document.querySelector('.timer');
    elTimer.innerHTML = time; // minutes + ":" + remainingSeconds;
}


function getHint(elBtn) {
    gIsHint = true;
    elBtn.classList.add('hidden')

    var boardIndication = document.querySelector('.board');
    boardIndication.classList.add('hintIndication');
    renderBoard();
}

function undoHints(hints) {
    for (var i = 0; i < hints.length; i++) {
        hints[i].isShown = false
    }
    gIsHint = false;

    //cancel view Indication
    var boardIndication = document.querySelector('.board')
    boardIndication.classList.remove('hintIndication')
    renderBoard();
}

function startGame() {
    //reset timer
    clearInterval(gTimerInterval)
    gTimerInterval = 0;

    var elTimer = document.querySelector('.timer')
    elTimer.innerText = "0";

    //clean matrix
    gBoard = []
    initGame();
    renderBoard();

    gGame = {
        isOn: false,
        shownCounter: 0,
        markedCount: 0,
        secsPassed: 0,
    }
    gIsHint = false;

    var elSmiley = document.querySelector('.smiley');
    elSmiley.src = "./imgs/normal.png";

    var elFeedbackTxt = document.querySelector('.feedBackTxt')
    elFeedbackTxt.innerText = "";

    var hintsBTN = document.querySelectorAll('.hintsBTN');
    for (var i = 0; i < hintsBTN.length; i++) {
        hintsBTN[i].classList.remove('hidden')
    }
    renderBoard();
}

var gupdategLevel;
function updategLevel(elBtn) {
    var elBoardSize = elBtn.value
    
    switch (elBoardSize) {
        case '2':
            gLevel.SIZE = 8
            gLevel.MINES = 12
            gLevel.life = 3
            gLevel.REGULARCELLS = (gLevel.SIZE * gLevel.SIZE - gLevel.MINES)
            break;

        case '3':
            gLevel.SIZE = 12
            gLevel.MINES = 30
            gLevel.life = 3
            gLevel.REGULARCELLS = (gLevel.SIZE * gLevel.SIZE - gLevel.MINES)
            break;

        default:
            gLevel.SIZE = 4
            gLevel.MINES = 2
            gLevel.REGULARCELLS = 14,
            gLevel.life = 2
            break;

    }
    // renderBoard();
 
}