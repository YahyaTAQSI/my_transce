"use client";
import { loggedUser } from "./Atoms/logged";
import UpperNav from "./upper-navbar/upper-navbar";
import { useRecoilState, useRecoilValue } from "recoil";
import { useRouter, usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";

import GameRequestPopup from "./play/GameRequestPopup";
import { gameRequest } from "./Atoms/gameRequest";
import { socket as mySocket } from "./sockets/socket";
import { gameResponse } from "./Atoms/gameRespose";

import { gameModeVar } from "./Atoms/gameMode";
import { userToken } from "./Atoms/userToken";
import { tablePicture } from "./Atoms/tablePicture";

import { Socket } from "socket.io-client";
import Nav from "./Nav/Nav";

/*---------- sokcets ---------------*/
interface SocketContextProps {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextProps | undefined>(undefined);
/*---------- sokcets ---------------*/

export default function SubChildrens({
  children,
}: {
  children: React.ReactNode;
}) {
  const [uid, setUid] = useState(-1);
  const user = useRecoilValue(loggedUser);
  const token = useRecoilValue(userToken);
  const router = useRouter();
  const pathname = usePathname();

  /*---------- sokcets ---------------*/
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketIo = mySocket;

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, []);
  /*---------- sokcets ---------------*/

  useEffect(() => {
    setUid(user);
  }, [user]);

  useEffect(() => {
    user === -1 && router.replace("/login");
    // user !== -1 && pathname === "/login" && router.push("/");
  }, [user, pathname]);

  const changeUserStatus = async () => {
    if (user === -1) return;
    const body = {
      status: "online",
    };
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/status/${user}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      console.log("3a", error);
    }
  };

  useEffect(() => {
    changeUserStatus();
  }, [user]);
  /*--------online online---------*/
  /*----------------------------------------------------------------------------------------------------------*/
  /*----------game shit----------*/

  const [gameRequestValue, setGameRequestValue] = useRecoilState(gameRequest);
  const [gameResponseValue, setGameResponseValue] =
    useRecoilState(gameResponse);
  const [gameRequestQueue, setGameRequestQueue] = useState<number[]>([]);
  const [index, setIndex] = useState(-1);
  const [, setTable] = useRecoilState(tablePicture);

  useEffect(() => {
    if (user !== -1) {
      if (!socket) return;
      console.log("-------------------------sokt");

      socket.emit("new_user", { userId: user });
      socket.on(
        "game_request_request",
        ({
          opponentId: opponentId,
          index,
          table,
        }: {
          opponentId: number;
          index: number;
          table: string;
        }) => {
          console.log(`Game request from ${opponentId}`);
          setGameRequestQueue((prevQueue) => [...prevQueue, opponentId]);
          setIndex(index);
          setTable(table);
        }
      );

      socket.on("remove_notification", () => {
        console.log("remove_notification event received");
        setGameRequestQueue((prevQueue) => prevQueue.slice(1));
        setGameRequestValue(-1);
        setGameResponseValue(0);
      });

      return () => {
        socket.off("new_user");
        socket.off("game_request_request");
        socket.off("remove_notification");
      };
    }
  }, [user, socket]);

  useEffect(() => {
    if (gameRequestQueue.length > 0) {
      setGameRequestValue(gameRequestQueue[0]);
      socket?.emit("in_the_queue", { opponentId: gameRequestQueue[0] });
    }
  }, [gameRequestQueue]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameRequestQueue.length > 0) {
        setGameRequestQueue((prevQueue) => prevQueue.slice(1));
        setGameRequestValue(-1);
        setGameResponseValue(0); // Reset gameResponseValue to ensure the last request receives a response
      }
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [gameRequestQueue, socket]);

  const [gameMode, setGameMode] = useRecoilState(gameModeVar);

  useEffect(() => {
    if (gameResponseValue) {
      if (!socket) return;
      const accepted =
        gameResponseValue === 1 ? true : gameResponseValue === 2 ? false : null;
      socket.emit("game_response", {
        userId: gameRequestValue,
        opponentId: user,
        accepted: accepted,
        index: index,
      });
      setGameRequestValue(-1);
      setGameResponseValue(0);
      if (accepted) {
        setGameRequestQueue([]); // remove all other requests from the queue
        setGameMode("friend");
        router.push("/play");
        socket.emit("go_to_game", {
          userId: user,
          opponentId: gameRequestValue,
        });
      }
    }
  }, [gameResponseValue, socket]);

  useEffect(() => {
    if (!socket) return;
    socket.on("go_to_game", (opponentId: number) => {
      setGameMode("friend");

      router.push("/play");
    });

    socket.on("go_to_random_game", () => {
      setGameMode("random");
      router.push("/play");
      console.log("go to random game event received");
    });

    return () => {
      socket.off("go_to_game");
      socket.off("go_to_random_game");
    };
  }, [socket]);

  useEffect(() => {
    if (gameRequestQueue.length > 0) {
      setGameRequestValue(gameRequestQueue[0]);
    } else {
      setGameRequestValue(-1);
    }
  }, [gameRequestQueue, gameRequestValue, socket]);
  useEffect(() => {
    if (gameRequestQueue.length > 0) {
      if (gameRequestQueue[0] === undefined) {
        setGameRequestQueue((prevQueue) => prevQueue.slice(1));
        setGameRequestValue(-1);
        return;
      }
      setGameRequestValue(gameRequestQueue[0]);
    } else {
      setGameRequestValue(-1);
    }
  }, [gameRequestQueue, gameRequestValue, socket]);

  /*-------game shit------*/
  return (
    <>
      {uid !== -1 && <Nav />}

      <div className="upperNav-children-container">
        <SocketContext.Provider value={{ socket }}>
          {uid !== -1 && <UpperNav />}
          {gameRequestValue !== -1 && <GameRequestPopup />}
          {children}
        </SocketContext.Provider>
      </div>
    </>
  );
}
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
