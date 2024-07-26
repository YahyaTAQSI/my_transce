import { loggedUser } from "../Atoms/logged";
import { useRecoilState, useRecoilValue } from "recoil";
import { gameRequest } from "../Atoms/gameRequest";
import { gameResponse } from "../Atoms/gameRespose";
import { useEffect, useState } from "react";

import { userToken } from "../Atoms/userToken";

import "../play/play-page-style.css";

export default function GameRequestPopup() {
  const [gameResponseValue, setGameResponseValue] =
    useRecoilState(gameResponse);
  const [gameRequestValue, setGameRequestValue] = useRecoilState(gameRequest);
  const userTok = useRecoilValue(userToken);
  const [username, setUsername] = useState("");

  const fetchUserDatas = async (userId: number) => {
    try {
      if (userId === undefined) return;
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userTok}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setUsername(data.username);
    } catch (error) {
      console.log("catched error: ", error);
    }
  };

  useEffect(() => {
    if (gameRequestValue !== -1) {
      fetchUserDatas(gameRequestValue);
    }
  }, [gameRequestValue]);

  const handleAccept = () => {
    setGameResponseValue(1);
  };

  const handleReject = () => {
    setGameResponseValue(2);
  };

  return (
    <div className={"game-request-popup-container "}>
      <h3>Apex Pong Battle</h3>
      Would you like to play with:
      <div className="request-from-player"> {username} </div>
      <div className="game-request-popup-buttons">
        <button className="accept-button" onClick={handleAccept}>
          Accept
        </button>
        <button className="decline-button" onClick={handleReject}>
          Decline
        </button>
      </div>
    </div>
  );
}
