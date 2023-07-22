// Отримуємо елементи DOM
const canvas = document.querySelector(".game-canvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.querySelector(".game-score");
const startButton = document.querySelector(".game-start");
const resetButton = document.querySelector(".game-reset");

// Зображення
const snakeImage = new Image();
snakeImage.src = "img/snake.png";

const foodImage = new Image();
foodImage.src = "img/cherry.png";

// Глобальні змінні
let score = 0;
let isGameRunning = false;

// Інтервал оновлення (менше значення - швидший рух, більше - повільніший рух)
const updateInterval = 150; // 150 мілісекунд

// Розмір клітинки
const gridSize = 20;
const gridWidth = canvas.width / gridSize;
const gridHeight = canvas.height / gridSize;

// Змійка
let snake = [{ x: gridWidth / 2, y: gridHeight / 2 }];
let dx = 0;
let dy = 0;

// Їжа
let food = { x: 0, y: 0 };

// Оновлення гри
function update() {
  if (isGameRunning) {
    // Рух змійки
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    // Змійка з'їла їжу
    if (head.x === food.x && head.y === food.y) {
      score++;
      scoreElement.textContent = `Очки: ${score}`;
      generateFood();
    } else {
      snake.pop();
    }

    // Перевірка на зіткнення
    if (isCollision()) {
      gameOver();
      return;
    }
  }

  // Очищення полотна
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Малюємо змійку
  snake.forEach((segment) => drawSnakeSegment(segment));

  // Малюємо їжу
  drawFood();
}

// Малюємо сегмент змійки
function drawSnakeSegment(segment) {
  ctx.drawImage(
    snakeImage,
    segment.x * gridSize,
    segment.y * gridSize,
    gridSize,
    gridSize
  );
}

// Малюємо їжу
function drawFood() {
  ctx.drawImage(
    foodImage,
    food.x * gridSize,
    food.y * gridSize,
    gridSize,
    gridSize
  );
}

// Генеруємо нову їжу
function generateFood() {
  food = {
    x: Math.floor(Math.random() * gridWidth),
    y: Math.floor(Math.random() * gridHeight),
  };

  // Перевірка, щоб їжа не з'явилась в тілі змійки
  if (snake.some((segment) => segment.x === food.x && segment.y === food.y)) {
    generateFood();
  }
}

// Перевірка на зіткнення
function isCollision() {
  const head = snake[0];
  return (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= gridWidth ||
    head.y >= gridHeight ||
    snake
      .slice(1)
      .some((segment) => segment.x === head.x && segment.y === head.y)
  );
}

// Кінець гри
function gameOver() {
  isGameRunning = false;
  alert(`Гру завершено! Ваш рахунок: ${score}`);
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

// Обробка кнопки "Старт"
startButton.addEventListener("click", () => {
  if (!isGameRunning) {
    isGameRunning = true;
    generateFood();
    update();
  }
});

// Обробка кнопки "Перезапуск"
resetButton.addEventListener("click", () => {
  if (!isGameRunning) {
    score = 0;
    scoreElement.textContent = "Очки: 0";
    snake = [{ x: gridWidth / 2, y: gridHeight / 2 }];
    dx = 0;
    dy = 0;
    generateFood();
    update();
  }
});

// Продовжуємо оновлення з інтервалом
  setInterval(update, updateInterval);