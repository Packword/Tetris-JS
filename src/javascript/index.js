const figures = {
    "I": [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0]
    ],
    "O": [
        [1,1],
        [1,1]
    ],
    "J": [
        [1,0,0],
        [1,1,1],
        [0,0,0]
    ],
    "L": [
        [0,0,1],
        [1,1,1],
        [0,0,0]
    ],
    "T": [
        [0,1,0],
        [1,1,1],
        [0,0,0]
    ],
    "Z":[
        [1,1,0],
        [0,1,1],
        [0,0,0]
    ],
    "S":[
        [0,1,1],
        [1,1,0],
        [0,0,0]
    ]
};

const colors = {
    'I': 'cyan',
    'O': 'yellow',
    'T': 'purple',
    'S': 'green',
    'Z': 'red',
    'J': 'blue',
    'L': 'orange',
    'U': 'brown'
};


const canvas = document.getElementById("tetris");
const context = canvas.getContext('2d');
const nextFigCanvas = document.getElementById("nextFigure");
const nextFigContext = nextFigCanvas.getContext('2d');
const square = 32;
const scoreField = document.getElementById('score-place');
const levelField = document.getElementById('level-place');
let scoreTable;
let player = {
    name: localStorage.getItem("Name"),
    score: 0
}
if(localStorage.getItem('score-table') == null){
    scoreTable = [];
}
else{
    scoreTable = JSON.parse(localStorage.getItem('score-table'));
}
let score = 0;
let level = 0;
let figureQueue = [];
let field = [];
let difficulty_frame = 35;

for(let row = -2; row < 20; row++){
    field[row] = [];
    for(let column = 0; column < 10; column++){
        field[row][column] = 0;
    }
}
let curFigure = generateNextFigure();
let curFrame = null;
let frameCount = 0;
let endGame = false;


document.addEventListener('keydown', function (e){
    if(endGame === true) return;
    let tryMove = curFigure.column;
    if(e.key === "ArrowLeft"){
        tryMove = curFigure.column - 1;
    }
    if(e.key === "ArrowRight"){
        tryMove = curFigure.column + 1;
    }
    if(isPossible(curFigure.figure, curFigure.row, tryMove)){
        curFigure.column = tryMove;
    }
    if(e.key === "ArrowUp"){
        let tryRotate = rotateFigure(curFigure.figure);
        if(isPossible(tryRotate, curFigure.row, curFigure.column)){
            curFigure.figure = tryRotate;
        }
    }
    if(e.key === "ArrowDown"){
        let tryDown = curFigure.row + 1;
        if(!isPossible(curFigure.figure, tryDown, curFigure.column)){
            curFigure.figure = tryDown -1;
            fixFigure();
            return;
        }
        curFigure.row = tryDown;
    }
});


function getName(){
    let name = localStorage.getItem("Name");
    let header = document.getElementById("name-place");
    header.innerText = name;
}

function updateScore(){
    scoreField.innerText = score;
    player.score = score;
    level = parseInt(score / 100);
    levelField.innerText = level;
    difficulty_frame = 35 - level * 5;
    if(difficulty_frame < 5){
        difficulty_frame = 3;
    }
}

function getRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQueue(){
    let variants = ["I", "O", "J", "L", "T", "Z", "S"];
    for(let i = 0; i < 7; i++) {
        let index = getRandom(0, variants.length - 1);
        let curFig = variants[index];
        variants.splice(index, 1);
        figureQueue.push(curFig);
    }
}

function drowNextFigure(){
    if(figureQueue.length === 0){
        generateQueue();
    }
    const nextFigName = figureQueue[figureQueue.length - 1];
    nextFigContext.fillStyle = colors[nextFigName];
    for (let row = 0; row < figures[nextFigName].length; row++) {
        for (let col = 0; col < figures[nextFigName].length; col++) {
            if (figures[nextFigName][row][col]) {
                nextFigContext.fillRect((col) * square,
                    (row) * square,
                    square - 1,
                    square - 1);
            }
        }
    }
}

function clearNextFig(){
    nextFigContext.clearRect(0,0, nextFigCanvas.width, nextFigCanvas.height);
}

function generateNextFigure(){
    if(figureQueue.length === 0){
        generateQueue();
    }
    const curFigName = figureQueue.pop();
    const curFig = figures[curFigName];
    const startColumn = 5 - Math.ceil(curFig[0].length / 2);
    const startRow = -2;
    return{
        name: curFigName,
        figure: curFig,
        column: startColumn,
        row: startRow
    };
}

function rotateFigure(fig){
    const len = fig.length;
    let result = []
    for(let i = 0; i < len; i++){
        result[i] = [...fig[i]];
        for(let j = 0; j < len; j++) {
            result[i][j] = fig[len - j - 1][i];
        }
    }
    return result;
}

