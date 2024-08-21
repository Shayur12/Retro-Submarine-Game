const cvs = document.getElementById('canvas');
const ctx = cvs.getContext("2d");

// Load images
const submarine = new Image();
const underwaterBg = new Image(); 
const mineImg = new Image();
const explosionImg = new Image();

submarine.src = "img/submarine.png";
underwaterBg.src = "img/Background Ocean.png"; 
mineImg.src = "img/Mines.png";
explosionImg.src = "img/explosion.png";

let submarineScale = 0.3; 
let mineScale = 0.2; 
let explosionScale = 0.1; // Adjusted explosion scale

let shipX = 10;
let shipY = 150;
let gravity = 0.8;
let lift = -18;
let speed = 3.5;
let scoreText = 0;
let finish = false;
let previousScore = 0;

const flyMusic = new Audio();
const scoreMusic = new Audio();
const hurt = new Audio();

flyMusic.src = "effects/fly.mp3";
scoreMusic.src = "effects/score.mp3";
hurt.src = "effects/falling.wav";

let mines = [
    {
        x: cvs.width,
        y: Math.random() * (cvs.height - mineImg.height * mineScale)
    }
];

let frameCount = 0;

const mvUp = () => {
    shipY += lift;
    flyMusic.play();
};

document.addEventListener("keydown", (event) => {
    if (event.code === 'Space') {
        mvUp();
    }
});

const startGame = () => {

    if (!finish) {
        ctx.clearRect(0, 0, cvs.width, cvs.height);

        ctx.drawImage(underwaterBg, 0, 0, cvs.width, cvs.height);

        frameCount++;

        if (frameCount % 100 === 0) {
            mines.push({
                x: cvs.width,
                y: Math.random() * (cvs.height - mineImg.height * mineScale)
            });
        }

        for (let i in mines) {
            ctx.drawImage(mineImg, mines[i].x, mines[i].y, mineImg.width * mineScale, mineImg.height * mineScale);
            mines[i].x -= speed;

            // Improved collision detection
            let submarineRight = shipX + submarine.width * submarineScale;
            let submarineBottom = shipY + submarine.height * submarineScale;
            let mineRight = mines[i].x + mineImg.width * mineScale;
            let mineBottom = mines[i].y + mineImg.height * mineScale;

            if (submarineRight > mines[i].x &&
                shipX < mineRight &&
                submarineBottom > mines[i].y &&
                shipY < mineBottom) {
                finish = true;
                let explosionX = (submarineRight + mines[i].x) / 2 - (explosionImg.width * explosionScale) / 2;
                let explosionY = (submarineBottom + mines[i].y) / 2 - (explosionImg.height * explosionScale) / 2;
                ctx.drawImage(explosionImg, explosionX, explosionY, explosionImg.width * explosionScale, explosionImg.height * explosionScale);
                hurt.play();
                setTimeout(() => {
                    previousScore = scoreText;
                    showGameOverMenu();
                }, 300);
                break; // Stop checking other mines once collision is detected
            }

            if (mines[i].x + mineImg.width * mineScale < shipX && !mines[i].scored) {
                scoreText++;
                mines[i].scored = true;
                scoreMusic.play();
            }
        }

        shipY += gravity;

        if (shipY + submarine.height * submarineScale >= cvs.height || shipY <= 0) {
            finish = true;
            ctx.drawImage(explosionImg, shipX, shipY, explosionImg.width * explosionScale, explosionImg.height * explosionScale);
            setTimeout(() => {
                previousScore = scoreText;
                showGameOverMenu();
            }, 300);
        }

        ctx.drawImage(submarine, shipX, shipY, submarine.width * submarineScale, submarine.height * submarineScale);
        ctx.fillStyle = "#FFF";
        ctx.font = "20px 'Courier New', Courier, monospace";  // Fallback to a reliable retro font
        ctx.fillText("Score: " + scoreText, cvs.width - 150, 30);
        requestAnimationFrame(startGame);
    }
};

const showGameOverMenu = () => {
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    ctx.fillStyle = "#000033"; // Dark blue background
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "20px 'Courier New', Courier, monospace";
    ctx.textAlign = "center";

    ctx.fillText("GAME OVER", cvs.width / 2, 150);
    ctx.fillText("SCORE: " + previousScore, cvs.width / 2, 200);
    ctx.fillText("Press R to Retry", cvs.width / 2, 250);
    ctx.fillText("Press Q to Quit", cvs.width / 2, 300);

    document.addEventListener("keydown", handleGameOverMenu);
};

const handleGameOverMenu = (event) => {
    if (event.key === 'r' || event.key === 'R') {
        scoreText = 0;
        shipY = 150;
        mines = [];
        finish = false;
        document.removeEventListener("keydown", handleGameOverMenu);
        startGame();
    } else if (event.key === 'q' || event.key === 'Q') {
        window.close(); // Close the window (only works if opened by JavaScript, might not work in all environments)
    }
};

underwaterBg.onload = () => startGame();
