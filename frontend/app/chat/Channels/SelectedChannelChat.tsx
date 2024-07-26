import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ChannelData from "../../data/channels_list.json";
import { CHANNEL_DATA } from "@/app/Interfaces/channelDataInterface";
import { IoIosSend } from "react-icons/io";
import { IoArrowBackOutline } from "react-icons/io5";
import { MdBlock } from "react-icons/md";
import "./channelChat.css";
import { io } from "socket.io-client";
import { MdOutlinePersonSearch } from "react-icons/md";
import PopUpSearchFriend from "./popUpSearchFriend";

const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, { transports: ["websocket"] });
console.log("MMMMMM", socket);
interface channelInterface {
  id: number;
  name: string;
  topic: string;
  type: string;
  uri: string;
  roles: any[];
}
interface MessagesInterface {
  channelID: number;
  content: string;
  createdAT: string;
  id: number;
  userID: number;
  users: { avatar: string };
}

const SelectedChannelChat = ({
  userId,
  userTok,
  channels,
  selectedChannel,
  setSelectedChannel,
}: {
  userId: number;
  userTok: string;
  channels: channelInterface[] | undefined;
  selectedChannel: number;
  setSelectedChannel: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const [chToDisplay, setChToDisplay] = useState<
    channelInterface | undefined
  >();
  const [showSerachFriendPopUp, setShowSerachFriendPopUp] = useState(false);
  const [showSearchFriend, setShowSearchFriend] = useState(false);
  const [messages, setMessages] = useState<MessagesInterface[]>();
  const [msgContent, setMsgContent] = useState<string>("");
  const [myCondition, setMyCondition] = useState("NORMAL");
  const [myRole, setMyRole] = useState("USER");
  const chatSectionRef = useRef<HTMLDivElement>(null);
  const mutedDiv = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let channelToDisplay: channelInterface | undefined = channels?.find(
      (ch) => ch.id === selectedChannel
    );
    setChToDisplay(channelToDisplay);
    console.log("MMMMMMMMMM___>>", channelToDisplay);
    if (channelToDisplay?.type == "PRIVATE") {
      setShowSearchFriend(true);
    }
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/message/${channelToDisplay?.id}`,
          {
            headers: {
              Authorization: `Bearer ${userTok}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();

        console.log("?????????????? ", selectedChannel);
        const req = await fetch(
          `http://localhost:3000/channelss/roles?channelId=${selectedChannel}`,
          {
            headers: {
              Authorization: `Bearer ${userTok}`,
              "Content-Type": "application/json",
            },
          }
        );
        const myData = await req.json();
        const myCondition: any = myData.find((e: any) => e.user.uid == userId);
        setMyCondition(myCondition.condition);
        setMyRole(myCondition.role);
        if (myCondition.condition == "BLOCKED") {
          const filtredMessages = data.filter(
            (e: any) => e.createdAT < myCondition.blockedSince
          );

          setMessages(filtredMessages);
        } else {
          setMessages(data);
        }
      } catch (error) {
        console.log("Error herere");
      }
    };
    fetchMessages();

    setChToDisplay(channelToDisplay);
  }, [selectedChannel]);

  useEffect(() => {
    const handleReceiveMessage = async (message: any) => {
      const response = await fetch(
        `http://localhost:3000/channelss/roles?channelId=${selectedChannel}`,
        {
          headers: {
            Authorization: `Bearer ${userTok}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      const myCondition = data.find((e: any) => e.user.uid == userId);
      if (!myCondition) {
        setSelectedChannel(-1);
        return;
      }
      console.log("my condition =", myCondition);
      setMyCondition(myCondition.condition);
      setMyRole(myCondition.role);

      if (
        (message?.channelID === selectedChannel ||
          message?.channelID === undefined) &&
        myCondition.condition != "BLOCKED"
      ) {
        const response = await fetch(
          `http://localhost:3000/message/${selectedChannel}`,
          {
            headers: {
              Authorization: `Bearer ${userTok}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setMessages(data);
      }
    };

    socket.on("message", handleReceiveMessage);
    socket.on("updateRoles", handleReceiveMessage);
    socket.on("updateUsersAfterSomeoneKick", (data: any) => {
      const imIn = data.find((e: any) => e.userID == userId);
      console.log("im In =", imIn);
      if (!imIn) setSelectedChannel(-1);
    });

    return () => {
      socket.off("message");
      socket.off("updateRoles");
      socket.off("updateUsersAfterSomeoneKick");
    };
  }, [chToDisplay?.id]);

  useEffect(() => {
    if (chatSectionRef.current) {
      chatSectionRef.current.scrollTop = chatSectionRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendingMessage = (
    e:
      | React.KeyboardEvent<HTMLInputElement>
      | React.MouseEvent<SVGElement, MouseEvent>
  ) => {
    const sendTheMessage = async () => {
      try {
        const channelData = {
          userID: userId,
          channelID: chToDisplay?.id,
          content: msgContent,
        };

        const userIsMuted = async (): Promise<number> => {
          const response = await fetch(
            `http://localhost:3000/channelss/roles?channelId=${selectedChannel}`,
            {
              headers: {
                Authorization: `Bearer ${userTok}`,
                "Content-Type": "application/json",
              },
            }
          );
          const data = await response.json();
          const myCondition = data.find((e: any) => e.user.uid == userId);
          if (myCondition.condition == "MUTED") {
            const dateWhenIGetMuted: Date = new Date(myCondition.mutedSince);
            const currentTime = new Date();

            const difference =
              currentTime.getTime() - dateWhenIGetMuted.getTime();
            console.log(
              currentTime.getTime(),
              " - ",
              dateWhenIGetMuted.getTime(),
              " = ",
              difference
            );
            if (difference / (1000 * 60) >= 1) {
              console.log("IMKN hERE");
              const patchRmMute = async () => {
                try {
                  const response = await fetch(
                    `http://localhost:3000/channelss/rmmute?channelId=${selectedChannel}&userId=${userId}`,
                    {
                      method: "PATCH",
                      headers: {
                        Authorization: `Bearer ${userTok}`,
                        "Content-Type": "application/json",
                      },
                    }
                  );
                } catch (error) {
                  console.log("Error herere");
                }
              };
              patchRmMute();
              return 1;
            } else {
              if (mutedDiv.current) {
                mutedDiv.current.innerHTML = `you are muted,<br/>wait till the 1 Min complete !`;
                mutedDiv.current.style.display = "block";
                mutedDiv.current.style.opacity = "1";
                setTimeout(() => {
                  if (mutedDiv.current) {
                    mutedDiv.current.style.opacity = "0";
                    mutedDiv.current.style.display = "block";
                  }
                }, 2000);
              }
              return 0;
            }
          }
          return 1;
        };
        const isItStillMute: Promise<number> = userIsMuted();
        const resolverNumber: number = await isItStillMute;
        if (resolverNumber == 0) {
          console.log("STILL MUTED");
          return;
        }
        const response = await fetch(`http://localhost:3000/message`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userTok}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(channelData),
        }).then(() => {
          setMsgContent("");
        });
      } catch (error) {
        console.log("Error herere");
      }
    };
    sendTheMessage();
  };

  const returnTime = (msgTime: string) => {
    const options = { hour: "2-digit", minute: "2-digit" };
    const date: string = new Date(msgTime).toLocaleString(
      "en-US",
      options as Intl.DateTimeFormatOptions
    );
    return date;
  };

  return showSerachFriendPopUp ? (
    <PopUpSearchFriend
      chToDisplay={chToDisplay}
      setShowSerachFriendPopUp={setShowSerachFriendPopUp}
      selectedChannel={selectedChannel}
    />
  ) : (
    <div className="channel_msg_section">
      <div className="channel_msg_section_header">
        <IoArrowBackOutline
          style={{ width: "20px", margin: "5px" }}
          className="arrow_back"
          onClick={() => setSelectedChannel(-1)}
        />
        {/* {chToDisplay?.uri} */}
        <Image
          className="channel_msg_section_header_avatar"
          src={
            chToDisplay?.uri ? `${chToDisplay.uri}` : `http://localhost:3000/default.png`
          }
          width={100}
          height={100}
          alt="avatar"
        />
        <div>
          <h3 style={{ display: "block" }}>{chToDisplay?.name}</h3>
          {/* <p>
            {chToDisplay?.roles.length}{" "}
            {chToDisplay?.roles.length && chToDisplay?.roles.length < 2
              ? "member"
              : "members"}
          </p> */}
        </div>
        {showSearchFriend && myRole != "USER" && (
          <MdOutlinePersonSearch
            className="searchFriendsInPrivateMode"
            onClick={() => setShowSerachFriendPopUp(true)}
          />
        )}
      </div>
      <div className="channel_msg_section_chat" ref={chatSectionRef}>
        <div className="mutedMsg" ref={mutedDiv}></div>
        {messages?.length && messages?.length > 0
          ? messages?.map((message) => {
            return message.userID == userId ? (
              <div className="channelMsgContainerRecipient" key={message.id}>
                <div className="msgAndTime">
                  <p className="channelMsg">{message.content}</p>
                  <p className="msgTime">{returnTime(message.createdAT)}</p>
                </div>
              </div>
            ) : (
              <div className="channelMsgContainer" key={message.id}>
                <Image
                  className="senderOrRecieverImage"
                  src={`${message.users.avatar}` || "default.png"}
                  width={30}
                  height={30}
                  alt="PIC"
                />
                <div className="msgAndTime">
                  <p className="channelMsg">{message.content}</p>
                  <p className="msgTime">{returnTime(message.createdAT)}</p>
                </div>
              </div>
            );
          })
          : ""}
      </div>
      <div className="channel_msg_section_input">
        <input
          disabled={myCondition == "BLOCKED"}
          type="text"
          value={msgContent}
          maxLength={100}
          minLength={1}
          onChange={(e) => setMsgContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key == "Enter") {
              handleSendingMessage(e);
            }
          }}
        />
        {myCondition == "BLOCKED" ? (
          <MdBlock className="sendIcon" />
        ) : (
          <IoIosSend
            className="sendIcon"
            onClick={(e) => {
              handleSendingMessage(e);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SelectedChannelChat;
