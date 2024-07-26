"use client";
import { useState } from "react";
import "./404.css";
import { useRouter } from "next/navigation";
export default function Custom404() {
  const [userName, setUserName] = useState("");
  const route = useRouter();
  const redirectUser = (e: any) => {
    e.preventDefault();
    route.push(`/profile/${userName}`);
  };
  return (
    <div className="_404_error_container">
      <div className="_404_error_msg">
        <div className="_404_noise"></div>
        <div className="_404_overlay"></div>
        <form onSubmit={redirectUser} className="_404_terminal">
          <>
            <h1>
              Error <span className="_404_errorcode">404</span>
            </h1>
            <p className="_404_output">
              The User you are looking for might have been removed,
              <br /> had its name changed or is temporarily unavailable.
            </p>
            <p className="_404_output">
              Please try to search with another name
            </p>
            <input
              required
              placeholder="userName"
              className="_404_userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              type="text"
            />
            <div className="_404_btns_containers_error_404">
              <button type="submit" className="_404_output">
                Good luck.
              </button>
              <button
                onClick={() => {
                  route.push("/profile");
                }}
                type="button"
                className="_404_output"
              >
                go back
              </button>
            </div>
          </>
        </form>
      </div>
    </div>
  );
}
