"use client";

import React, { useEffect, useState } from "react";
import "./ProfileDetails.css";
import Friends from "./Friends";
import Stats from "./Stats";
import Achievements from "./Achievements";
import AddFriendSection from "../chat/Friends/AddFriendSection";

export default function ProfileDetails({
  whichProfile,
}: {
  whichProfile: any;
}) {
  const [switchElements, setSwitchElements] = useState("stats");

  useEffect(() => {
    setSwitchElements("stats");
  }, [whichProfile]);

  const switchE = (e: React.MouseEvent<HTMLButtonElement>) => {
    setSwitchElements(e.currentTarget.textContent || "");
  };
  return (
    <div className="profile_details_container">
      <div className="profile_details_header">
        <button
          onClick={switchE}
          className={`${switchElements === "stats" && "underline_animation"}`}
        >
          stats
        </button>

        <button
          onClick={switchE}
          className={`${switchElements === "friends" && "underline_animation"}`}
        >
          friends
        </button>
        <button
          onClick={switchE}
          className={`${
            switchElements === "achievements" && "underline_animation"
          }`}
        >
          achievements
        </button>
      </div>
      <div className="profile_details_data">
        {switchElements === "stats" && <Stats />}
        {switchElements === "friends" && (
          <>
            <Friends whichProfile={whichProfile} />
            <AddFriendSection />
          </>
        )}
        {switchElements === "achievements" && (
          <Achievements whichProfile={whichProfile} />
        )}
      </div>
    </div>
  );
}
