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

const snakeHeadArr = [
  [0, 0, 0, 1],
  [0, 1, 1, 0],
  [0, 1, 1, 1],
  [0, 0, 0, 0],
];
const snakeOpenHeadArr = [
  [0, 1, 0, 1],
  [0, 0, 1, 0],
  [0, 0, 1, 1],
  [0, 1, 0, 0],
];
const snakeSegmentArr = [
  [0, 0, 0, 0],
  [1, 0, 1, 1],
  [1, 1, 0, 1],
  [0, 0, 0, 0],
];
const snakeTailArr = [
  [0, 0, 0, 0],
  [1, 1, 0, 0],
  [1, 1, 1, 1],
  [0, 0, 0, 0],
];
const snakeTurnArr = [
  [0, 0, 0, 0],
  [1, 1, 0, 0],
  [1, 0, 1, 0],
  [0, 1, 1, 0],
];
const snakeTurnReverseArr = [
  [0, 1, 1, 0],
  [1, 0, 1, 0],
  [1, 1, 0, 0],
  [0, 0, 0, 0],
];
// const snakeHeadArr = [
//   [1, 1, 1, 1],
//   [1, 1, 1, 1],
//   [1, 1, 1, 1],
//   [1, 1, 1, 1],
// ];
// const snakeSegmentArr = [
//   [1, 1, 1, 1],
//   [1, 0, 0, 1],
//   [1, 0, 0, 1],
//   [1, 1, 1, 1],
// ];
// const snakeTailArr = [
//   [1, 0, 0, 0],
//   [1, 1, 0, 0],
//   [1, 1, 1, 0],
//   [1, 1, 1, 1],
// ];
// const snakeTurnArr = [
//   [0, 0, 0, 0],
//   [1, 1, 0, 0],
//   [1, 0, 1, 0],
//   [0, 1, 1, 0],
// ];

let snake = [
  {
    x: gridWidth / 2,
    y: gridHeight / 2,
    viewArr: snakeHeadArr,
    dx: -1,
    dy: 0,
  },
  {
    x: gridWidth / 2 + 1,
    y: gridHeight / 2,
    viewArr: snakeTurnArr,
    dx: 0,
    dy: -1,
  },
  {
    x: gridWidth / 2 + 1,
    y: gridHeight / 2 + 1,
    viewArr: snakeTurnArr,
    dx: 0,
    dy: -1,
  },
  {
    x: gridWidth / 2 + 2,
    y: gridHeight / 2 + 1,
    viewArr: snakeSegmentArr,
    dx: -1,
    dy: 0,
  },
  {
    x: gridWidth / 2 + 3,
    y: gridHeight / 2 + 1,
    viewArr: snakeTailArr,
    dx: -1,
    dy: 0,
  },
];

// Їжа
const foodArr = [
  [0, 0, 1, 0],
  [0, 1, 0, 1],
  [0, 0, 1, 0],
  [0, 0, 0, 0],
];
let food = [];

const eatenFoodArr = [
  [0, 1, 1, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 1, 1, 0],
];
let eatenFood = [];

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
      generateEatenFood(foodLastID);
      score++;
      scoreElement.textContent = `Score: ${score}`;
      generateFood();
    }

    // Перевірка на зіткнення
    if (isCollision()) {
      gameOver();
      return;
    }
    // Очищення полотна
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Малюємо їжу
    drawObject(food[foodLastID]);
    eatenFood.forEach((food) => {
      drawObject(food);
    });
    //   Малюємо змійку
    snake.forEach((segment) => {
      drawObject(segment);
    });
  }
}

function updateSnake() {
  let snakeLastID = snake.length - 1;
  let newHead = {
    x: snake[0].x + dx,
    y: snake[0].y + dy,
    viewArr: snakeHeadArr,
    dx: dx,
    dy: dy,
  };
  snake.unshift(newHead);
  turnCheck();
  nearFoodCheck();
  if (
    eatenFood.length &&
    snake[snakeLastID].x === eatenFood[0].x &&
    snake[snakeLastID].y === eatenFood[0].y
  ) {
    eatenFood.splice(0, 1);
  } else {
    snake.pop();
    snake[snakeLastID].viewArr = snakeTailArr;
  }
}

