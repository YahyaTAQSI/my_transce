"use client";
import React, { useEffect, useRef, useState } from "react";
import "./SignIn.css";
import { FaArrowRight } from "react-icons/fa6";

import Image from "next/image";

import intra from "../../public/42_logo.svg";
import { useRecoilState, useRecoilValue } from "recoil";
import { useRouter } from "next/navigation";

import { loggedUser } from "../Atoms/logged";
import { userToken } from "../Atoms/userToken";

import axios from "axios";

import OtpInput from "react-otp-input";
import { MdError } from "react-icons/md";
import { userTwoFA } from "../Atoms/_2faUser";
import { twoFA } from "../Atoms/_If_2fa";

export default function SignIn({ signInUp }: { signInUp: boolean }) {
  const router = useRouter();
  const optInputRef = useRef(null);

  const [loggedU, setLoggedU] = useRecoilState(loggedUser);
  const [loggedU2fa, setLoggedU2fa] = useRecoilState(userTwoFA);

  const [twofa, setTwofa] = useRecoilState(twoFA);
  const [test, setTest] = useState(false);

  useEffect(() => {
    setTest(twofa);
  }, [twofa]);

  const [userTok, setUserTok] = useRecoilState(userToken);

  const [biometric, setBiometric] = useState<string>("");
  const [showPass, setShowPass] = useState<boolean>(false);

  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [pass, setPass] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const [user, setUser] = useState<any>(-1);

  useEffect(() => {
    setEmail("");
    setUsername("");
    setPass("");
    setBiometric("");
    setShowPass(false);
  }, [signInUp, loggedU]);

  signInUp && setTwofa(false);
  useEffect(() => {
    setEmail("");
    setUsername("");
    setPass("");
  }, [twofa]);

  const verifyTwoFA = async (e: any) => {
    e.preventDefault();

    const Udata = {
      uid: loggedU2fa,
      twoFaCode: biometric,
    };

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/2fa`,
        Udata
      );
      const data = await response.data;
      router.replace("/");
      setLoggedU(data.user.uid);
      setUserTok(data.userToken);
    } catch (error: any) {
      setErr(error?.response?.data?.message);
      setTimeout(() => {
        setErr("");
      }, 5000);
    }
  };

  const signUpFunction = async (e: any) => {
    e.preventDefault();
    const Udata = {
      email: email,
      username: username,
      password: pass,
    };
    const endpoint = signInUp ? "signup" : "login";
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/${endpoint}`,
        Udata
      );
      const data = await response.data;
      if (data.user.twoFA) {
        setLoggedU2fa(data.user.uid);
        setTwofa(true);
        return;
      }
      if (endpoint === "signup") router.replace("/settings");
      else router.replace("/");
      setLoggedU(data.user.uid);
      setUserTok(data.user_token);
    } catch (error: any) {
      if (error) {
        setErr(error?.response?.data?.message);
        setTimeout(() => {
          setErr("");
        }, 5000);
      }
    }
  };

  const uri = test ? verifyTwoFA : signUpFunction;

  const auth42 = async () => {
    router.push(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login-42`);
  };

  return (
    <form onSubmit={uri} className="sign_in_container">
      <input
        required={!test}
        placeholder="username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className={`sign_in_ships ${test && "hide_pass"}`}
        tabIndex={1}
      />

      <input
        required={signInUp}
        value={email}
        className={`sign_in_ships ${!signInUp && "hide_pass"}`}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email"
        type="email"
        tabIndex={signInUp ? 2 : 3}
      />

      <div className={`password_wraper  ${test && "hide_pass"}`}>
        <input
          tabIndex={signInUp ? 3 : 2}
          required={!test}
          placeholder="password"
          className={`sign_in_ships for_pass_only ${
            showPass && "change_pass_bg"
          }`}
          type={showPass ? "text" : "password"}
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
        <div className="eye_container">
          <div
            className={`eye ${test && "hide_eye"}`}
            onClick={() => setShowPass((prev) => !prev)}
            data-closed={showPass ? "" : null}
          >
            <div className="eye__base">
              <div className="eye__base__view">
                <div className="eye__base__view__iris"></div>
                <div className="eye__base__view__pupil"></div>
              </div>
            </div>
            <div className="eye__lid">
              <div className="eye__lid__mask"></div>
              <div className="eye__lid__lashes">
                <div className="eye__lid__lashes__line"></div>
                <div className="eye__lid__lashes__hair"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`two_factor_auth ${test && "show_2fa_container"}`}>
        <h1 className="_2fa_header">2-Factor Authentication</h1>
        <OtpInput
          value={biometric}
          shouldAutoFocus={test}
          onChange={setBiometric}
          numInputs={6}
          inputType="number"
          containerStyle="_2fa_container"
          inputStyle="_2fa_container_inputs"
          renderSeparator={<span className="_2fa_container_separator">-</span>}
          renderInput={(props) => <input {...props} required={test} />}
        />
      </div>

      <div className="btn_container">
        <div
          onClick={() => {
            setTwofa(false);
            setEmail("");
            setUsername("");
            setPass("");
            setBiometric("");
          }}
          className={` cancel_opt ${test && "show_cancel_opt"}`}
        >
          cancel
        </div>
        <button
          disabled={err?.length > 0}
          type="submit"
          className={`sign_in_ships btn ${err?.length > 0 && "lets_not_play"}`}
        >
          {!err?.length ? (
            !test ? (
              "Let's play"
            ) : (
              "verify"
            )
          ) : (
            <p className="from_errors">{err}</p>
          )}
          {err?.length ? <MdError /> : <FaArrowRight />}
        </button>
      </div>

      <h1>OR</h1>
      <div className="outher_methods">
        <button type="button" onClick={auth42} className="other_login">
          <Image src={intra} width={26} height={26} alt="42 auth" /> intra
        </button>
      </div>
    </form>
  );
}
