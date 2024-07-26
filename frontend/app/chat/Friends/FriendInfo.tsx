import React, { useEffect, useState } from "react";
import "./FriendInfo.css";
import { currentFriend } from "@/app/Atoms/currentFriend";
import { useRecoilState, useRecoilValue } from "recoil";
import Image from "next/image";
import { MdBlock } from "react-icons/md";
import { CgUnblock } from "react-icons/cg";
import { FriendData } from "@/app/Interfaces/friendDataInterface";
import { loadingMsg } from "@/app/Atoms/loadingMsg";
import ProfileLoading from "./ProfileLoading";
import axios from "axios";
import { userToken } from "@/app/Atoms/userToken";
import { getRank } from "@/app/util/headers";
import { channelId } from "@/app/Atoms/channelId";

import noAchievemnets from "../../../public/achievement/no_achievements.png";
// import noAchievemnets from "@/public/apb.png";

export const FriendInfo = () => {
  const [friend, setFriend] = useRecoilState(currentFriend);

  const loadingAnimation = useRecoilValue(loadingMsg);
  const userTok = useRecoilValue(userToken);
  const [dmID, setDMID] = useRecoilState(channelId);

  const [userAchievement, setUserAchievement] = useState<any[]>([]);

  const noUserAchievement = userAchievement.filter((e) => e?.unlocked);

  const handleSwitch = (e: any) => {
    e.preventDefault();

    const body = {
      channelID: dmID,
      friendId: friend.uid,
      blocked: !friend.blocked,
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

  useEffect(() => {
    const getUserData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/user-achievement/${friend.uid}`,
          {
            headers: {
              Authorization: `Bearer ${userTok}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();
        setUserAchievement(data);
      } catch (error: any) {
        console.log("--->>>", error.message);
      }
    };
    getUserData();
  }, [friend.uid]);

  const rank = getRank(friend.xp);

  return loadingAnimation ? (
    <ProfileLoading />
  ) : (
    <div className="current_friend_info_container">
      <div className="current_friend_info">
        <Image
          className="current_friend_avatar"
          src={`${friend?.avatar}`}
          width={200}
          height={200}
          alt="avatar"
        />
        <h1>{friend?.username}</h1>
        <h3>{friend?.bio}</h3>
      </div>
      <div className="current_friend_rank">
        <h1>rank</h1>
        <Image
          className="current_friend_rank_badge"
          src={`/ranks/${rank}.png`}
          width={200}
          height={200}
          alt="rank_badge"
        />
        <h3> {rank} </h3>
      </div>
      <div className="current_friend_achievements_container">
        <h1>achievements</h1>
        {noUserAchievement.length > 0 ? (
          <div className="current_friend_achievements">
            {userAchievement.map((a: any) => {
              if (a?.unlocked)
                return (
                  <div key={a?.name} className="current_friend_achievement">
                    <Image
                      className="current_friend_achievement_badge"
                      src={a.uri}
                      width={200}
                      height={200}
                      alt="achievement_badge"
                    />

                    <span>{a?.name}</span>
                  </div>
                );
            })}
          </div>
        ) : (
          <div className="current_friend_no_achievements">
            <Image src={noAchievemnets} alt="noob" width={200} height={200} />
          </div>
        )}
      </div>
      <div className="current_friend_block">
        <button
          onClick={handleSwitch}
          className={`block_current_friend ${friend?.blocked && "unblock_current_friend"
            }`}
        >
          {friend?.blocked ? (
            <>
              <CgUnblock />
              Unblock
            </>
          ) : (
            <>
              <MdBlock />
              block
            </>
          )}{" "}
          {friend?.username}
        </button>
      </div>
    </div>
  );
};