// Малюємо об'єкт з масиву
function drawObject(obj) {
  if (obj.dx === -1 && obj.dy === 0) {
    //left
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
  if (obj.dx === 1 && obj.dy === 0) {
    //right
    for (let i = 0; i < obj.viewArr.length; i++) {
      for (let j = obj.viewArr[i].length - 1; j >= 0; j--) {
        if (obj.viewArr[i][j] == 1) {
          ctx.fillStyle = "black";
          ctx.fillRect(
            obj.x * gridSize + (gridSize * (obj.viewArr[i].length - 1 - j)) / 4,
            obj.y * gridSize + (gridSize * i) / 4,
            gridSize / 4,
            gridSize / 4
          );
        }
      }
    }
  }
  if (obj.dx === 0 && obj.dy === -1) {
    //up
    for (let i = 0; i < obj.viewArr.length; i++) {
      for (let j = obj.viewArr[i].length - 1; j >= 0; j--) {
        if (obj.viewArr[j][i] == 1) {
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
  if (obj.dx === 0 && obj.dy === 1) {
    //down
    for (let i = obj.viewArr.length - 1; i >= 0; i--) {
      for (let j = 0; j < obj.viewArr[i].length; j++) {
        if (obj.viewArr[j][i] == 1) {
          ctx.fillStyle = "black";
          ctx.fillRect(
            obj.x * gridSize + (gridSize * j) / 4,
            obj.y * gridSize + (gridSize * (obj.viewArr.length - 1 - i)) / 4,
            gridSize / 4,
            gridSize / 4
          );
        }
      }
    }
  }
}

// Генеруємо нову їжу
function generateFood() {
  foodX = Math.floor(Math.random() * gridWidth);
  foodY = Math.floor(Math.random() * gridHeight);
  let newFood = {
    x: foodX,
    y: foodY,
    viewArr: foodArr,
    dx: -1,
    dy: 0,
  };
  food.push(newFood);

  //  Перевірка, щоб їжа не з'явилась в тілі змійки
  if (
    snake.some((segment) =>
      food.some((f) => f.x === segment.x && f.y === segment.y)
    )
  ) {
    food.pop();
    generateFood();
  }
}

// Генеруємо з'їдену їжу
function generateEatenFood(eatenFoodId) {
  let f = food[eatenFoodId];
  f.dx = dx;
  f.dy = dy;
  f.viewArr = eatenFoodArr;
  eatenFood.push(f);
  food.splice(eatenFoodId, 1);
}

//
function turnCheck() {
  if (snake[0].dx != snake[1].dx && snake[0].dy != snake[1].dy) {
    if (
      (snake[1].dy === 1 && (dx === 1 || dx === -1)) ||
      (snake[1].dx === 1 && (dy === 1 || dy === -1))
    )
      snake[1].viewArr = snakeTurnReverseArr;
    else snake[1].viewArr = snakeTurnArr;
    snake[1].dx = dx;
    snake[1].dy = dy;
  } else {
    snake[1].viewArr = snakeSegmentArr;
  }
}

//
function nearFoodCheck() {
  if (
    Math.abs(snake[0].x - food[food.length - 1].x) +
      Math.abs(snake[0].y - food[food.length - 1].y) ==
    1
  )
  snake[0].viewArr = snakeOpenHeadArr;
}

//Якщо вийшла за межі поля
function positionCheck() {
  if (snake[0].x > gridWidth) snake[0].x = 0;
  if (snake[0].x < 0) snake[0].x = gridWidth;
  if (snake[0].y > gridHeight) snake[0].y = 0;
  if (snake[0].y < 0) snake[0].y = gridHeight;
}

// // Перевірка на зіткнення
function isCollision() {
  const head = snake[0];
  return snake
    .slice(1)
    .some((segment) => segment.x === head.x && segment.y === head.y);
}

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
turnCheck();
snake.forEach((segment) => {
  drawObject(segment);
});
drawObject(food[food.length - 1]);
