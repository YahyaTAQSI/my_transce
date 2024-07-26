"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import "./Nav.css";
import raqeta from "../../public/rakita.png";
import apb from "../../public/apb.png";
import { FaGamepad } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
import { FaRankingStar } from "react-icons/fa6";
import { IoMdChatbubbles } from "react-icons/io";
import { IoMdSettings } from "react-icons/io";
import { MdOutlineLogout } from "react-icons/md";
import { useRecoilState } from "recoil";
import { loggedUser } from "../Atoms/logged";
import { userToken } from "../Atoms/userToken";
import { userNotifications } from "../Atoms/notifications";
import { userTwoFA } from "../Atoms/_2faUser";
import { twoFA } from "../Atoms/_If_2fa";
import { useRouter } from "next/navigation";

const Nav = () => {
  const [user2fa, setUser2fa] = useRecoilState(userTwoFA);
  const [twofa, setTwofa] = useRecoilState(twoFA);

  const [loggedU, setLoggedU] = useRecoilState(loggedUser);
  const [loggedU2fa, setLoggedU2fa] = useRecoilState(userTwoFA);

  const [loggedT, setLoggedT] = useRecoilState(userToken);
  const [myNotifications, setMyNotifications] =
    useRecoilState(userNotifications);

  const router = useRouter();
  const logout = async (e: any) => {
    e.preventDefault();
    if (loggedU !== -1) {
      const uid = loggedU;
      const tok = loggedT;
      const body = {
        status: "offline",
      };

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/status/${uid}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tok}`,
            },
            body: JSON.stringify(body),
          }
        );
      } catch (error) {
        console.error("Error:", error);
      }

      setTwofa(false);
      setLoggedU(-1);
      setLoggedU2fa(-1);
      setLoggedT("");
      setMyNotifications([]);
      router.replace("/login");
    }
  };

  return (
    <div className="main-Nav">
      <div className="logo-and-links">
        <div className="logo">
          <Link className="link" href="/">
            <div>
              <Image
                className="image-logo"
                src={raqeta}
                alt="LOGO"
                width={100}
              />
            </div>
            <div>
              <Image className="apb-logo" src={apb} alt="LOGO" width={100} />
            </div>
          </Link>
        </div>
        <ul>
          <Link className="link" href="/play">
            <li>
              <div>
                <FaGamepad className="nav-icon" />
              </div>
              <div>
                Play<span className="hover-line"></span>
              </div>
            </li>
          </Link>
          <Link className="link" href="/profile">
            <li>
              <div>
                <FaUser className="nav-icon" />
              </div>
              <div>
                Profile<span className="hover-line"></span>
              </div>
            </li>
          </Link>
          <Link className="link" href="/leaderboard">
            <li>
              <div>
                <FaRankingStar className="nav-icon" />
              </div>
              <div>
                Leaderboard<span className="hover-line"></span>
              </div>
            </li>
          </Link>
          <Link className="link" href="/chat">
            <li>
              <div>
                <IoMdChatbubbles className="nav-icon" />
              </div>
              <div>
                Chat<span className="hover-line"></span>
              </div>
            </li>
          </Link>
        </ul>
      </div>
      <div className="settings-logout">
        <ul>
          <Link className="link" href="/settings">
            <li>
              <div>
                <IoMdSettings className="nav-icon" />
              </div>
              <div>
                Settings<span className="hover-line"></span>
              </div>
            </li>
          </Link>
          <li onClick={logout} style={{ cursor: "pointer" }}>
            <div>
              <MdOutlineLogout className="nav-icon" />
            </div>
            <div>Log-out</div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Nav;
