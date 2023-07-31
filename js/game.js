// Отримання елементи DOM
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const currentScoreElement = document.getElementById("current-score");
const bestScoreElement = document.getElementById("best-score");

const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");

// Глобальні змінні
let score = 0;
let isGameRunning = false;
let intervalRunID;

// Інтервал оновлення (менше значення - швидший рух, більше - повільніший рух)
const updateInterval = 250; // 250 мілісекунд

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

    let foodLastID = food.length - 1;
    if (
      snake[0].x === food[foodLastID].x &&
      snake[0].y === food[foodLastID].y
    ) {
      generateEatenFood(foodLastID);

      score++;
      if (score < 10) currentScoreElement.textContent = `000${score}`;
      else if (score >= 10) currentScoreElement.textContent = `00${score}`;
      else if (score >= 100) currentScoreElement.textContent = `000${score}`;
      else currentScoreElement.textContent = `0${score}`;

      generateFood();
    }

    // Перевірка на зіткнення
    if (isCollision()) {
      gameOver();
      return;
    }

    // Очищення полотна
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Малювання їжі
    drawObject(food[foodLastID]);
    eatenFood.forEach((food) => {
      drawObject(food);
    });

    // Малювання змійки
    positionCheck();
    snake.forEach((segment) => {
      drawObject(segment);
    });
  }
}

// Оновлення координат частин змійки
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

// Малювання об'єкта з масиву
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

// Генерація нової їжі
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

// Генерація з'їденої їжі
function generateEatenFood(eatenFoodId) {
  let f = food[eatenFoodId];
  f.dx = dx;
  f.dy = dy;
  f.viewArr = eatenFoodArr;
  eatenFood.push(f);
  food.splice(eatenFoodId, 1);
}

// Перевірка чи змійка повертає
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

// Перевірка чи змійка біля їжі
function nearFoodCheck() {
  if (
    Math.abs(snake[0].x - food[food.length - 1].x) +
      Math.abs(snake[0].y - food[food.length - 1].y) ==
    1
  )
    snake[0].viewArr = snakeOpenHeadArr;
}

//Перевірка чи змійка в межах поля
function positionCheck() {
  if (snake[0].x > gridWidth) snake[0].x = 0;
  if (snake[0].x < 0) snake[0].x = gridWidth;
  if (snake[0].y > gridHeight) snake[0].y = 0;
  if (snake[0].y < 0) snake[0].y = gridHeight;
}

// Перевірка частин змійки на зіткнення з головою
function isCollision() {
  const head = snake[0];
  return snake
    .slice(1)
    .some((segment) => segment.x === head.x && segment.y === head.y);
}

// Кінець гри
function gameOver() {
  let current = parseInt(getCookie("bestScore")); // Перетворення значення cookies на число
  if (score > current) {
    document.cookie = `bestScore=${score}`;
    writeBestScore();
  }
  isGameRunning = false;
  canvas.style.backgroundColor = "#5d7505";
  startButton.innerHTML = "restart";
  startButton.style.visibility = "visible";
}

// Запис найкращого результату
function writeBestScore() {
  let current = parseInt(getCookie("bestScore"));
  if (current < 10) bestScoreElement.textContent = `000${current}`;
  else if (current >= 10) bestScoreElement.textContent = `00${current}`;
  else if (current >= 100) bestScoreElement.textContent = `000${current}`;
  else bestScoreElement.textContent = `0${current}`;
}

// Отримання значення вказаного cookie
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// Обробка події клавіатури
document.addEventListener("keydown", (event) => {
  if (!isGameRunning) return;

  const keyPressed = event.key;
  if (
    keyPressed === "ArrowUp" ||
    keyPressed === "ArrowDown" ||
    keyPressed === "ArrowLeft" ||
    keyPressed === "ArrowRight"
  )
    moveSnake(keyPressed);
});

// Обробка натиснутих стрілок
function moveSnake(direction) {
  if (!isGameRunning) return;

  if (direction === "ArrowUp" && dy === 0) {
    dx = 0;
    dy = -1;
  } else if (direction === "ArrowDown" && dy === 0) {
    dx = 0;
    dy = 1;
  } else if (direction === "ArrowLeft" && dx === 0) {
    dx = -1;
    dy = 0;
  } else if (direction === "ArrowRight" && dx === 0) {
    dx = 1;
    dy = 0;
  }
}

// Обробка кнопки "Старт"
startButton.addEventListener("click", () => {
  if (!isGameRunning) {
    if (startButton.innerHTML == "restart") window.location.reload();
    clearInterval(intervalRunID);
    isGameRunning = true;
    intervalRunID = setInterval(update, updateInterval);
    startButton.style.visibility = "hidden";
    canvas.style.backgroundColor = "#9ac401";
    startButton.innerHTML = "start";
  }
});

// Обробка кнопки "Пауза"
pauseButton.addEventListener("click", () => {
  if (isGameRunning) {
    clearInterval(intervalRunID);
    isGameRunning = false;
    intervalRunID = setInterval(update, updateInterval);
    startButton.innerHTML =
      '<img src="img/arrow_reverse.png" alt="arrow down"/>';
    canvas.style.backgroundColor = "#5d7505";
    startButton.style.visibility = "visible";
  }
});

// Перед запуском гри
ctx.clearRect(0, 0, canvas.width, canvas.height);
if (!document.cookie) document.cookie = "bestScore=0";
writeBestScore();

generateFood();
turnCheck();
snake.forEach((segment) => {
  drawObject(segment);
});
drawObject(food[food.length - 1]);
canvas.style.backgroundColor = "#5d7505";
