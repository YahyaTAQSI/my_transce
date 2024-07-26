"use client";
import "./Login.css";
import log_in_out from "../../public/login.png";
import raqeta from "../../public/rakita.png";
import apb from "../../public/apb.png";

import Image from "next/image";
import SignIn from "./SignIn";
import { useEffect, useState } from "react";
import { loggedUser } from "../Atoms/logged";
import { useRecoilValue } from "recoil";
import { useRouter } from "next/navigation";

export default function Login() {
  const [signInUp, setSignInUp] = useState(false);
  const router = useRouter();
  const endpoint = signInUp ? "signup" : "login";

  const logged = useRecoilValue(loggedUser);

  useEffect(() => {
    if (logged !== -1 && endpoint === "signup") router.replace("/settings");
    else router.replace("/");
  }, [logged]);

  const switchSides = () => {
    setSignInUp((prev) => !prev);
  };

  return (
    <div className="login_container">
      <div className="sign_in_out">
        <input type="checkbox" name="check" id="check" />
        <div className="sign_in">
          <div className="sign_in_header">
            <h1>sign {signInUp ? "up" : "in"}</h1>
            <h3>
              {" "}
              {signInUp && "New? create "} use you are ApexPongBattle account to
              continue
            </h3>
          </div>
          <SignIn signInUp={signInUp as boolean} />
          <h5>
            you {!signInUp && "don't"} have an account?{" "}
            <label onClick={switchSides} htmlFor="check">
              Sing {signInUp ? "In" : "Up"}.
            </label>
          </h5>
          <div className="login_logo">
            <Image className="logo_img" src={raqeta} alt="logo_img" />

            <Image className="logo_img" src={apb} alt="logo_name" />
          </div>
        </div>

        <Image className="log_in_out_img" src={log_in_out} alt="log_in_out" />
      </div>
    </div>
  );
}
