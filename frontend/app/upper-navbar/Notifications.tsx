"use client";

import React, { useEffect, useState } from "react";
import "./notifications.css";

import Notification from "./Notification";
import { userNotifications } from "../Atoms/notifications";
import { useRecoilState, useRecoilValue } from "recoil";
import { userToken } from "../Atoms/userToken";
import { loggedUser } from "../Atoms/logged";
import { socket } from "@/app/sockets/socket";

function Notifications({ showNotif }: { showNotif: boolean }) {
  const userTok = useRecoilValue(userToken);
  const loggedU = useRecoilValue(loggedUser);

  const [myNotifications, setMyNotifications] =
    useRecoilState(userNotifications);

  useEffect(() => {
    const handleReceivedNotification = (notif: any) => {
      if (notif.ruserId === loggedU)
        setMyNotifications((prevNotif: any) => [...prevNotif, notif]);
    };
    socket.on("notification", handleReceivedNotification);
    return () => {
      socket.off("notification");
    };
  });

  return (
    <div
      className={`notifications_container ${
        showNotif && "show_notifications_container"
      }`}
    >
      <div className="notifications_container_header">Notificatons</div>
      <div className="notifications">
        {myNotifications.length > 0 &&
          myNotifications.map((notif: any) => (
            <Notification key={notif.id} notif={notif} />
          ))}
      </div>
    </div>
  );
}

export default Notifications;
