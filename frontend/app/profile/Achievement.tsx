import React from "react";
import "./Achievement.css";
import Image from "next/image";

export default function Achievement({ achievement }: { achievement: any }) {
  const date = () => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    if (achievement.createdAT === null) return null;
    const date = new Date(achievement.createdAT).toLocaleString(
      "en-US",
      options as Intl.DateTimeFormatOptions
    );
    return date;
  };
  return (
    <div
      className={`achievement_container ${
        !achievement.unlocked && "locked_achievement"
      }`}
    >
      <Image
        src={achievement.uri}
        width={200}
        height={200}
        className={`friend_achievement_badge  `}
        alt="achievement"
      />

      <div className="achievement_name">
        <div className="achievement_desc">
          <h1>{achievement.name}</h1>
          <h4 className="unlocked_at">{date()}</h4>
        </div>
        <h5>{achievement.description}</h5>
      </div>
    </div>
  );
}
