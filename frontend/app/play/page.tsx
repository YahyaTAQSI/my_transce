"use client";
import PlayPage from "./playPage";
import { gameModeVar } from "../Atoms/gameMode";
import { useRecoilState, useRecoilValue } from "recoil";
// import RandomPlayer  from "./random-player/page";
// import AgainstFriend from "./against-friend/page";
import { useEffect, useState } from "react";
import { PingPong } from "./pingPong";

// const LoadingComponent = () => {
// 	return (
// 		<div className="container">
// 			<div className="bat">
// 				<div className="handle">
// 					<div className="inner"></div>
// 				</div>
// 				<div className="front"></div>
// 			</div>
// 			<div className="ball"></div>
// 		</div>
// 	);
// }

export default function Play() {
  // const [gameMode, setGameMode] = useRecoilState(gameModeVar);
  const gameMode = useRecoilValue(gameModeVar);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  // 	socket.on('go_to_random_game', () => {
  // 		setGameMode('random');
  // 	});
  // }, []);
  // useEffect(() => {
  // 	if (loading) {
  // 		const timer = setTimeout(() => {
  // 			setLoading(false);
  // 		}, 1000);
  // 		return () => clearTimeout(timer);
  // 	}
  // }, [loading]);

  // useEffect(() => {
  // 	setLoading(true);
  // }, [gameMode]);

  return (
    // loading ? <LoadingComponent /> :
    gameMode === "random" || gameMode === "friend" ? <PingPong /> : <PlayPage />
  );
}
