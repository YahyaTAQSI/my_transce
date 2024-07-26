import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
// import socket from "./gameSocket";
import requestImage from "../../public/game/send_arrow_icon.png";
import Link from "next/link";

import PulseLoader from "react-spinners/PulseLoader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useRecoilState, useRecoilValue } from "recoil";
import { loggedUser } from "../Atoms/logged";
import { userToken } from "../Atoms/userToken";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10000001;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const PopupCard = styled.div`
  font-family: "Poppins", sans-serif;
  z-index: 10000002;
  background-color: #2d2d31;
  border-radius: 15px;
  text-align: center;
  width: 420px;
  min-height: 400px;
  padding: 20px;
  color: white;

  h2 {
    font-size: 30px;
    position: relative;
    margin-bottom: 40px;

    &::after {
      content: "";
      position: absolute;
      width: 90%;
      height: 1px;
      background-color: #ffffffa3;
      left: 50%;
      bottom: -10px;
      transform: translate(-50%, 0);
    }
  }

  @media (max-width: 769px) {
    border-radius: 15px;
    width: 260px;
    min-height: 200px;
    padding: 10px;

    h2 {
      font-size: 20px;
      margin-bottom: 20px;
    }
  }
`;

const FriendList = styled.div`
  width: 100%;
  height: 250px;
  overflow: hidden;
  overflow-y: scroll;
  scrollbar-width: none;

  @media (max-width: 769px) {
    height: 150px;
  }
`;

const Friend = styled.li`
  list-style: none;
  display: flex;
  width: 100%;
  align-items: center;
  padding: 10px 20px;
  font-size: 20px;
  color: white;
  font-weight: 300;

  @media (max-width: 769px) {
    padding: 5px 10px;
    font-size: 15px;
    overflow: hidden;
  }
`;

const FriendLeftSide = styled.div`
  display: flex;
  justify-content: left;
  align-items: center;
  width: 100%;
`;

const FriendImg = styled.img`
  width: 60px;
  height: 60px;
  margin-right: 15px;

  @media (max-width: 769px) {
    width: 40px;
    height: 40px;
    margin-right: 15px;
  }
`;

const FriendButton = styled.button`
  background-color: #1ce14e;
  width: 50px;
  height: 35px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  &:hover {
    box-shadow: 0 0 3px 1px rgb(199, 225, 195);
  }

  img {
    width: 85%;
  }

  @media (max-width: 769px) {
    width: 40px;
    height: 25px;

    img {
      width: 85%;
    }
  }
`;

const CloseButton = styled.button`
  width: 30%;
  height: 35px;
  cursor: pointer;
  margin-top: 20px;
  border-radius: 10px;
  border: none;
  font-size: 20px;
  transition: background-color 0.5s, box-shadow 0.2s, color 0.3s;

  &:hover {
    box-shadow: 0 0 3px 1px rgb(199, 225, 195);
    background-color: #1ce14e;
    color: white;
    border: none;
  }

  @media (max-width: 769px) {
    width: 30%;
    height: 30px;
    margin-top: 10px;
  }
`;

const ToestContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  z-index: 10000003;
`;

import { useRouter, usePathname } from "next/navigation";
import { tablePicture } from "../Atoms/tablePicture";
import { gameModeVar } from "../Atoms/gameMode";
import "./play-page-style.css";
import { useSocket } from "../SubChildrens";
export default function Popup({ setShowPopup }: any) {
  const { socket } = useSocket();
  const [loadingStates, setLoadingStates] = useState<{
    [index: number]: boolean;
  }>({});
  // const [clicked, setClicked] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [userId, setUserId] = useRecoilState(loggedUser);
  const [userTok, setUserTok] = useRecoilState(userToken);
  const [responseIndex, setResponseIndex] = useState(-1);
  const [sendedRequestQueue, setSendedRequestQueue] = useState<number[]>([]);
  const [responseValue, setResponseValue] = useState(false);
  const table = useRecoilValue(tablePicture);

  const popupRef = useRef(null);
  const teastRef = useRef(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const getAllusers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/friends/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userTok}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      // console.log("all users ====> ", data);
      if (data?.statusCode === 401) return;
      setAllUsers(data);
    } catch (error) {
      console.log("catched error: ", error);
    }
  };
  const onlineFriends = allUsers.filter(
    (user: any) => user.status === "online"
  );
  const requestTimeouts = useRef<{ [index: number]: NodeJS.Timeout }>({});

  // const handleClickeOutsidePopup = (e: any) => {
  // 	if (popupRef.current && !(popupRef.current as HTMLElement).contains(e.target)) {
  // 		closePopup();
  // 	}
  // }

  // useEffect(() => {
  // 	document.addEventListener('mousedown', handleClickeOutsidePopup);
  // 	return () => {
  // 		document.removeEventListener('mousedown', handleClickeOutsidePopup);
  // 	}
  // }, []);

  useEffect(() => {
    getAllusers();
    return () => {
      // Clear all request timeouts when component unmounts
      Object.values(requestTimeouts.current).forEach(clearTimeout);
    };
  }, []);

  const closeBtn = closeButtonRef.current;
  if (Object.values(loadingStates).includes(true)) {
    if (closeBtn) {
      closeBtn.classList.add("disable-btn");
    }
  } else {
    if (closeBtn) {
      closeBtn.classList.remove("disable-btn");
    }
  }

  const closePopup = () => {
    if (Object.values(loadingStates).includes(true)) return;

    setShowPopup(false);

    // Clear all request timeouts when popup is closed
    Object.values(requestTimeouts.current).forEach(clearTimeout);
  };

  const sendGameReq = (opponentId: number, index: number) => {
    if (loadingStates[index]) return;
    if (!socket) return;

    setSendedRequestQueue((prevQueue) => [...prevQueue, opponentId]);
    console.log(`sendedRequestQueue: ${sendedRequestQueue}`);
    const timeout = setTimeout(() => {
      console.log(
        `Request timeout for opponentId: ${opponentId}, index: ${index}`
      );
      setSendedRequestQueue((prevQueue) =>
        prevQueue.filter((id) => id !== opponentId)
      );
      setLoadingStates((prevState) => ({
        ...prevState,
        [index]: false,
      }));
    }, 10000);

    requestTimeouts.current[index] = timeout;

    socket.emit("game_request", {
      userId: userId,
      opponentId: opponentId,
      index: index,
      table: table,
    });
    console.log(`opponentId: ${opponentId}, index: ${index}`);
    console.log(`Sending game request to ${opponentId}`);

    socket
      .off("game_response_response")
      .on(
        "game_response_response",
        ({
          accepted,
          index,
          id,
        }: {
          accepted: boolean;
          index: number;
          id: number;
        }) => {
          setResponseIndex(index);
          setResponseValue(accepted);
          if (accepted) {
            console.log(`Game request accepted from ${id}`);
            toast.success(`Game request accepted from ${id}`);
          } else {
            console.log(`Game rejected from ${id}`);
            toast.error(`Game rejected from ${id}`);
          }

          socket.emit("remove_notification", {
            userId: userId,
            opponentId: id,
          });

          setLoadingStates((prevState) => ({
            ...prevState,
            [index]: false,
          }));
          clearTimeout(requestTimeouts.current[index]);
        }
      );

    setLoadingStates((prevState) => ({
      ...prevState,
      [index]: true,
    }));
  };

  useEffect(() => {
    if (!socket) return;

    if (responseValue) {
      socket.emit("remove_sended_request", {
        sendedRequestQueue: sendedRequestQueue,
      });
      setSendedRequestQueue([]);
    }
  }, [responseValue]);

  // const router = useRouter();
  const [, setGameMode] = useRecoilState(gameModeVar);

  useEffect(() => {
    if (!socket) return;
    socket.on("go_to_game", (opponentId: number) => {
      setGameMode("friend");
    });

    return () => {
      socket.off("go_to_game");
    };
  }, []);

  useEffect(() => {
    socket?.on("update_friend_list_game", () => {
      getAllusers();
    });

    return () => {
      socket?.off("update_friend_list_game");
    };
  }, [allUsers]);

  return (
    <>
      <ToestContainer ref={teastRef}>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        // theme="colored"
        />
      </ToestContainer>
      <Overlay>
        <PopupCard ref={popupRef}>
          <h2>Available Friends</h2>
          <FriendList>
            {onlineFriends.map(
              (
                friend: { uid: number; avatar: string; username: string },
                index: number
              ) => {
                return (
                  <Friend key={friend.uid}>
                    <FriendLeftSide>
                      <FriendImg src={friend.avatar} alt="" />
                      <p>{friend.username}</p>
                    </FriendLeftSide>
                    <FriendButton
                      onClick={() => {
                        sendGameReq(friend.uid, index);
                      }}
                    >
                      {loadingStates[index] ? (
                        <PulseLoader
                          color="#ffffff"
                          size={7}
                          loading={true}
                          speedMultiplier={0.8}
                        />
                      ) : (
                        <img src={requestImage.src} alt="" />
                      )}
                    </FriendButton>
                  </Friend>
                );
              }
            )}
          </FriendList>
          <CloseButton ref={closeButtonRef} onClick={closePopup}>
            Close
          </CloseButton>
        </PopupCard>
      </Overlay>
    </>
  );
}