function isPossible(fig, startRow, startColumn){
    const len = fig[0].length;
    for(let i = 0; i < len; i++){
        for(let j = 0; j < len; j++){
            if(fig[i][j]) {
                if(startRow + i < 20) {
                    if (field[startRow + i][startColumn + j]) {
                        return false;
                    }
                }
                if (startRow + i >= field.length) {
                    return false;
                }
                if ((startColumn + j) >= field[0].length) {
                    return false;
                }
                if ((startColumn + j) < 0) {
                    return false;
                }
            }
        }
    }
    return true;
}

function fixFigure(){
    const len = curFigure.figure.length;
    for(let i = 0; i < len; i++){
        for(let j = 0; j < len; j++){
            if(curFigure.figure[i][j] === 1){
                if(curFigure.row + i < 0){
                    return gameOver();
                }
                field[curFigure.row + i][curFigure.column + j] = 'U'
            }
        }
    }
    let linesDeleted = 0;
    for(let line = field.length - 1; line >= 0;){
        let check = true;
        for(let col = 0; col < field[0].length; col++){
            if(field[line][col] === 0){
                check = false;
            }
        }
        if(check === true){
            linesDeleted++;
            for(let i = line; i >= 0; i--){
                for(let j = 0; j < field[0].length; j++){
                    field[i][j] = field[i - 1][j];
                }
            }
        }
        else{
            line--;
        }
    }
    score += linesDeleted * linesDeleted * 10;
    curFigure = generateNextFigure();
}

function updateScoreTable(){
    let check = false;
    let tmpPlayer = {
        name: player.name,
        score: player.score
    };
    let tmpPlayer2 = {
        name: '',
        score: 0
    };
    for(let i = 0; i < scoreTable.length; i++){
        if(i === 10) break;
        if(check === true && (i !== scoreTable.length - 1)){
            tmpPlayer2.name = scoreTable[i].name;
            tmpPlayer2.score = scoreTable[i].score;
            scoreTable[i].name = tmpPlayer.name;
            scoreTable[i].score = tmpPlayer.score;
            tmpPlayer.name = tmpPlayer2.name;
            tmpPlayer.score = tmpPlayer2.score;
        }
        if(player.score >= scoreTable[i].score && check === false) {
            check = true;
            tmpPlayer.name = scoreTable[i].name;
            tmpPlayer.score = scoreTable[i].score;
            scoreTable[i].name = player.name;
            scoreTable[i].score = player.score;
        }
    }
    if(scoreTable.length < 10){
        let len = scoreTable.length;
        scoreTable[len] = {
            name: '',
            score: 0
        };
        scoreTable[len].name = tmpPlayer.name;
        scoreTable[len].score = tmpPlayer.score;
    }
    localStorage.setItem('score-table', JSON.stringify(scoreTable));
}


function printScoreTable(){
    const scorePlace = document.getElementById('scores');
    scorePlace.innerHTML = "<h4>Таблица рекордов</h4>";
    for(let i = 0; i < scoreTable.length; i++){
        if(i === 10) break;
        scorePlace.innerHTML += i + 1;
        scorePlace.innerHTML += '. ';
        scorePlace.innerHTML += scoreTable[i].name;
        scorePlace.innerHTML += '.......';
        scorePlace.innerHTML +=scoreTable[i].score;
        scorePlace.innerHTML += '<br/>'
    }
}


function gameOver(){
    cancelAnimationFrame(curFrame);
    updateScoreTable();
    endGame = true;
    context.fillStyle = 'black';
    context.globalAlpha = 0.75;
    context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
    context.globalAlpha = 1;
    context.fillStyle = 'red';
    context.font = '36px pricedown';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('ПОТРАЧЕНО!', canvas.width / 2, canvas.height / 2);
    printScoreTable();
}

function gameProcess(){
    curFrame = requestAnimationFrame(gameProcess);
    updateScore();
    clearNextFig();
    drowNextFigure();
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
            if (field[row][col]) {
                const name = field[row][col];
                context.fillStyle = colors[name];
                context.fillRect(col * square, row * square, square-1, square-1);
            }
        }
    }
    if(curFigure){
        frameCount++;
        if(frameCount > difficulty_frame) {
            curFigure.row++;
            frameCount = 0;
            if(!isPossible(curFigure.figure, curFigure.row, curFigure.column)){
                curFigure.row--;
                fixFigure();
            }
        }
        context.fillStyle = colors[curFigure.name];
        for (let row = 0; row < curFigure.figure.length; row++) {
            for (let col = 0; col < curFigure.figure[row].length; col++) {
                if (curFigure.figure[row][col]) {
                    context.fillRect((curFigure.column + col) * square,
                        (curFigure.row + row) * square,
                        square - 1,
                        square - 1);
                }
            }
        }
    }
}

getName();
curFrame = requestAnimationFrame(gameProcess);
