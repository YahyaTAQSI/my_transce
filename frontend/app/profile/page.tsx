"use client";
import React, { useEffect, useRef, useState } from "react";
import "./Profile.css";

import { MdOutlineEdit } from "react-icons/md";
import ProfileDetails from "./ProfileDetails";
import Image from "next/image";
import { useRecoilValue } from "recoil";
import { loggedUser } from "../Atoms/logged";
import { userToken } from "../Atoms/userToken";
import { PiCurrencyEthFill } from "react-icons/pi";
import { useRouter } from "next/navigation";
import LoadingPaddle from "../LoadingPaddle";
import { userInterface } from "../Interfaces/chatInterfaces";

const Profile = () => {
  const uidRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [hoverEffect, setHoverEffect] = useState(true);

  const loggedU = useRecoilValue(loggedUser);
  const userTok = useRecoilValue(userToken);
  const route = useRouter();
  const [userData, setUserData] = useState<userInterface | null>(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${loggedU}`, {
          headers: {
            Authorization: `Bearer ${userTok}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        setUserData(data);
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (error: any) {
        setLoading(false);
      }
    };
    getUserData();
  }, []);

  return loading ? (
    <LoadingPaddle />
  ) : (
    <div className="profile_container">
      <div
        style={{
          backgroundImage: `linear-gradient(
          77deg,
          rgba(0, 0, 0, 1) 30%,
          rgba(255, 255, 255, 0) 100%
        ), url(${userData?.banner})`,
        }}
        className="user_account"
      >
        <div onClick={() => route.push("settings")} className="edit_label">
          <span>Edit</span>
          <MdOutlineEdit />
        </div>
        {hoverEffect ? (
          <div className="img_container_add">
            <Image
              src={`${userData?.avatar || ""}`}
              width={200}
              height={200}
              alt="profile_avatar"
              className="profile_photo"
            />
          </div>
        ) : (
          <div className="img_container_add">
            <Image
              src={`${"/ranks/" + userData?.rank + ".png" || ""}`}
              width={100}
              height={100}
              alt="profile_avatar"
              className="profile_photo2"
            />
          </div>
        )}
        <div className="profile_data">
          <h1>{userData?.username}</h1>
          <h4 className="profile_username">
            <PiCurrencyEthFill /> {userData?.wallet}
          </h4>
          <h4 className="profile_email">{userData?.email}</h4>
          <h2
            onMouseOver={() => setHoverEffect(false)}
            onMouseOut={() => setHoverEffect(true)}
            className="profile_user_lvl"
          >
            {userData?.rank}
          </h2>

          <div className="profile_progress">
            <div className="progress">
              <div
                style={{
                  width: `${(userData && userData?.xp % 100) || 0}%`,
                }}
                className="pseudoProgress"
              ></div>
            </div>
            {(userData && userData?.xp % 100) || 0}%
          </div>
        </div>
      </div>
      <div className="profile_details">
        <ProfileDetails whichProfile={loggedU} />
      </div>
    </div>
  );
};

export default Profile;

// const copyUID = () => {
//   return;
//   if (uidRef.current) {
//     const textToCopy = uidRef.current.textContent || "";

//     navigator.clipboard
//       .writeText(textToCopy)
//       .then(() => {
//         console.log("Text copied to clipboard:", textToCopy);
//       })
//       .catch((error) => {
//         console.error("Unable to copy text to clipboard", error);
//       });
//   }
// };

{
  /* <Image
src={`${"/ranks/" + userData?.rank + ".png" || ""}`}
width={150}
height={150}
alt="profile_avatar"
/> */
}
