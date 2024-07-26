import React, { useEffect, useState } from "react";
import "./channelChat.css";
import { useRecoilValue } from "recoil";
import { userToken } from "@/app/Atoms/userToken";
import Image from "next/image";
import { MdCancel } from "react-icons/md";
import { loggedUser } from "../../Atoms/logged";

interface channelInterface {
  id: number;
  name: string;
  topic: string;
  type: string;
  uri: string;
  roles: any[];
}

const PopUpSearchFriend = ({
  chToDisplay,
  setShowSerachFriendPopUp,
  selectedChannel,
}: {
  chToDisplay: channelInterface | undefined;
  setShowSerachFriendPopUp: React.Dispatch<React.SetStateAction<boolean>>;
  selectedChannel: number;
}) => {
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState("");
  const userTok = useRecoilValue(userToken);
  const userId = useRecoilValue(loggedUser);

  useEffect(() => {
    const fetchFreshUsers = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`, {
        headers: {
          Authorization: `Bearer ${userTok}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      const fetchUsersOfThatChannel = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/channelss/roles?channelId=${selectedChannel}`,
        {
          headers: {
            Authorization: `Bearer ${userTok}`,
            "Content-Type": "application/json",
          },
        }
      );
      const channelUsers = await fetchUsersOfThatChannel.json();
      const channelUsersNames = channelUsers.map((e: any) => e.user.username);
      const excludeExistingMembers = data.filter((e: any) => {
        return !channelUsersNames.includes(e.username);
      });
      const filtredData = excludeExistingMembers.filter((e: any) =>
        e.username.includes(userName)
      );

      setUsers(filtredData);
    };

    fetchFreshUsers();
  }, [userName]);

  const handleInvite = async (uid: number, channelId: number) => {
    const notifData = {
      type: "channelReq",
      content: `invitation to ${chToDisplay?.name}`,
      suserId: userId,
      chnnelId: channelId,
      ruserId: uid,
    };
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/channelnotif`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userTok}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notifData),
      }
    )
      .then(() => {
        setShowSerachFriendPopUp(false);
      })
      .catch((err) => {
        console.error(err);
      });
  };
  return (
    <div className="PopUpSearchFriend">
      <div className="searchingArea">
        <div
          className="exitBtn"
          onClick={() => {
            setShowSerachFriendPopUp(false);
          }}
        >
          <MdCancel />
        </div>
        <input
          type="text"
          maxLength={50}
          placeholder="invite friends"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <div className="searchedFriendsList">
          {users.map((e: any, index) => {
            return (
              <div key={index}>
                <div className="imageAndusername">
                  <Image
                    src={e.avatar}
                    width={50}
                    height={50}
                    alt="AVATAR"
                    style={{ borderRadius: "50%" }}
                  />
                  {e.username}
                </div>
                <button onClick={() => handleInvite(e.uid, selectedChannel)}>
                  Invite
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PopUpSearchFriend;
