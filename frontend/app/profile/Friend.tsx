"use client";
import "./Friend.css";

import React, { useEffect, useState } from "react";
import { LuMessagesSquare } from "react-icons/lu";
import { BiSolidJoystickAlt } from "react-icons/bi";
import { MdBlock } from "react-icons/md";
import { CgUnblock } from "react-icons/cg";
import { TbUserShare } from "react-icons/tb";

import Image from "next/image";

import { slctdFriend } from "../Atoms/friendAtom";
import { useRecoilState, useRecoilValue } from "recoil";
import { useRouter } from "next/navigation";
import { selectedFriendProfile } from "../Atoms/selectedFriendProfile";
import { loggedUser } from "../Atoms/logged";
import axios from "axios";
import { userToken } from "../Atoms/userToken";
import { channelId } from "../Atoms/channelId";
import { currentFriend } from "../Atoms/currentFriend";
import {
  channelData,
  newRole,
  userInterface,
} from "../Interfaces/chatInterfaces";

export default function Friend({
  friend,
  whichProfile,
}: {
  friend: any;
  whichProfile: any;
}) {
  const route = useRouter();

  const loggedU = useRecoilValue(loggedUser);
  const userTok = useRecoilValue(userToken);

  const [selectedProfile, setSelectedProfile] = useRecoilState(
    selectedFriendProfile
  );
  const [selectedFriend, setSelectedFriend] = useRecoilState(slctdFriend);
  const [dmID, setChannelID] = useRecoilState(channelId);
  const [currFriend, setCurrFriend] = useRecoilState(currentFriend);

  const [burgerM, setBurgerM] = useState(false);

  const UID =
    whichProfile === -1 || whichProfile === loggedU ? loggedU : whichProfile;
  const myFriend = friend.roles.find((role: any) => role.uid !== UID);

  const logged = myFriend.status === "online";
  const inGame = myFriend.status === "ingame";
  const blocked = myFriend.blocked;

  useEffect(() => {
    setCurrFriend(myFriend);
  }, [friend]);

  const handleSwitch = (e: any) => {
    e.preventDefault();

    const body = {
      channelID: friend.id,
      friendId: myFriend.uid,
      blocked: !blocked,
    };

    try {
      axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/channels/dm`, body, {
        headers: {
          Authorization: `Bearer ${userTok}`,
        },
      });
    } catch (error) {
      console.log("3a", error);
    }
  };

  const handleBurgerM = () => {
    setBurgerM((prev) => !prev);
  };

  const test = () => {
    setSelectedFriend(myFriend?.uid);
    setCurrFriend(myFriend);
    setChannelID(friend.id);
    route.push("/chat");
  };
  const encodedUsername = encodeURIComponent(myFriend?.username);
  return (
    <div className="friend_container">
      <div className="friend_name_photo">
        <Image
          src={`${myFriend?.avatar}`}
          width={2000}
          height={2000}
          className={`friend_avatar ${blocked && "blocked_friend_avatar"}`}
          alt="avatar"
        />

        <label
          htmlFor={myFriend?.uid}
          className={`profile_name ${blocked && "blocked_friend"}  ${
            burgerM && "hideName"
          }`}
        >
          <div
            className={`dot ${logged && "logged"}  ${inGame && "ingame"}`}
          ></div>
          {myFriend?.username}
        </label>

        <div className={`btn_conatiner ${burgerM && "showParam"}`}>
          <button
            id={myFriend?.uid}
            onClick={() => {
              setSelectedProfile(myFriend?.uid);
              route.push(`/profile/${encodedUsername}`);
            }}
            className="friend_component_btn view_profile"
          >
            <TbUserShare className="go_to_profile" />
          </button>
          {(whichProfile === -1 || whichProfile === loggedU) && (
            <>
              <button
                className={`friend_component_btn friend_msg ${
                  blocked && "disable_btns"
                }`}
                onClick={test}
                disabled={blocked}
              >
                <LuMessagesSquare />
              </button>

              <MdBlock
                onClick={handleSwitch}
                className={`friend_block  ${blocked && "hide_block"}`}
              />
              <CgUnblock
                onClick={handleSwitch}
                className={`friend_unblock  ${blocked && "show_unblock"}`}
              />
            </>
          )}
        </div>
        <div onClick={handleBurgerM} className="profile_burger_menu">
          <span> </span>
          <span> </span>
          <span> </span>
        </div>
      </div>
    </div>
  );
}
