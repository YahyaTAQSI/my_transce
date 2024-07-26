"use client";
import { TiUserAdd } from "react-icons/ti";

import Image from "next/image";
import "./AddFriend.css";

import { useRecoilValue } from "recoil";
import { userToken } from "@/app/Atoms/userToken";
import { loggedUser } from "@/app/Atoms/logged";
export default function AddFriend({ user }: { user: any }) {
  const userTok = useRecoilValue(userToken);
  const loggedU = useRecoilValue(loggedUser);

  const addFriend = async () => {
    const notifData = {
      type: "friendReq",
      content: "sent you a friend request",
      suserId: loggedU,
      ruserId: user.uid,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userTok}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notifData),
      });
    } catch (error: any) {
      console.log("error>>>", error);
    }
  };

  return (
    <div className="little_add_friend_conatiner">
      <Image
        className="add_friend_avatar"
        src={user.avatar}
        width={1000}
        height={1000}
        alt="avatar"
      />
      <p className="add_friend_name">{user.username}</p>
      <button onClick={addFriend} className="add_friend_btn">
        <TiUserAdd />
      </button>
    </div>
  );
}
