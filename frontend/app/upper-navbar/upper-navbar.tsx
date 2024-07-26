"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { IoMdNotificationsOutline } from "react-icons/io";
import "./upper-navbar.css";
import { MdOutlinePersonSearch } from "react-icons/md";

import Notifications from "./Notifications";
import { useRecoilState, useRecoilValue } from "recoil";
import { userNotifications } from "../Atoms/notifications";
import { userToken } from "../Atoms/userToken";
import { loggedUser } from "../Atoms/logged";
import Link from "next/link";
import { userAvatar } from "../Atoms/userAvatar";
import { useSocket } from "../SubChildrens";

const UpperNav = () => {
  const notificationRef = useRef<HTMLDivElement>(null);
  const userTok = useRecoilValue(userToken);
  const loggedU = useRecoilValue(loggedUser);
  const [userAV, setUserAV] = useRecoilState(userAvatar);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      )
        setShowNotif(false);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef]);

  // const [userData, setUserData] = useState<User>();
  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${loggedU}`, {
  //       headers: {
  //         Authorization: `Bearer ${userTok}`,
  //         "Content-Type": "application/json",
  //       },
  //     });
  //     const data = await response.json();
  //     console.log(">>>>??>>>>", data);
  //     setUserData(data);
  //   };
  //   fetchUserData();
  // }, []);

  const [searchUsers, setSearchUsers] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showMyUsers, setShowMyUsers] = useState(false);
  const [myNotifications, setMyNotifications] =
    useRecoilState(userNotifications);
  const [myUsers, setMyUsers] = useState<any[]>([]);

  const getNotifications = async () => {
    if (loggedU === -1) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/${loggedU}`,
        {
          headers: {
            Authorization: `Bearer ${userTok}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      setMyNotifications(data);
    } catch (error: any) {
      console.log("error>>>", error.message);
    }
  };
  const getAllUsers = async () => {
    if (loggedU === -1) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/allusers/${loggedU}`,
        {
          headers: {
            Authorization: `Bearer ${userTok}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      console.log("all users>>>", data);

      setMyUsers(data);
    } catch (error: any) {
      console.log("error>>>", error.message);
    }
  };
  useEffect(() => {
    getNotifications();
    getAllUsers();
  }, [loggedU]);

  const { socket } = useSocket();
  useEffect(() => {
    if (!socket) return;
    const handleUpdateList = (user: any) => {
      getAllUsers();
    };
    socket.on("update_All_Users", handleUpdateList);
    return () => {
      socket.off("update_All_Users");
    };
  });

  const handleOnBlur = () => {
    setTimeout(() => {
      setShowMyUsers(false);
    }, 200);
  };

  const filteredUsers = myUsers.filter((user: any) =>
    user?.username.toLowerCase().includes(searchUsers.toLowerCase())
  );
  return (
    <div className="upperNav">
      <div>
        <div className="search-icon">
          <MdOutlinePersonSearch />
        </div>
        <input
          value={searchUsers}
          onChange={(e) => setSearchUsers(e.target.value)}
          placeholder="search player"
          type="text"
          onFocus={() => {
            loggedU !== -1 && setShowMyUsers(true);
          }}
          onBlur={handleOnBlur}
        />
        <div className={`all_users ${showMyUsers && "show_all_users"}`}>
          {filteredUsers.map((user) => {
            const encodedUsername = encodeURIComponent(user?.username);
            return (
              <Link
                className="users_names_links"
                key={user?.uid}
                href={`/profile/${encodedUsername}`}
              >
                <img
                  src={user?.avatar}
                  className="users_avatars_links"
                  alt="avatar"
                />
                {user?.username}
              </Link>
              // <div  key={user?.uid}>fff</div>
            );
          })}
        </div>
      </div>
      <div ref={notificationRef} className="notif-and-profilePic">
        <div
          onClick={() => setShowNotif((prev) => !prev)}
          className="notif-icon"
        >
          <IoMdNotificationsOutline />

          {myNotifications.length > 0 && (
            <div className="notif_count">{myNotifications.length}</div>
          )}
        </div>
        <Notifications showNotif={showNotif} />
        <div className="profile-picture">
          <div>
            <Image
              src={userAV || `${process.env.NEXT_PUBLIC_BACKEND_URL}/default.png`}
              alt="P"
              width={45}
              height={45}
              loading="lazy"
              onLoad={() => setImageLoaded(!imageLoaded)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpperNav;
