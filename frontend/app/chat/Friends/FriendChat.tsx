import React, { useEffect } from "react";
import "./FriendChat.css";
import Image from "next/image";

import { slctdFriend } from "../../Atoms/friendAtom";
import { useRecoilState, useRecoilValue } from "recoil";
import { loadingMsg } from "@/app/Atoms/loadingMsg";
import { currentFriend } from "@/app/Atoms/currentFriend";
import { channelId } from "@/app/Atoms/channelId";
import { loggedUser } from "@/app/Atoms/logged";
import { blockedMe } from "@/app/Atoms/blockedMe";

interface FriendChatProps {
  friendData: any;
}

const FriendChat: React.FC<FriendChatProps> = ({ friendData }) => {
  const UID = useRecoilValue(loggedUser);
  const myFriend = friendData.roles.find((role: any) => role.uid !== UID);

  const ifImBlocked = friendData.roles.find((role: any) => role.uid === UID);
  const [selectedFriend, setSelectedFriend] = useRecoilState(slctdFriend);
  const [friend, setFriend] = useRecoilState(currentFriend);
  const [blockCheck, setBlockCheck] = useRecoilState(blockedMe);
  const [loadingAnimation, setLoadingAnimation] = useRecoilState(loadingMsg);
  const [dmID, setDMID] = useRecoilState(channelId);

  useEffect(() => {
    if (myFriend && myFriend?.uid === friend.uid) setFriend(myFriend);
  }, [myFriend]);
  useEffect(() => {
    if (ifImBlocked && ifImBlocked.uid === UID) setBlockCheck(ifImBlocked.blocked);
  }, [ifImBlocked]);

  return (
    <div
      onClick={() => {
        if (myFriend.uid !== selectedFriend) {
          setLoadingAnimation(true);
          setDMID(friendData.id);
          setFriend(myFriend);
          setBlockCheck(ifImBlocked.blocked);
          setSelectedFriend(myFriend.uid);
        }
      }}
      className={`friend_chat_container ${
        dmID === friendData.id && "selected_channel_dm"
      }`}
    >
      <div className="chat_list_avatar_container">
        <Image
          className="chat_list_avatar"
          src={`${myFriend?.avatar}`}
          width={2000}
          height={2000}
          alt="avatar"
        />
        <span
          className={`status_dot ${
            myFriend?.status === "online" && "logged"
          }  ${myFriend.status === "ingame" && "ingame"}`}
        ></span>
      </div>
      <div className="chat_list_name">
        <h1>{myFriend?.username}</h1>
        {myFriend.blocked ? (
          <h4 className="this_friend_is_blocked">this friend is blocked</h4>
        ) : (
          <h4>{friendData?.lastMSG}</h4>
        )}
      </div>
    </div>
  );
};
export default FriendChat;
