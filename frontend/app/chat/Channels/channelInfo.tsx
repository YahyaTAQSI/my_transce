import Image from "next/image";
import "./channelChat.css";
import { GiCancel } from "react-icons/gi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useEffect, useState } from "react";
import { MdBlock } from "react-icons/md";
import { BiSolidVolumeMute } from "react-icons/bi";
import { io } from "socket.io-client";
const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, { transports: ["websocket"] });

type CHANNELUSER = {
  id: number;
  type: string;
  name: string;
  avatar: string;
};

interface channelInterface {
  id: number;
  name: string;
  topic: string;
  type: string;
  uri: string;
  roles: any[];
}

interface channelUsers {
  channelID: number;
  id: number;
  role: string;
  user: any;
  userID: number;
  condition: string;
  blockedSince: Date;
}
interface MembersObj {
  channelOwner: channelUsers | undefined;
  channelAdmins: channelUsers[] | undefined;
  channelNormalUsers: channelUsers[] | undefined;
  myTypeInTheChannel: channelUsers | undefined;
}

const ChannelInfo = ({
  userId,
  userTok,
  selectedChannel,
  channels,
}: {
  userId: number;
  userTok: string;
  selectedChannel: number;
  channels: channelInterface[] | undefined;
}) => {
  const handleRemoveAdminClick = (id: number) => {
    const patchRmAdmin = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/channelss/rmadmin?channelId=${selectedChannel}&userId=${id}`,
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
    patchRmAdmin();
  };
  const handleAdminClick = (id: number) => {
    const patchMakeAdmin = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/channelss/makeadmin?channelId=${selectedChannel}&userId=${id}`,
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
    patchMakeAdmin();
  };
  const handleKickClick = (id: number) => {
    const patchKick = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/channelss/kick?channelId=${selectedChannel}&userId=${id}`,
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
    patchKick();
    console.log("KICKED");
  };
  const handleLeaveChannel = (id: number) => {
    const patchKick = async () => {
      try {
        const req = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/channelss/roles?channelId=${selectedChannel}`,
          {
            headers: {
              Authorization: `Bearer ${userTok}`,
              "Content-Type": "application/json",
            },
          }
        );
        const allRoles = await req.json();
        const theOwner = allRoles.filter((e: any) => e.role == "OWNER");
        console.log("theOwner=>", theOwner[0].user.uid, "  myID:", userId);
        if (theOwner[0].user.uid == userId) {
          if (allRoles.length > 1) {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/channelss/leave?channelId=${selectedChannel}&userId=${id}`,
              {
                method: "PATCH",
                headers: {
                  Authorization: `Bearer ${userTok}`,
                  "Content-Type": "application/json",
                },
              }
            );
          } else {
            handleKickClick(theOwner[0].user.uid);
          }
        } else {
          console.log("HEEEEEREEE!!!");
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/channelss/kick?channelId=${selectedChannel}&userId=${userId}`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${userTok}`,
                "Content-Type": "application/json",
              },
            }
          );
        }
      } catch (error) {
        console.log("Error herere");
      }
    };
    patchKick();
  };
  const handleBlockClick = (id: number) => {
    const patchblock = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/channelss/block?channelId=${selectedChannel}&userId=${id}`,
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
    patchblock();
  };
  const handleRmBlockClick = (id: number) => {
    const patchrmblock = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/channelss/rmblock?channelId=${selectedChannel}&userId=${id}`,
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
    patchrmblock();
  };
  const handleMuteClick = (id: number) => {
    const patchmute = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/channelss/mute?channelId=${selectedChannel}&userId=${id}`,
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
    patchmute();
  };
  const handleRmMuteClick = (id: number) => {
    const patchRmMute = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/channelss/rmmute?channelId=${selectedChannel}&userId=${id}`,
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
  };
  const [MembersObj, setMemmbersObj] = useState<MembersObj>();
  const [channelData, setChannelData] = useState<channelInterface>();

  useEffect(() => {
    let channelToDisplay: channelInterface | undefined = channels?.find(
      (ch) => ch.id === selectedChannel
    );
    setChannelData(channelToDisplay);
    console.log(">>>>??>>>>", channelToDisplay);
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/channelss/messages?channelId=${channelToDisplay?.id}`,
          {
            headers: {
              Authorization: `Bearer ${userTok}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setMemmbersObj({
          channelOwner: data?.find((e: channelUsers) => e.role == "OWNER"),
          channelAdmins: data?.filter((e: channelUsers) => e.role == "ADMIN"),
          channelNormalUsers: data?.filter(
            (e: channelUsers) => e.role == "USER"
          ),
          myTypeInTheChannel: data?.find(
            (e: channelUsers) => e.userID === userId
          ),
        });
      } catch (error) {
        console.log("Error herere");
      }
    };
    fetchMessages();
  }, [selectedChannel]);

  useEffect(() => {
    const handleUpdateRoles = (roles: any) => {
      console.log(")))>>> ", roles);
      setMemmbersObj({
        channelOwner: roles?.find((e: any) => e.role == "OWNER"),
        channelAdmins: roles?.filter((e: any) => e.role == "ADMIN"),
        channelNormalUsers: roles?.filter((e: any) => e.role == "USER"),
        myTypeInTheChannel: roles?.find((e: any) => e.userID === userId),
      });
    };

    socket.on("updateRoles", handleUpdateRoles);
    socket.on("updateUsersAfterSomeoneKick", handleUpdateRoles);
    return () => {
      socket.off("updateRoles");
      socket.off("updateUsersAfterSomeoneKick");
    };
  }, []);

  return (
    <div className="selectedChannelData">
      <div className="ChannelImage">
        <Image
          src={channelData?.uri ? `${channelData.uri}` : `${process.env.NEXT_PUBLIC_BACKEND_URL}/default.png`}
          width={100}
          height={100}
          alt="avatar"
          style={{ borderRadius: "50%" }}
        />
      </div>
      <h3 className="channelName">{channelData?.name}</h3>
      <p className="topic">{channelData?.topic}</p>

      <div className="members">
        {MembersObj?.channelOwner != undefined ? (
          <div className="owner">
            <div className="imageNameContainer">
              <div className="userPic">
                <Image
                  className="pic"
                  src={`${MembersObj?.channelOwner.user.avatar}`}
                  width={50}
                  height={50}
                  alt="avatar"
                />
              </div>
              <div className="name">
                {MembersObj?.channelOwner.user.username}
              </div>
            </div>
            <div className="status">
              <span className="type">{MembersObj?.channelOwner.role}</span>
            </div>
          </div>
        ) : (
          ""
        )}
        {MembersObj?.channelAdmins?.map((adminUser) => {
          return (
            <div className="admin" key={adminUser.id}>
              <div className="imageNameContainer">
                <div className="userPic">
                  <Image
                    className="pic"
                    src={`${adminUser.user.avatar}`}
                    width={50}
                    height={50}
                    alt="avatar"
                  />
                </div>
                <div className="name">{adminUser.user.username}</div>
                <div className="blocked" style={{ color: "tomato" }}>
                  {adminUser.condition == "BLOCKED" ? <MdBlock /> : ""}
                  {adminUser.condition == "MUTED" ? <BiSolidVolumeMute /> : ""}
                </div>
              </div>
              <div className="status">
                <span className="type">{adminUser.role}</span>
                {MembersObj?.myTypeInTheChannel?.role === "OWNER" ? (
                  <>
                    <span className="actionsBtn">
                      {MembersObj?.myTypeInTheChannel?.role === "OWNER" ? (
                        <BsThreeDotsVertical className="btn" />
                      ) : (
                        ""
                      )}
                      <span className="actions">
                        <ul>
                          {MembersObj?.myTypeInTheChannel?.role === "OWNER" ? (
                            <li
                              onClick={() =>
                                handleRemoveAdminClick(adminUser.user.uid)
                              }
                            >
                              RM ADMIN
                            </li>
                          ) : (
                            ""
                          )}

                          <li
                            onClick={() => handleKickClick(adminUser.user.uid)}
                          >
                            KICK
                          </li>
                          {adminUser.condition == "BLOCKED" ? (
                            <li
                              onClick={() =>
                                handleRmBlockClick(adminUser.user.uid)
                              }
                            >
                              RM BLOCK
                            </li>
                          ) : (
                            <li
                              onClick={() =>
                                handleBlockClick(adminUser.user.uid)
                              }
                            >
                              BLOCK
                            </li>
                          )}
                          {adminUser.condition == "MUTED" ? (
                            <li
                              onClick={() =>
                                handleRmMuteClick(adminUser.user.uid)
                              }
                            >
                              RM MUTE
                            </li>
                          ) : (
                            <li
                              onClick={() =>
                                handleMuteClick(adminUser.user.uid)
                              }
                            >
                              MUTE 1MIN
                            </li>
                          )}
                        </ul>
                      </span>
                    </span>
                  </>
                ) : (
                  ""
                )}
              </div>
            </div>
          );
        })}
        {MembersObj?.channelNormalUsers?.map((normalUser) => {
          return (
            <div className="user" key={normalUser.id}>
              <div className="imageNameContainer">
                <div className="userPic">
                  <Image
                    className="pic"
                    src={`${normalUser.user.avatar}`}
                    width={50}
                    height={50}
                    alt="avatar"
                  />
                </div>
                <div className="name">{normalUser.user.username}</div>
                <div className="blocked" style={{ color: "tomato" }}>
                  {normalUser.condition == "BLOCKED" ? <MdBlock /> : ""}
                  {normalUser.condition == "MUTED" ? <BiSolidVolumeMute /> : ""}
                </div>
              </div>
              <div className="actionsBtn">
                {MembersObj?.myTypeInTheChannel?.role === "OWNER" ||
                  MembersObj?.myTypeInTheChannel?.role === "ADMIN" ? (
                  <BsThreeDotsVertical />
                ) : (
                  ""
                )}
                {MembersObj?.myTypeInTheChannel?.role === "OWNER" ||
                  MembersObj?.myTypeInTheChannel?.role === "ADMIN" ? (
                  <span className="actions">
                    <ul>
                      {MembersObj?.myTypeInTheChannel?.role === "OWNER" ? (
                        <li
                          onClick={() => handleAdminClick(normalUser.user.uid)}
                        >
                          ADMIN
                        </li>
                      ) : (
                        ""
                      )}

                      <li onClick={() => handleKickClick(normalUser.user.uid)}>
                        KICK
                      </li>
                      {normalUser.condition == "BLOCKED" ? (
                        <li
                          onClick={() =>
                            handleRmBlockClick(normalUser.user.uid)
                          }
                        >
                          RM BLOCK
                        </li>
                      ) : (
                        <li
                          onClick={() => handleBlockClick(normalUser.user.uid)}
                        >
                          BLOCK
                        </li>
                      )}
                      {normalUser.condition == "MUTED" ? (
                        <li
                          onClick={() => handleRmMuteClick(normalUser.user.uid)}
                        >
                          RM MUTE
                        </li>
                      ) : (
                        <li
                          onClick={() => handleMuteClick(normalUser.user.uid)}
                        >
                          MUTE 1MIN
                        </li>
                      )}
                    </ul>
                  </span>
                ) : (
                  ""
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="leaveBtn">
        <GiCancel
          className="cancelBtn"
          onClick={() => handleLeaveChannel(userId)}
        />
        <p onClick={() => handleLeaveChannel(userId)}>
          Leave {channelData?.name}
        </p>
      </div>
    </div>
  );
};

export default ChannelInfo;
