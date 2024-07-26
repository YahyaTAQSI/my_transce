import Img from "next/image";
import { use, useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { gameModeVar } from "../Atoms/gameMode";
import { loggedUser } from "../Atoms/logged";
import { userToken } from "../Atoms/userToken";
import defaultAvatar from "@/public/default.png";
import { tablePicture } from "../Atoms/tablePicture";
import "./pingPong.css";
import { useRouter } from "next/navigation";
import { useSocket } from "../SubChildrens";

export class Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  score: number = 0;
  color: string;

  constructor(x: number, y: number, width: number, height: number, color: string) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.score = 0;
    this.color = color;
  }
}

export class Ball {
  x: number;
  y: number;
  raduis: number;
  dx: number;
  dy: number;
  speed: number = 5;

  constructor(
    x: number,
    y: number,
    raduis: number,
    dx: number,
    dy: number,
    speed: number
  ) {
    this.x = x;
    this.y = y;
    this.raduis = raduis;
    this.dx = dx;
    this.dy = dy;
    this.speed = speed;
  }
}

export function PingPong() {
  const { socket } = useSocket();
  const [buttonText, setButtonText] = useState("");
  const [gameMode, setGameMode] = useRecoilState(gameModeVar);
  const userId = useRecoilValue(loggedUser);
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);
  const [leftPlayer, setLeftPlayer] = useState("");
  const [rightPlayer, setRightPlayer] = useState("");
  const [leftAvatar, setLeftAvatar] = useState("");
  const [rightAvatar, setRightAvatar] = useState("");
  const [leftFace, setLeftFace] = useState("/game/happy.png");
  const [rightFace, setRightFace] = useState("/game/happy.png");
  const userTok = useRecoilValue(userToken);

  const leftArrowRef = useRef<HTMLButtonElement | null>(null);
  const rightArrowRef = useRef<HTMLButtonElement | null>(null);

  function joinQueue() {
    if (!socket) return;
    socket.emit("join_queue", { userId: userId });

    const startButton = document.querySelector(
      ".start-game-button"
    ) as HTMLButtonElement;
    startButton.style.display = "none";

    const message = document.getElementById("msg") as HTMLDivElement;
    message.innerHTML = "Waiting for another player...";
  }

  const readyToStart = () => {
    if (!socket) return;
    socket.emit("ready", { userId: userId });

    const startButton = document.querySelector(
      ".start-game-button"
    ) as HTMLButtonElement;
    startButton.style.display = "none";

    const msg = document.querySelector("#msg") as HTMLDivElement;
    msg.innerHTML = "Waiting for your friend to be ready...";
  };

  const resign = () => {
    if (!socket) return;
    socket.emit("resign", { userId: userId });
  };

  const fetchUserDatas = async (userId: number, opponentId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userTok}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setLeftPlayer(data.username);
      setLeftAvatar(data.avatar);

      const res2 = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${opponentId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userTok}`,
          "Content-Type": "application/json",
        },
      });
      const data2 = await res2.json();
      setRightPlayer(data2.username);
      setRightAvatar(data2.avatar);
    } catch (error) {
      console.log("catched error: ", error);
    }
  };

  useEffect(() => {
    if (gameMode === "random") {
      setButtonText("Join Queue");
    } else if (gameMode === "friend") {
      setButtonText("Ready");
    }
  }, [gameMode]);

  const Quit = () => {
    if (!socket) return;

    setGameMode("");
    socket.emit("quit", { userId });
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("update_score", (rightScore: number, leftScore: number) => {
      setLeftScore(leftScore);
      setRightScore(rightScore);
      if (leftScore > rightScore) {
        setLeftFace("/game/happy.png");
        setRightFace("/game/sad.png");
      } else if (leftScore < rightScore) {
        setLeftFace("/game/sad.png");
        setRightFace("/game/happy.png");
      } else {
        setLeftFace("/game/happy.png");
        setRightFace("/game/happy.png");
      }
    });
    return () => {
      socket.off("update_score");
    };
  }, [leftScore, rightScore]);

  const canvasRef = useRef(null);
  const table = useRecoilValue(tablePicture);
  const router = useRouter();
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const canvas = canvasRef.current as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;
    canvas.width = 1000;
    canvas.height = 500;

    // canvas.style.backgroundImage = `url(${table})`;
    const canvasImage = new Image();
    canvasImage.src = table;
    canvasImage.onload = () => {
      ctx.drawImage(canvasImage, 0, 0, canvas!.width, canvas!.height);
    };

    if (gameMode === "random") {
      socket.on(
        "start_game",
        (payBall, paddle1, paddle2, { userId, opponentId }) => {
          randerGame(payBall, paddle1, paddle2);
          fetchUserDatas(userId, opponentId);
          setGameStarted(true);
        }
      );
    } else if (gameMode === "friend") {
      socket.on(
        "start_friend_game",
        (payBall, paddle1, paddle2, { userId, opponentId }) => {
          randerGame(payBall, paddle1, paddle2);
          fetchUserDatas(userId, opponentId);
          setGameStarted(true);
        }
      );
    }

    socket.on("game_over", (winner: string) => {
      const message = document.getElementById("msg") as HTMLDivElement;
      const overlay = document.querySelector(".overlay") as HTMLDivElement;
      const resignButton = document.getElementById(
        "resign-button"
      ) as HTMLSpanElement;
      message.style.display = "block";
      overlay.style.display = "block";
      resignButton.style.display = "none";
      message.innerHTML = winner;

      let count = 5;
      const interval = setInterval(() => {
        message.innerHTML = `Going back in ${count} seconds...`;
        if (count === 0) {
          clearInterval(interval);
          setGameMode("");
          setLeftScore(0);
          setRightScore(0);
          setLeftFace("/game/happy.png");
          setRightFace("/game/happy.png");
        }
        count--;
      }, 1000);
    });

    socket.on(
      "update",
      (ball: Ball, leftPaddle: Paddle, rightPaddle: Paddle) => {
        randerGame(ball, leftPaddle, rightPaddle);
        setGameStarted(true);
      }
    );

    function randerGame(ball: Ball, leftPaddle: Paddle, rightPaddle: Paddle) {
      const message = document.getElementById("msg") as HTMLDivElement;
      const startButton = document.querySelector(
        ".start-game-button"
      ) as HTMLButtonElement;
      const overlay = document.querySelector(".overlay") as HTMLDivElement;
      const resignButton = document.getElementById(
        "resign-button"
      ) as HTMLSpanElement;
      const quitButton = document.querySelector(
        ".quit-game-button"
      ) as HTMLButtonElement;
      quitButton.style.display = "none";
      message.style.display = "none";
      startButton.style.display = "none";
      overlay.style.display = "none";
      resignButton.style.display = "block";

      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(canvasImage, 0, 0, canvas!.width, canvas!.height);
      drawRect(
        leftPaddle.x,
        leftPaddle.y,
        leftPaddle.width,
        leftPaddle.height,
        leftPaddle.color
      );
      drawRect(
        rightPaddle.x,
        rightPaddle.y,
        rightPaddle.width,
        rightPaddle.height,
        rightPaddle.color
      );
      drawCircle(ball.x, ball.y, ball.raduis, "white");
    }

    function drawRect(
      x: number,
      y: number,
      w: number,
      h: number,
      color: string | CanvasGradient | CanvasPattern
    ) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    }

    function drawCircle(
      x: number,
      y: number,
      r: number,
      color: string | CanvasGradient | CanvasPattern
    ) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2, false);
      ctx.closePath();
      ctx.fill();
    }

    socket.on("quited", (uId: number) => {
      if (userId === uId) {
        console.log("uId: ", uId);
        setGameMode("");
        return;
      }
      const startButton = document.querySelector(
        ".start-game-button"
      ) as HTMLButtonElement;
      const message = document.getElementById("msg") as HTMLDivElement;
      const quitButton = document.querySelector(
        ".quit-game-button"
      ) as HTMLButtonElement;
      startButton!.style.display = "none";
      quitButton!.style.display = "none";
      message!.innerHTML = "Your friend has quited the game.";
      let count = 3;
      const interval = setInterval(() => {
        message.innerHTML = `Going back in ${count} seconds...`;
        if (!count) {
          clearInterval(interval);
          setGameMode("");
        }
        count--;
      }, 1000);
    });

    return () => {
      socket.off("start_game");
      socket.off("game_over");
      socket.off("update");
      socket.off("start_friend_game");
      socket.off("moveBall");
      socket.off("quited");
    };
  }, []);

  useEffect(() => {
    if (gameStarted) {
      const scoreContainer = document.getElementById(
        "score-container"
      ) as HTMLDivElement;
      const controlButtons = document.querySelector(
        ".control-buttons"
      ) as HTMLDivElement;

      if (window.innerWidth < 789) {
        scoreContainer!.style.display = "flex";
        controlButtons!.style.display = "flex";
      } else {
        controlButtons!.style.display = "none";
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
  }, [gameStarted, window.innerWidth]);

  useEffect(() => {
    if (gameStarted) {
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
      rightArrowRef.current?.addEventListener("mousedown", handdleKeyDown);
      leftArrowRef.current?.addEventListener("mouseup", handdleKeyUp);
      rightArrowRef.current?.addEventListener("mouseup", handdleKeyUp);

      const moveBallAndPaddle = () => {
        if (!socket) return;

        if (keyState["ArrowUp"] || keyState["left"]) {
          socket.emit("movePaddle", { userId: userId, keyCode: "up" });
        } else if (keyState["ArrowDown"] || keyState["right"]) {
          socket.emit("movePaddle", { userId: userId, keyCode: "down" });
        }
      };

      const interval = setInterval(moveBallAndPaddle, 1000 / 60);

      return () => {
        clearInterval(interval);
        window.removeEventListener("keydown", handdleKeyDown);
        window.removeEventListener("keyup", handdleKeyUp);

        leftArrowRef.current?.removeEventListener("mousedown", handdleKeyDown);
        rightArrowRef.current?.removeEventListener("mousedown", handdleKeyDown);

        leftArrowRef.current?.removeEventListener("mouseup", handdleKeyUp);
        rightArrowRef.current?.removeEventListener("mouseup", handdleKeyUp);
      };
    }
  }, [gameStarted]);

  return (
    <div className="game-container">
      <div className="canvas-container">
        <div className="control-buttons">
          <button id="left" className="control-button" ref={leftArrowRef}>
            {"<"}
          </button>
          <button id="right" className="control-button" ref={rightArrowRef}>
            {">"}
          </button>
        </div>
        <button id="resign-button" onClick={resign}>
          {"Resign"}
          <Img
            priority={false}
            src="/game/resign.png"
            alt=""
            width={20}
            height={20}
          />
        </button>
        <div className="overlay"></div>
        <div id="msg"></div>
        <button
          className="start-game-button"
          onClick={gameMode === "random" ? joinQueue : readyToStart}
        >
          {buttonText}
        </button>
        <button className="quit-game-button" onClick={Quit}>
          Quit
        </button>
        <div className="info-bar">
          <div className="left-player-info">
            <Img
              priority={false}
              id=""
              src={leftAvatar ? leftAvatar : defaultAvatar}
              alt=""
              width={50}
              height={50}
            />
            <span>{leftPlayer}</span>
            <Img
              priority={false}
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
              priority={false}
              id="faceRight"
              src={rightFace}
              alt=""
              width={30}
              height={30}
            />
            <span>{rightPlayer}</span>
            <Img
              priority={false}
              id=""
              src={rightAvatar ? rightAvatar : defaultAvatar}
              alt=""
              width={50}
              height={50}
            />
          </div>
        </div>
        <canvas id="canvas" ref={canvasRef}></canvas>
      </div>
    </div>
  );
}
