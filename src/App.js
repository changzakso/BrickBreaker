import './App.css';

import React, { useRef, useEffect, useState } from 'react';

const App = () => {
    const canvasRef = useRef(null);
    const [gameRunning, setGameRunning] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);

    useEffect(() => {
        let animationId;

        if (!gameRunning) {
            cancelAnimationFrame(animationId);
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const canvasWidth = 480;
        const canvasHeight = 320;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Ball
        let ballRadius = 10;
        let x = canvasWidth / 2;
        let y = canvasHeight - 30;
        let dx = 2;
        let dy = -2;

        // Paddle
        const paddleHeight = 10;
        const paddleWidth = 75;
        let paddleX = (canvasWidth - paddleWidth) / 2;

        let rightPressed = false;
        let leftPressed = false;

        // Bricks
        const brickRowCount = 5;
        const brickColumnCount = 7;
        const brickWidth = 50;
        const brickHeight = 20;
        const brickPadding = 10;
        const brickOffsetTop = 30;
        const brickOffsetLeft = 35;

        const bricks = [];
        for (let c = 0; c < brickColumnCount; c++) {
            bricks[c] = [];
            for (let r = 0; r < brickRowCount; r++) {
                bricks[c][r] = { x: 0, y: 0, status: 1 };
            }
        }

        // Event listeners
        const handleKeyDown = (e) => {
            if (e.key === 'Right' || e.key === 'ArrowRight') {
                rightPressed = true;
            } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
                leftPressed = true;
            }
        };

        const handleKeyUp = (e) => {
            if (e.key === 'Right' || e.key === 'ArrowRight') {
                rightPressed = false;
            } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
                leftPressed = false;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        // Draw ball
        const drawBall = () => {
            ctx.beginPath();
            ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#0095DD';
            ctx.fill();
            ctx.closePath();
        };

        // Draw paddle
        const drawPaddle = () => {
            ctx.beginPath();
            ctx.rect(paddleX, canvasHeight - paddleHeight, paddleWidth, paddleHeight);
            ctx.fillStyle = '#0095DD';
            ctx.fill();
            ctx.closePath();
        };

        // Draw bricks
        const drawBricks = () => {
            for (let c = 0; c < brickColumnCount; c++) {
                for (let r = 0; r < brickRowCount; r++) {
                    if (bricks[c][r].status === 1) {
                        const brickX =
                            c * (brickWidth + brickPadding) + brickOffsetLeft;
                        const brickY =
                            r * (brickHeight + brickPadding) + brickOffsetTop;
                        bricks[c][r].x = brickX;
                        bricks[c][r].y = brickY;
                        ctx.beginPath();
                        ctx.rect(brickX, brickY, brickWidth, brickHeight);
                        ctx.fillStyle = '#0095DD';
                        ctx.fill();
                        ctx.closePath();
                    }
                }
            }
        };

        // Collision detection
        const collisionDetection = () => {
            for (let c = 0; c < brickColumnCount; c++) {
                for (let r = 0; r < brickRowCount; r++) {
                    const b = bricks[c][r];
                    if (b.status === 1) {
                        if (
                            x > b.x &&
                            x < b.x + brickWidth &&
                            y > b.y &&
                            y < b.y + brickHeight
                        ) {
                            dy = -dy;
                            b.status = 0;
                            checkWinCondition();
                        }
                    }
                }
            }
        };

        // Check if all bricks are cleared
        const checkWinCondition = () => {
            const allCleared = bricks.every((column) =>
                column.every((brick) => brick.status === 0)
            );
            if (allCleared) {
                setGameRunning(false);
                setGameWon(true);
            }
        };

        // Game loop
        const draw = () => {
            if (!gameRunning) return;

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            drawBricks();
            drawBall();
            drawPaddle();
            collisionDetection();

            // Ball movement
            if (x + dx > canvasWidth - ballRadius || x + dx < ballRadius) {
                dx = -dx;
            }
            if (y + dy < ballRadius) {
                dy = -dy;
            } else if (y + dy > canvasHeight - ballRadius) {
                if (x > paddleX && x < paddleX + paddleWidth) {
                    dy = -dy;
                } else {
                    setGameOver(true);
                    setGameRunning(false);
                    return;
                }
            }

            x += dx;
            y += dy;

            // Paddle movement
            if (rightPressed && paddleX < canvasWidth - paddleWidth) {
                paddleX += 7;
            } else if (leftPressed && paddleX > 0) {
                paddleX -= 7;
            }

            animationId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationId);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameRunning]);

    const handleStart = () => {
        setGameOver(false);
        setGameWon(false);
        setGameRunning(true);
    };

    const handleStop = () => {
        setGameRunning(false);
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-4">벽돌깨기</h1>
            <p className="text-lg text-gray-600 mb-8 text-center">
                화살표 키를 사용해 패들을 움직이고, 공으로 벽돌을 모두 제거하세요!
            </p>
            <div className="bg-white p-4 rounded shadow">
                <canvas ref={canvasRef} className="border border-gray-400 mb-4" />
                <div className="flex justify-center space-x-4">
                    {!gameRunning && !gameOver && !gameWon && (
                        <button
                            onClick={handleStart}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Start Game
                        </button>
                    )}
                    {gameRunning && (
                        <button
                            onClick={handleStop}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Stop Game
                        </button>
                    )}
                    {(gameOver || gameWon) && (
                        <button
                            onClick={handleStart}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Restart Game
                        </button>
                    )}
                </div>
                {gameOver && <p className="text-red-500 mt-4 text-center">Game Over! Try Again.</p>}
                {gameWon && <p className="text-green-500 mt-4 text-center">Congratulations! You Won!</p>}
            </div>
        </div>
    );
};

export default App;
