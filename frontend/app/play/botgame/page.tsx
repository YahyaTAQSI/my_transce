"use client";
import React, { useEffect, useRef, useState } from "react";
import Img from "next/image";
import { useRecoilValue } from "recoil";
import { tablePicture } from "@/app/Atoms/tablePicture";
import { Ball, Paddle } from "../pingPong";
import { useRouter } from "next/navigation";
import { loggedUser } from "@/app/Atoms/logged";
import robotPlayer from "@/public/game/robot-player.png";
import { userToken } from "@/app/Atoms/userToken";
import defaultAvatar from "@/public/default.png";
import "../pingPong.css";

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 500;
const BALL_RADIUS = 15;
const BALL_SPEED = 5;
const BALL_DX = 5;
const BALL_DY = 5;
const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 150;
const PADDLE_SPEED = 10;
const WINNER_SCORE = 1;

function RobotGame() {
  const canvasRef = useRef(null);
  const [leftFace, setLeftFace] = useState("/game/happy.png");
  const [rightFace, setRightFace] = useState("/game/happy.png");
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);
  const [resign, setResign] = useState(false);
  const table = useRecoilValue(tablePicture);

  const ball = new Ball(
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 2,
    BALL_RADIUS,
    BALL_DX,
    BALL_DY,
    BALL_SPEED
  );
  const leftPaddle = new Paddle(
    0,
    CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
    "white"
  );
  const rightPaddle = new Paddle(
    CANVAS_WIDTH - PADDLE_WIDTH,
    CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
    "white"
  );

  const router = useRouter();
  const userId = useRecoilValue(loggedUser);
  const startButtonRef = useRef<HTMLButtonElement | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [avatar, setAvatar] = useState("");
  const [username, setUsername] = useState("");
  const userTok = useRecoilValue(userToken);
  const [botPaddleSpeed, setBotPaddleSpeed] = useState(0);

  const leftArrowRef = useRef<HTMLButtonElement | null>(null);
  const rightArrowRef = useRef<HTMLButtonElement | null>(null);

  const addAchievement = async () => {
    try {
      const getedAchievements = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user-achievement/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userTok}`,
            "Content-Type": "application/json",
          },
        }
      );
      const achievements = await getedAchievements.json();

      const botAchievement = achievements.find(
        (a: any) => a.name === "AI Conqueror"
      );
      if (botAchievement && botAchievement.unlocked === false) {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user-achievement/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userTok}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            achivementName: "AI Conqueror",
            unlocked: true,
          }),
        });
      }
    } catch (error) {
      console.log("catched error: ", error);
    }
  };

  const fetchUserDatas = async (userId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userTok}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setUserData(data);
    } catch (error) {
      console.log("catched error: ", error);
    }
  };

  const handleQuit = () => {
    router.push("/play");
  };

  useEffect(() => {
    fetchUserDatas(userId);
  }, [userId]);

  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (botPaddleSpeed && gameStarted) {
      const controlButtons = document.querySelector(
        ".control-buttons"
      ) as HTMLDivElement;
      if (window.innerWidth < 769) {
        controlButtons.style.display = "flex";
      }
      if (window.innerWidth > 769) {
        controlButtons.style.display = "none";
      }
      window.addEventListener("resize", () => {
        if (window.innerWidth < 769) {
          controlButtons.style.display = "flex";
        }
      });

      window.addEventListener("resize", () => {
        if (window.innerWidth > 769) {
          controlButtons.style.display = "none";
        }
      });

      return () => {
        window.removeEventListener("resize", () => {
          if (window.innerWidth < 769) {
            controlButtons.style.display = "flex";
          }
        });
        window.removeEventListener("resize", () => {
          if (window.innerWidth > 769) {
            controlButtons.style.display = "none";
          }
        });
      };
    }
  }, [gameStarted, botPaddleSpeed, window?.innerWidth]);

  useEffect(() => {
    let gameInterval: NodeJS.Timeout;
    const handleStartGame = () => {
      const overlay = document.querySelector(".overlay") as HTMLDivElement;
      const resignButton = document.getElementById(
        "resign-button"
      ) as HTMLSpanElement;
      const message = document.getElementById("msg") as HTMLDivElement;
      const buttons = document.querySelector(
        ".level-button-container"
      ) as HTMLDivElement;
      const quitButton = document.querySelector(
        ".quit-game-button"
      ) as HTMLButtonElement;
      const scoreContainer = document.getElementById(
        "score-container"
      ) as HTMLDivElement;

      quitButton.style.display = "none";
      buttons!.style.display = "none";
      message.style.display = "block";
      message.innerHTML = "The game is starting...";
      setTimeout(() => {
        gameInterval = setInterval(gameLoop, 1000 / 60);
        resignButton.style.display = "block";
        overlay.style.display = "none";
        message.style.display = "none";
        scoreContainer.style.display = "flex";
        setGameStarted(true);
      }, 1000);
    };

    if (botPaddleSpeed) handleStartGame();

    const handleResign = () => {
      clearInterval(gameInterval);
      const overlay = document.querySelector(".overlay") as HTMLDivElement;
      const message = document.getElementById("msg") as HTMLDivElement;

      overlay.style.display = "block";
      message.style.display = "block";

      message.innerHTML = "You resigned the game.";

      let timer = 3;
      const resignInterval = setInterval(() => {
        message.innerHTML = `going back in ${timer} seconds...`;
        if (timer === 0) {
          router.push("/play");
          clearInterval(resignInterval);
        }
        timer--;
      }, 1000);
    };

    const resignButton = document.getElementById(
      "resign-button"
    ) as HTMLSpanElement;
    resignButton.addEventListener("click", handleResign);

    // game implementation here
    const canvas = canvasRef.current as HTMLCanvasElement | null;
    const ctx = canvas?.getContext("2d") as CanvasRenderingContext2D;

    canvas!.width = CANVAS_WIDTH;
    canvas!.height = CANVAS_HEIGHT;

    const canvasImage = new Image();
    canvasImage.src = table;
    canvasImage.onload = () => {
      ctx.drawImage(canvasImage, 0, 0, canvas!.width, canvas!.height);
    };

    const drawCircle = (
      x: number,
      y: number,
      r: number,
      color: string | CanvasGradient | CanvasPattern
    ) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2, false);
      ctx.closePath();
      ctx.fill();
    };

    const drawRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      color: string | CanvasGradient | CanvasPattern
    ) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    };

    const resetBall = (ball: Ball) => {
      ball.speed = BALL_SPEED;
      ball.dx = -BALL_DX * Math.sign(ball.dx);
      ball.dy = (Math.random() < 0.5 ? 1 : -1) * BALL_DY;
      ball.x = CANVAS_WIDTH / 2;
      ball.y = CANVAS_HEIGHT / 2;
    };

    const collision = (
      b: { x: number; y: number; raduis: number },
      p: { x: number; y: number; width: number; height: number }
    ) => {
      const x = Math.max(p.x, Math.min(b.x, p.x + p.width));
      const y = Math.max(p.y, Math.min(b.y, p.y + p.height));
      const distance = Math.sqrt((x - b.x) * (x - b.x) + (y - b.y) * (y - b.y));
      return distance < b.raduis;
    };

    const render = (ball: Ball, leftPaddle: Paddle, rightPaddle: Paddle) => {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      ctx.drawImage(canvasImage, 0, 0, canvas!.width, canvas!.height);
      drawRect(
        leftPaddle.x,
        leftPaddle.y,
        leftPaddle.width,
        leftPaddle.height,
        "white"
      );
      drawRect(
        rightPaddle.x,
        rightPaddle.y,
        rightPaddle.width,
        rightPaddle.height,
        "white"
      );
      drawCircle(ball.x, ball.y, ball.raduis, "white");
    };

    const update = (ball: Ball, leftPaddle: Paddle, rightPaddle: Paddle) => {
      if (ball.x < -ball.raduis) {
        rightPaddle.score++;
        setRightScore(rightPaddle.score);
        resetBall(ball);
        if (rightPaddle.score === WINNER_SCORE) {
          clearInterval(gameInterval);
          const overlay = document.querySelector(".overlay") as HTMLDivElement;
          const message = document.getElementById("msg") as HTMLDivElement;
          overlay.style.display = "block";
          message.style.display = "block";

          message.innerHTML =
            "You lost the game.<br /> going back to play page in <br />3 seconds...";

          let timer = 3;
          const resignInterval = setInterval(() => {
            message.innerHTML = `You lost the game.<br /> going back to play page in <br />${timer} seconds...`;
            if (timer === 0) {
              router.push("/play");
              clearInterval(resignInterval);
            }
            timer--;
          }, 1000);
        }
      } else if (ball.x > canvas!.width + ball.raduis) {
        leftPaddle.score++;
        setLeftScore(leftPaddle.score);
        resetBall(ball);
        if (leftPaddle.score === WINNER_SCORE) {
          clearInterval(gameInterval);
          const overlay = document.querySelector(".overlay") as HTMLDivElement;
          const message = document.getElementById("msg") as HTMLDivElement;
          overlay.style.display = "block";
          message.style.display = "block";

          message.innerHTML =
            "You won the game.<br /> going back to play page in <br />3 seconds...";

          let timer = 3;
          const resignInterval = setInterval(() => {
            message.innerHTML = `You won the game.<br /> going back to play page in <br />${timer} seconds...`;
            if (timer === 0) {
              router.push("/play");
              clearInterval(resignInterval);
            }
            timer--;
          }, 1000);
          if (hardLevel) addAchievement();
        }
      }

      ball.x += ball.dx;
      ball.y += ball.dy;

      if (ball.y - ball.raduis < 0 || ball.y + ball.raduis > canvas!.height) {
        ball.dy = -ball.dy;
      }

      const player = ball.x < canvas!.width / 2 ? leftPaddle : rightPaddle;
      if (collision(ball, player)) {
        let collidePoint = ball.y - (player.y + player.height / 2);
        collidePoint /= player.height / 2;

        let angleRad = (Math.PI / 4) * collidePoint;
        let direction = ball.x < canvas!.width / 2 ? 1 : -1;
        ball.dx = direction * ball.speed * Math.cos(angleRad);
        ball.dy = ball.speed * Math.sin(angleRad);
        if (ball.speed < 10) ball.speed += 0.5;
      }

      if ((keyState["ArrowUp"] || keyState["left"]) && leftPaddle.y > 0) {
        leftPaddle.y -= PADDLE_SPEED;
      } else if (
        (keyState["ArrowDown"] || keyState["right"]) &&
        leftPaddle.y + leftPaddle.height < canvas!.height
      ) {
        leftPaddle.y += PADDLE_SPEED;
      }

      // robot player
      if (rightPaddle.y + rightPaddle.height / 2 < ball.y - ball.raduis) {
        rightPaddle.y += botPaddleSpeed;
      } else if (
        rightPaddle.y + rightPaddle.height / 2 >
        ball.y + ball.raduis
      ) {
        rightPaddle.y -= botPaddleSpeed;
      }

      if (rightPaddle.y < 0) rightPaddle.y = 0;
      else if (rightPaddle.y + rightPaddle.height > CANVAS_HEIGHT)
        rightPaddle.y = CANVAS_HEIGHT - rightPaddle.height;
    };

    const gameLoop = () => {
      update(ball, leftPaddle, rightPaddle);
      render(ball, leftPaddle, rightPaddle);
    };

    const keyState: { [key: string]: boolean } = {};

    const handdleKeyDown = (e: KeyboardEvent | MouseEvent) => {
      if (e instanceof KeyboardEvent) {
        keyState[e.key] = true;
        if (e.key === "ArrowUp") {
          delete keyState["ArrowDown"];
        } else if (e.key === "ArrowDown") {
          delete keyState["ArrowUp"];
        }
      } else {
        const target = e.target as HTMLButtonElement;
        keyState[target.id] = true;
        if (target.id === "left") {
          delete keyState["right"];
        } else if (target.id === "right") {
          delete keyState["left"];
        }
      }
    };

    const handdleKeyUp = (e: KeyboardEvent | MouseEvent) => {
      if (e instanceof KeyboardEvent) {
        delete keyState[e.key];
      } else {
        const target = e.target as HTMLButtonElement;
        delete keyState[target.id];
      }
    };

    window.addEventListener("keydown", handdleKeyDown);
    window.addEventListener("keyup", handdleKeyUp);

    leftArrowRef.current?.addEventListener("mousedown", handdleKeyDown);
    leftArrowRef.current?.addEventListener("mouseup", handdleKeyUp);

    rightArrowRef.current?.addEventListener("mousedown", handdleKeyDown);
    rightArrowRef.current?.addEventListener("mouseup", handdleKeyUp);

    return () => {
      resignButton.removeEventListener("click", handleResign);
      clearInterval(gameInterval);

      window.removeEventListener("keydown", handdleKeyDown);
      window.removeEventListener("keyup", handdleKeyUp);

      leftArrowRef.current?.removeEventListener("mousedown", handdleKeyDown);
      leftArrowRef.current?.removeEventListener("mouseup", handdleKeyUp);

      rightArrowRef.current?.removeEventListener("mousedown", handdleKeyDown);
      rightArrowRef.current?.removeEventListener("mouseup", handdleKeyUp);
    };
  }, [botPaddleSpeed]);

  useEffect(() => {
    setAvatar(userData?.avatar);
    setUsername(userData?.username);
  }, [userData]);

  const [hardLevel, setHardLevel] = useState(false);
  useEffect(() => { }, [hardLevel]);

  useEffect(() => {
    const handleLevelChange = (e: MouseEvent) => {
      const target = e.target as HTMLButtonElement;
      if (target.classList.contains("easy-level-button")) {
        setBotPaddleSpeed(1);
      } else if (target.classList.contains("medium-level-button")) {
        setBotPaddleSpeed(2);
      } else if (target.classList.contains("hard-level-button")) {
        setBotPaddleSpeed(4);
        setHardLevel(true);
      }
    };

    const levelButtons = document.querySelectorAll(".level-button");
    levelButtons.forEach((levelButton) => {
      levelButton.addEventListener("click", handleLevelChange as EventListener);
    });
  }, []);

  return (
    <div className="game-container">
      <div className="canvas-container">
        <button onClick={() => setResign(true)} id="resign-button">
          {"Resign"}
          <Img
            priority={true}
            src="/game/resign.png"
            alt=""
            width={20}
            height={20}
          />
        </button>
        <div className="control-buttons">
          <button id="left" className="control-button" ref={leftArrowRef}>
            {"<"}
          </button>
          <button id="right" className="control-button" ref={rightArrowRef}>
            {">"}
          </button>
        </div>
        <div className="overlay"></div>
        <div id="msg"></div>
        <div className="level-button-container">
          <button className="easy-level-button level-button">Easy</button>
          <button className="medium-level-button level-button">Medium</button>
          <button className="hard-level-button level-button">Hard</button>
        </div>
        <button className="quit-game-button" onClick={handleQuit}>
          Quit
        </button>
        <div className="info-bar">
          <div className="left-player-info">
            <Img
              src={avatar ? avatar : defaultAvatar.src}
              alt=""
              width={50}
              height={50}
            />
            <span>{username}</span>
            <Img
              priority={true}
              id="faceLeft"
              src={leftFace}
              alt=""
              width={30}
              height={30}
            />
          </div>
          <div id="score-container">
            <span id="leftScore">{leftScore}</span>
            <span id="versus">VS</span>
            <span id="rightScore">{rightScore}</span>
          </div>
          <div className="right-player-info">
            <Img
              priority={true}
              id="faceRight"
              src={rightFace}
              alt=""
              width={30}
              height={30}
            />
            <span>robotPlayer</span>
            <Img src={robotPlayer.src} alt="" width={50} height={50} />
          </div>
        </div>
        <canvas id="canvas" ref={canvasRef}></canvas>
      </div>
    </div>
  );
}

export default function Robot() {
  return <RobotGame />;
}
