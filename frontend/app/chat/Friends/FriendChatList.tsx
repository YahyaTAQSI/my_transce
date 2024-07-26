"use client";
import React, { useEffect, useRef, useState } from "react";
import "./FriendChatList.css";
import { BiSolidJoystickAlt } from "react-icons/bi";
import { IoIosSend } from "react-icons/io";
import Image from "next/image";
import { IoArrowBackOutline } from "react-icons/io5";
import { useRecoilState, useRecoilValue } from "recoil";
import { ChatContainer } from "./ChatContainer";
import { slctdFriend } from "@/app/Atoms/friendAtom";

import { currentFriend } from "@/app/Atoms/currentFriend";
import { loggedUser } from "@/app/Atoms/logged";
import { userToken } from "@/app/Atoms/userToken";

import { RiEmojiStickerFill } from "react-icons/ri";

import Picker, { SuggestionMode, Theme } from "emoji-picker-react";

import { loadingMsg } from "@/app/Atoms/loadingMsg";
import ChatLoading from "./ChatLoading";
import { channelId } from "@/app/Atoms/channelId";
import { chatMSG } from "@/app/Atoms/chatMSG";
import { blockedMe } from "@/app/Atoms/blockedMe";
import { useSocket } from "@/app/SubChildrens";
import { tablePicture } from "@/app/Atoms/tablePicture";

const FriendChatList = () => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const loggedU = useRecoilValue(loggedUser);
  const userTok = useRecoilValue(userToken);
  const channelID = useRecoilValue(channelId);
  const friend = useRecoilValue(currentFriend);

  const blockCheck = useRecoilValue(blockedMe);

  const [friendChat, setFriendChat] = useRecoilState<any[]>(chatMSG);

  const [selectedFriend, setSelectedFriend] = useRecoilState(slctdFriend);
  const [inputMSG, setInputMSG] = useState<string>("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loadingAnimation, setLoadingAnimation] = useRecoilState(loadingMsg);

  const isOnline = friend?.status === "online";

  const isIngame = friend?.status === "ingame";
  const isOffline = friend?.status === "offline";

  const onEmojiClick = (event: any) => {
    setInputMSG((prevInput) => prevInput + event.emoji);
  };

  const getAllMSG = async () => {
    if (selectedFriend === -1) return;

    const selectedFriendChat = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/message/${channelID}`,
      {
        headers: {
          Authorization: `Bearer ${userTok}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await selectedFriendChat.json();

    setFriendChat(data);
    setTimeout(() => {
      setLoadingAnimation(false);
    }, 1000);
  };

  useEffect(() => {
    if (selectedFriend === -1) return;
    getAllMSG();
    setInputMSG("");
  }, [selectedFriend]);

  const sendMSG = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("lolololo1");

    if (inputMSG.length === 0) return;
    console.log("lolololo1");
    const channelData = {
      userID: loggedU,
      channelID: channelID,
      content: inputMSG,
      isBlocked: blockCheck,
    };
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/message`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userTok}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(channelData),
    });
    setInputMSG("");
    setShowEmoji(false);
  };
  const handleEnter = async (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMSG(e);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [friendChat, loadingAnimation]);

  /* game req */
  const { socket } = useSocket();
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const table = useRecoilValue(tablePicture);
  const sendGameReq = () => {
    console.log("3aaaaaaa");

    if (!socket) return;

    socket.emit("game_request", {
      userId: loggedU,
      opponentId: friend.uid,
      index: -1,
      table: table,
    });

    if (playButtonRef.current) {
      playButtonRef.current.style.cursor = "not-allowed";
      playButtonRef.current.style.opacity = "0.1";
    }

    socket!.off("in_the_queue").on("in_the_queue", () => {
      setTimeout(() => {
        if (playButtonRef.current) {
          playButtonRef.current.style.cursor = "pointer";
          playButtonRef.current.style.opacity = "1";
        }
      }, 10000);
    });

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
          playButtonRef.current!.style.cursor = "pointer";
          playButtonRef.current!.style.opacity = "1";

          socket.emit("remove_notification", {
            userId: loggedU,
            opponentId: id,
          });
        }
      );
  };
  /* game req */

  return loadingAnimation ? (
    <ChatLoading />
  ) : (
    <div className="friend_chat_msg">
      <div className="friend_chat_msg_header">
        <IoArrowBackOutline
          className="arrow_back"
          onClick={() => setSelectedFriend(-1)}
        />

        <Image
          className="my_chat_msg_avatar"
          src={`${friend?.avatar}`}
          width={200}
          height={200}
          alt="avatar"
        />
        <div className="my_chat_msg_name">
          <h1>{friend?.username}</h1>
          <h5
            className={`online ${isIngame && "ingames"}
          ${isOffline && "offline"}
          `}
          >
            {isOnline ? "Online" : isIngame ? "Playing" : "Offline"}
          </h5>
        </div>
      </div>
      <div ref={chatContainerRef} className="friend_chat_msg_body">
        {friendChat.map((m: any) => (
          <ChatContainer key={m.createdAT} messages={m} />
        ))}
      </div>
      <form onSubmit={sendMSG} className="friend_chat_msg_form">
        <fieldset disabled={friend?.blocked}>
          <div
            className="closed_picker"
            onClick={() => setShowEmoji((prev) => !prev)}
          >
            <RiEmojiStickerFill />
          </div>
          <Picker
            emojiVersion="facebook"
            theme={Theme.DARK}
            className={`emoji_picker ${showEmoji && "show_Emoji"} `}
            searchDisabled={true}
            open={true}
            onEmojiClick={onEmojiClick}
            lazyLoadEmojis={true}
            suggestedEmojisMode={SuggestionMode.FREQUENT}
            previewConfig={{
              showPreview: false,
            }}
          />

          <textarea
            rows={1}
            value={inputMSG}
            onKeyDown={handleEnter}
            onChange={(e) => setInputMSG(e.target.value)}
            className="input_msg"
            placeholder={`${friend?.blocked ? "You blocked this friend" : "Message"
              }`}
          />

          <div className="play_send_msg">
            <button
              ref={playButtonRef}
              onClick={sendGameReq}
              disabled={isOffline || isIngame}
              className={`submit_msg ${(isOffline || isIngame) && "disable_play"
                }`}
              type="button"
            >
              <BiSolidJoystickAlt />
            </button>
            <button
              onClick={() => {
                console.log("lol");
              }}
              className="submit_msg"
              type="submit"
            >
              <IoIosSend />
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default FriendChatList;
