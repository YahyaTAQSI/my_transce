"use client";
import React, { useEffect, useState } from "react";
import "./chat.css";
import Image from "next/image";
import { HiDotsVertical } from "react-icons/hi";
import FriendsChat from "./Friends/FriendsChat";
import ChannelChat from "./Channels/channelChat";
import SelectedChannelChat from "./Channels/SelectedChannelChat";
import { MdOutlineCancel } from "react-icons/md";
import FriendChatList from "./Friends/FriendChatList";
import { slctdFriend } from "../Atoms/friendAtom";
import { useRecoilState } from "recoil";
import ChannelInfo from "./Channels/channelInfo";
import { FriendInfo } from "./Friends/FriendInfo";
import PopupCreateChannel from "./Channels/popupCreateChannel";
import AddFriendSection from "./Friends/AddFriendSection";
import LoadingPaddle from "../LoadingPaddle";
import { loggedUser } from "../Atoms/logged";
import { useRecoilValue } from "recoil";
import { userToken } from "@/app/Atoms/userToken";

import PopupSearchChannels from "./Channels/popupSearchChannels";
import { useSocket } from "../SubChildrens";

import { motion } from "framer-motion";
import { channelId } from "../Atoms/channelId";

interface channelInterface {
  id: number;
  name: string;
  topic: string;
  type: string;
  uri: string;
  roles: any[];
}

const Chat = () => {
  const { socket } = useSocket();
  const [hide, setHide] = useState(false);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState("friends");
  const [selectedFriend, setSelectedFriend] = useRecoilState(slctdFriend);
  const [selectedChannel, setSelectedChannel] = useState<number>(-1);
  const [showPopUpCreateChannel, setShowPopUpCreateChannel] = useState(false);
  const [showPopUpSearchChannels, setShowPopUpSearchChannels] = useState(false);
  const [dmID, setDMID] = useRecoilState(channelId);

  const selectedBtn = mode === "friends" ? "toleft" : "toright";

  const userId = useRecoilValue(loggedUser);
  const userTok = useRecoilValue(userToken);
  const [channels, setChannels] = useState<channelInterface[]>();

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        console.log("BLABLABLA");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/channelss/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${userTok}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response) {
          console.log("Error");
        }
        const data = await response.json();
        console.log("DAAAATAAAA:", data);
        const channelsArr = data.map((data: any) => data.channels);
        console.log("channelsArr:", channelsArr);
        setChannels(channelsArr);
      } catch (error) {
        console.log("Error");
      }
    };
    fetchChannels();
    if (!socket) return;
    socket.on("updateUsersAfterSomeoneKick", fetchChannels);
    socket.on("updateChannels", fetchChannels);
    socket.on("updateRoles", fetchChannels);
    return () => {
      socket.off("updateUsersAfterSomeoneKick");
      socket.off("updateChannels");
      socket.off("updateRoles");
    };
  }, [socket]);

  const preventCHilde = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleParentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setHide(false);
  };

  setTimeout(() => {
    setLoading(false);
  }, 1500);

  let tabs = [
    { id: "friends", label: "friends" },
    { id: "channels", label: "channels" },
  ];
  let [activeTab, setActiveTab] = useState(tabs[0].id);

  return loading ? (
    <LoadingPaddle />
  ) : (
    <div className="chat_channels_container">
      <div className="chat_channels_sub_container">
        <div
          className={`createChannelPopup ${showPopUpCreateChannel ? "showPopup" : "hidePopUp"
            }`}
        >
          <PopupCreateChannel
            userId={userId}
            setShowPopUpCreateChannel={setShowPopUpCreateChannel}
          />
        </div>
        <div
          className={`createChannelPopup ${showPopUpSearchChannels ? "showPopup" : "hidePopUp"
            }`}
        >
          <PopupSearchChannels
            setSelectedChannel={setSelectedChannel}
            userId={userId}
            setShowPopUpSearchChannels={setShowPopUpSearchChannels}
          />
        </div>
        <div
          className={`col1 ${(selectedFriend !== -1 || selectedChannel > 0) && "hideCol1"
            }  `}
        >
          <div className="switcher">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMode(tab.label);
                  if (tab.label === "channels") {
                    setSelectedFriend(-1);
                    setDMID(-1);
                  }
                }}
                className="theparentButton"
              >
                {activeTab === tab.id && (
                  <motion.span
                    layoutId="underline"
                    className="selectedColor"
                    transition={{
                      duration: 0.3,
                    }}
                  />
                )}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* <div className="switcher">
            <button
              onClick={() => {
                setMode("friends");
              }}
            >
              Friends
            </button>
            <button
              onClick={() => {
                setMode("channels");
                setSelectedFriend(-1);
              }}
            >
              Channels
            </button>
            <span className={`selectedColor ${selectedBtn}`}></span>
          </div> */}
          {/* show friends list or channels list */}
          {mode == "friends" ? (
            <div className="friendsList">
              <FriendsChat />
            </div>
          ) : (
            <div className="channelsList">
              <ChannelChat
                channels={channels}
                setSelectedChannel={setSelectedChannel}
                setShowPopUpCreateChannel={setShowPopUpCreateChannel}
                setShowPopUpSearchChannels={setShowPopUpSearchChannels}
              />
            </div>
          )}
        </div>
        <div
          className={`col2 ${(selectedFriend !== -1 || selectedChannel > 0) && "showCol2"
            }  `}
        >
          {/* show selected friend chat or selected channel chat */}
          {mode == "friends" && selectedFriend != -1 ? (
            <div className="selectedFriendChat">
              <FriendChatList />
            </div>
          ) : mode == "channels" && selectedChannel > 0 ? (
            <div className="selectedChannelChat">
              <SelectedChannelChat
                userId={userId}
                userTok={userTok}
                channels={channels}
                selectedChannel={selectedChannel}
                setSelectedChannel={setSelectedChannel}
              />
            </div>
          ) : (
            <div className="svgHolder">
              {/* animated svg image until u select some :) */}
              <Image
                className="svgImage"
                src={"/manageChat.svg"}
                width={300}
                height={300}
                alt="select a chat :)"
              />
              <p>all messages are end to end encrypted.</p>
            </div>
          )}
        </div>
        <div
          onClick={handleParentClick}
          className={`col3 ${hide && "show_col3"}`}
        >
          <div onClick={preventCHilde} className="clo3_sub_container">
            {mode == "friends" && selectedFriend != -1 ? (
              <FriendInfo />
            ) : mode == "channels" && selectedChannel > 0 ? (
              <ChannelInfo
                userId={userId}
                userTok={userTok}
                channels={channels}
                selectedChannel={selectedChannel}
              />
            ) : (
              ""
            )}
          </div>
        </div>

        {(selectedFriend !== -1 || selectedChannel > 0) && (
          <div
            onClick={() => {
              setHide((prev) => !prev);
            }}
            className="chat_channel_details"
          >
            {hide ? (
              <MdOutlineCancel className="dots_hide" />
            ) : (
              <HiDotsVertical className="dots_hide" />
            )}
          </div>
        )}
        {mode === "friends" && <AddFriendSection />}
      </div>
    </div>
  );
};

export default Chat;
