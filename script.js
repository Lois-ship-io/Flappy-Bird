// Board
let board;
let boardWidth = 360; // lebar canvas
let boardHeight = 640; // tinggi canvas
let context;

// Bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
	x: birdX,
	y: birdY,
	width: birdWidth,
	height: birdHeight,
};

// Pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// Physics and Difficulty Variables
let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;

let gapSize = boardHeight / 3; // Jarak antar pipa
let pipeSpeed = -2; // Kecepatan pipa
let score = 0;
let gameOver = false;

// R: Algonya mulai dari var di bawah ini
// Performance Variables for DDA
let pipesPassed = 0; // Jumlah pipa yang sudah dilewati
let collisions = 0; // Jumlah tabrakan

// Load game
window.onload = function () {
	board = document.getElementById("board");
	board.height = boardHeight;
	board.width = boardWidth;
	context = board.getContext("2d");

	// Load images
	birdImg = new Image(); //Ini untuk ngebuat gambar (via object JS)
	birdImg.src = "./img/flappybird.png";
	birdImg.onload = function () {
		context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
	};

	topPipeImg = new Image();
	topPipeImg.src = "./img/toppipe.png";

	bottomPipeImg = new Image();
	bottomPipeImg.src = "./img/bottompipe.png";

	// Wait until images are loaded before starting the game
	topPipeImg.onload = () => {
		bottomPipeImg.onload = () => {
			requestAnimationFrame(update);
			setInterval(placePipes, 1500);
		};
	};

	document.addEventListener("keydown", moveBird);
	document.addEventListener("touchstart", moveBird);
	// R
	const btnKebal = document.querySelector("#kebal");
	btnKebal.addEventListener("click", () => {
		btnKebal.dataset.kebal =
			btnKebal.dataset.kebal == "active" ? "non-active" : "active";
		const input = btnKebal.querySelector('input[type="radio"]');
		input.checked = !input.checked
	});
};

// Update game frame
function update() {
	requestAnimationFrame(update);
	if (gameOver) {
		return;
	}
	context.clearRect(0, 0, board.width, board.height);

	// Adjust Difficulty based on performance
	adjustDifficulty();

	// Bird movement
	velocityY += gravity;
	bird.y = Math.max(bird.y + velocityY, 0);
	context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

	if (bird.y > board.height) {
		gameOver = true; // Burung jatuh ke bawah
	}

	// Pipes movement
	for (let i = 0; i < pipeArray.length; i++) {
		let pipe = pipeArray[i];
		pipe.x += velocityX;
		context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

		// If the bird passes the pipe, increment the score
		if (!pipe.passed && bird.x > pipe.x + pipe.width) {
			score += 0.5;
			pipesPassed++; // Increment pipes passed
			pipe.passed = true;
		}

		// Check collision
		if (detectCollision(bird, pipe)) {
			collisions++; // Increment collisions
			gameOver = true;
		}
	}

	// Remove pipes that are off the screen
	while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
		pipeArray.shift();
	}

	// Display score
	context.fillStyle = "white";
	context.font = "45px sans-serif";
	context.fillText(score, 5, 45);

	// If game over
	if (gameOver) {
		context.fillText("GAME OVER", 5, 90);
	}
}

// Place pipes
function placePipes() {
	if (gameOver) {
		return;
	}

	let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
	let openingSpace = gapSize;

	let topPipe = {
		img: topPipeImg,
		x: pipeX,
		y: randomPipeY,
		width: pipeWidth,
		height: pipeHeight,
		passed: false,
	};
	pipeArray.push(topPipe);

	let bottomPipe = {
		img: bottomPipeImg,
		x: pipeX,
		y: randomPipeY + pipeHeight + openingSpace,
		width: pipeWidth,
		height: pipeHeight,
		passed: false,
	};
	pipeArray.push(bottomPipe);
}

// Move bird
function moveBird(e) {
	e.preventDefault();
	if (
		e.code == "Space" ||
		e.code == "ArrowUp" ||
		e.code == "KeyX" ||
		e.type == "touchstart"
	) {
		velocityY = -6;

		if (gameOver) {
			bird.y = birdY;
			pipeArray = [];
			score = 0;
			pipesPassed = 0;
			collisions = 0;
			gameOver = false;
			velocityY = 0;
		}
	}
}

// Detect collision
function detectCollision(a, b) {
	return (
		a.x < b.x + b.width &&
		a.x + a.width > b.x &&
		a.y < b.y + b.height &&
		a.y + a.height > b.y
	);
}

// Adjust difficulty based on performance
// Adjust difficulty based on performance
function adjustDifficulty() {
	// Perubahan berbasis tabrakan dan jumlah pipa yang dilewati
	if (collisions > 2) {
		pipeSpeed = -2; // Slow down pipes
		gapSize = boardHeight / 3.5; // Widen pipe gap
	} else if (pipesPassed > 10) {
		pipeSpeed = -3; // Increase pipe speed
		gapSize = boardHeight / 4; // Narrow pipe gap
	} else {
		pipeSpeed = -2.5; // Normal speed
		gapSize = boardHeight / 3; // Normal gap size
	}

	velocityX = pipeSpeed; // Apply speed to pipe movement

	// Aktifkan gerakan pipa vertikal jika pemain sudah melewati 20 pipa
	if (pipesPassed > 20) {
		enableVerticalPipeMovement();
		console.log("mulai");
	}
}

// Fungsi untuk menambahkan gerakan vertikal pada pipa
function enableVerticalPipeMovement() {
	pipeArray.forEach((pipe) => {
		// Pipa bergerak naik-turun
		pipe.y += Math.sin(Date.now() / 500) * 2; // Gerakan naik-turun
	});
}

// Update function
function update() {
	requestAnimationFrame(update);
	if (gameOver) {
		return;
	}
	context.clearRect(0, 0, board.width, board.height);

	// Adjust Difficulty dynamically
	adjustDifficulty();

	// Bird movement
	velocityY += gravity;
	bird.y = Math.max(bird.y + velocityY, 0);
	context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

	if (bird.y > board.height) {
		gameOver = true; // Burung jatuh ke bawah
	}

	// Pipes movement
	for (let i = 0; i < pipeArray.length; i++) {
		let pipe = pipeArray[i];
		pipe.x += velocityX; // Pipa bergerak secara horizontal
		context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

		// If the bird passes the pipe, increment the score
		if (!pipe.passed && bird.x > pipe.x + pipe.width) {
			score += 0.5;
			pipesPassed++; // Increment pipes passed
			pipe.passed = true;
		}

		// Check collision
		// Jika tombol kebal diklick. Maka akan membuat burung menjadi sakti
		const kebal = document.querySelector("#kebal").dataset.kebal;
		if (detectCollision(bird, pipe) && kebal == "non-active") {
			collisions++; // Increment collisions
			gameOver = true;
		}
	}

	// Remove pipes that are off the screen
	while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
		pipeArray.shift();
	}

	// Display score
	context.fillStyle = "white";
	context.font = "45px sans-serif";
	context.fillText(score, 5, 45);

	// If game over
	if (gameOver) {
		context.fillText("GAME OVER", 5, 90);
	}
}
