// Отримуємо елементи DOM
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.querySelector(".game-score");
const startButton = document.getElementById("startButton");
const resetButton = document.getElementById("resetButton");

// Глобальні змінні
let score = 0;
let isGameRunning = false;

// Інтервал оновлення (менше значення - швидший рух, більше - повільніший рух)
const updateInterval = 350; // 150 мілісекунд

// Розмір клітинки
const gridSize = 32;
const gridWidth = canvas.width / gridSize;
const gridHeight = canvas.height / gridSize;

// Змійка
let dx = -1;
let dy = 0;

// let snakeHeadArr = [
//   [0, 0, 0, 1],
//   [0, 1, 1, 0],
//   [0, 1, 1, 1],
//   [0, 0, 0, 0],
// ];
// let snakeSegmentArr = [
//   [0, 0, 0, 0],
//   [1, 0, 1, 1],
//   [1, 1, 0, 1],
//   [0, 0, 0, 0],
// ];
// let snakeTailArr = [
//   [0, 0, 0, 0],
//   [1, 1, 0, 0],
//   [1, 1, 1, 1],
//   [0, 0, 0, 0],
// ];
// let snakeTurnArr = [
//   [0, 0, 0, 0],
//   [1, 1, 0, 0],
//   [1, 0, 1, 0],
//   [0, 1, 1, 0],
// ];
const snakeHeadArr = [
  [1, 1, 1, 1],
  [1, 1, 1, 1],
  [1, 1, 1, 1],
  [1, 1, 1, 1],
];
const snakeSegmentArr = [
  [1, 1, 1, 1],
  [1, 0, 0, 1],
  [1, 0, 0, 1],
  [1, 1, 1, 1],
];
const snakeTailArr = [
  [1, 0, 0, 0],
  [1, 1, 0, 0],
  [1, 1, 1, 0],
  [1, 1, 1, 1],
];
const snakeTurnArr = [
  [0, 0, 0, 0],
  [1, 1, 0, 0],
  [1, 0, 1, 0],
  [0, 1, 1, 0],
];
let n = 0;
let snake = [
  { x: gridWidth / 2, y: gridHeight / 2, viewArr: snakeHeadArr },
  { x: gridWidth / 2 + 1, y: gridHeight / 2, viewArr: snakeSegmentArr },
  { x: gridWidth / 2 + 1, y: gridHeight / 2 + 1, viewArr: snakeSegmentArr },
  { x: gridWidth / 2 + 2, y: gridHeight / 2 + 1, viewArr: snakeSegmentArr },
  { x: gridWidth / 2 + 3, y: gridHeight / 2 + 1, viewArr: snakeTailArr },
];

// Їжа
const foodArr = [
  [0, 0, 1, 0],
  [0, 1, 0, 1],
  [0, 0, 1, 0],
  [0, 0, 0, 0],
];
let food = [];

// Оновлення гри
function update() {
  if (isGameRunning) {
    updateSnake();
    positionCheck();

    let foodLastID = food.length - 1;
    if (
      snake[0].x === food[foodLastID].x &&
      snake[0].y === food[foodLastID].y
    ) {
    score++ 
    scoreElement.textContent = `Очки: ${score}`;
      generateFood();
    }
    // Очищення полотна
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //   Малюємо змійку
    snake.forEach((segment) => {
      drawObject(segment);
    });

    // Малюємо їжу
    drawObject(food[foodLastID]);
  }
}

function updateSnake() {
  let snakeLastID = snake.length - 1;
  let newSegment = {
    x: snake[0].x,
    y: snake[0].y,
    viewArr: snakeSegmentArr,
  };
  snake[0].x += dx;
  snake[0].y += dy;
  snake.splice(1, 0, newSegment);
  if (
    snake[snakeLastID].x === food[0].x &&
    snake[snakeLastID].y === food[0].y
  ) {
    food.splice(0, 1);
  } else {
    snake.pop();
    snake[snakeLastID].viewArr = snakeTailArr;
  }
}

// Малюємо об'єкт з масиву
function drawObject(obj) {
  for (let i = 0; i < obj.viewArr.length; i++) {
    for (let j = 0; j < obj.viewArr[i].length; j++) {
      if (obj.viewArr[i][j] == 1) {
        ctx.fillStyle = "black";
        ctx.fillRect(
          obj.x * gridSize + (gridSize * j) / 4,
          obj.y * gridSize + (gridSize * i) / 4,
          gridSize / 4,
          gridSize / 4
        );
      }
    }
  }
}

// Генеруємо нову їжу
function generateFood() {
  foodX = Math.floor(Math.random() * gridWidth);
  foodY = Math.floor(Math.random() * gridHeight);
  let newFruit = {
    x: foodX,
    y: foodY,
    viewArr: foodArr,
  };
  food.push(newFruit);


  //  Перевірка, щоб їжа не з'явилась в тілі змійки
if (
    snake.some((segment) =>
      food.some((f) => f.x === segment.x && f.y === segment.y)
    )
  ) {
    generateFood();
  }
  
}

//Якщо вийшла за межі поля
function positionCheck() {
if (snake[0].x > gridWidth ) snake[0].x = 0;
if (snake[0].x < 0 ) snake[0].x = gridWidth;
if (snake[0].y > gridHeight ) snake[0].y = 0;
if (snake[0].y < 0 ) snake[0].y = gridHeight;
}



// // Перевірка на зіткнення
// function isCollision() {
//   const head = snake[0];
//   return (
//     head.x < 0 ||
//     head.y < 0 ||
//     head.x >= gridWidth ||
//     head.y >= gridHeight ||
//     snake
//       .slice(1)
//       .some((segment) => segment.x === head.x && segment.y === head.y)
//   );
// }

// Кінець гри
function gameOver() {
  isGameRunning = false;
  //   alert(`Гру завершено! Ваш рахунок: ${score}`);
}

// Обробка події клавіатури
document.addEventListener("keydown", (event) => {
  if (!isGameRunning) return;

  const keyPressed = event.key;
  if (keyPressed === "ArrowUp" && dy === 0) {
    dx = 0;
    dy = -1;
  } else if (keyPressed === "ArrowDown" && dy === 0) {
    dx = 0;
    dy = 1;
  } else if (keyPressed === "ArrowLeft" && dx === 0) {
    dx = -1;
    dy = 0;
  } else if (keyPressed === "ArrowRight" && dx === 0) {
    dx = 1;
    dy = 0;
  }
});

let intervalRunID;
// Обробка кнопки "Старт"
startButton.addEventListener("click", () => {
  if (!isGameRunning) {
    clearInterval(intervalRunID);
    isGameRunning = true;
    intervalRunID = setInterval(update, updateInterval);
  }
});

// // Обробка кнопки "Перезапуск"
// resetButton.addEventListener("click", () => {
//   if (!isGameRunning) {
//     score = 0;
//     scoreElement.textContent = "Очки: 0";
//     snake = [{ x: gridWidth / 2, y: gridHeight / 2 }];
//     dx = 0;
//     dy = 0;
//     generateFood();
//     update();
//   }
// });

// Продовжуємо оновлення з інтервалом
ctx.clearRect(0, 0, canvas.width, canvas.height);
generateFood();
snake.forEach((segment) => {
  drawObject(segment);
});
drawObject(food[food.length - 1]);
