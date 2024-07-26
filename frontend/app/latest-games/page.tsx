"use client";
import React, { useState, useEffect } from "react";
import "../globals.css";
import "./latest-games.css";
import { useRecoilValue } from "recoil";
import { userToken } from "@/app/Atoms/userToken";
import { loggedUser } from "../Atoms/logged";

interface dataInterface {
  createdAt: string;
  endAt: string;
  gameMode: string;
  me: string;
  myScore: number;
  startAt: string;
  opponent: string;
  opponentScore: number;
  result: string;
}

const LatestGames = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<dataInterface[]>();

  const userTok = useRecoilValue(userToken);
  const userId = useRecoilValue(loggedUser);
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);

    const fetchedData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/match-history?id=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${userTok}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setData(data);
        console.log("heeeeeeeerrrrreeeeee");
        console.log(data);
      } catch (err) {
        console.error(">>>>>>", err);
      }
    };

    fetchedData();
  }, []);

  return (
    <>
      {loading ? (
        <div className="container">
          <div className="bat">
            <div className="handle">
              <div className="inner"></div>
            </div>
            <div className="front"></div>
          </div>
          <div className="ball"></div>
        </div>
      ) : (
        <div className="latest-games l">
          <div className="header">
            <h3>Latest games</h3>
          </div>
          <div className="latests">
            {data &&
              data?.map((match) => {
                return (
                  <div className="line" key={match.createdAt}>
                    <div className="player">
                      {match.opponent} <span>{match.opponentScore}</span>
                    </div>
                    <div className="gamestatus">
                      <div className={match.result === "WIN" ? "win" : "lose"}>
                        <div className="gameDate">
                          {new Date(match.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            }
                          )}
                        </div>
                        {match.result}
                      </div>
                    </div>
                    <div className="opponent">
                      <span>{match.myScore}</span>
                      {match.me}
                    </div>
                  </div>
                );
              })}
            {/* {player_data.matches.map((e: any) => {
              return e.todaysMatches.map((match: any) => {
                return (
                  <div className="line" key={e.hour}>
                    <div className="player">
                      {player_data.username} <span>{match.mygoals}</span>
                    </div>
                    <div className="gamestatus">
                      <div className={match.result === "WIN" ? "win" : "lose"}>
                        {match.result}
                      </div>
                    </div>
                    <div className="opponent">
                      <span>{match.opponentgoals}</span>
                      {match.opponent}
                    </div>
                  </div>
                );
              });
            })} */}
          </div>
        </div>
      )}
    </>
  );
};

export default LatestGames;
