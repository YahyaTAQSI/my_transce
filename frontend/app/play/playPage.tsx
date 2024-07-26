import { useState, useEffect, SetStateAction, use } from "react";

/* Board Theme Component */
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

import "./play-page-style.css";
import { tablePicture } from "../Atoms/tablePicture";

import table1 from "../../public/game/tables/table1.png";
import table2 from "../../public/game/tables/table2.png";
import table3 from "../../public/game/tables/table3.png";
import table4 from "../../public/game/tables/table4.png";
import table5 from "../../public/game/tables/table5.png";
import table6 from "../../public/game/tables/table6.png";
import table7 from "../../public/game/tables/table7.png";
import table8 from "../../public/game/tables/table8.png";
import table9 from "../../public/game/tables/table9.png";

const images = [
  table6,
  table4,
  table5,
  table3,
  table7,
  table8,
  table9,
  table1,
  table2,
];

function BoardTheme() {
  const [slidesPerView, setSlidesPerView] = useState(3);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [, setTablePicture] = useRecoilState(tablePicture);

  useEffect(() => {
    setTablePicture(images[currentSlide].src);
  }, [currentSlide]);

  return (
    <div>
      <div className="upperTitle">
        {" "}
        <h2>Choose a table</h2>{" "}
      </div>
      <div className="slider-container">
        <Swiper
          slidesPerView={slidesPerView}
          centeredSlides={true}
          effect="coverflow"
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          breakpoints={{
            0: { slidesPerView: 1 },
            1024: { slidesPerView: 3 },
            2000: { slidesPerView: 5 },
          }}
          loop={true}
          slideToClickedSlide={true}
          className="mySwiper"
          onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex)}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <img src={image.src} alt={`Table ${index + 1}`} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

/* Game Mode Component */
import Popup from "./popup";
import Link from "next/link";

// Images
import robotMode from "@/public/game/mode1.png";
import friendMode from "../../public/game/mode2.png";
import randomMode from "../../public/game/mode3.png";
import { useRecoilState, useRecoilValue } from "recoil";
import { gameModeVar } from "../Atoms/gameMode";

import { loggedUser } from "../Atoms/logged";
import { useRouter } from "next/navigation";
import { useSocket } from "../SubChildrens";

function GameMode() {
  const { socket } = useSocket();
  const [showPopup, setShowPopup] = useState(false);
  const userId = useRecoilValue(loggedUser);

  const handlePopUp = () => {
    setShowPopup(!showPopup);
  };
  const [, setGameMode] = useRecoilState(gameModeVar);

  const handleGoToRandomGame = () => {
    if (!socket) return;
    setGameMode("random");
    socket.emit("go_to_random_game", { userId: userId });
  };

  const router = useRouter();

  const handleGotoBotGame = () => {
    router.push("/play/botgame");
  };

  return (
    <div>
      {showPopup ? <Popup setShowPopup={setShowPopup} /> : null}
      <div className="upperTitle">
        {" "}
        <h2>Choose the enemy</h2>{" "}
      </div>
      <div className="game-mode-container">
        <div className="game-mode-card">
          <span className="mode-game-button" onClick={handleGotoBotGame}>
            Against Robot
          </span>
          <img
            src={robotMode.src}
            alt="Game Mode"
            onClick={() => {
              setGameMode("robot");
            }}
          />
        </div>
        <div className="game-mode-card">
          <span className="mode-game-button" onClick={handlePopUp}>
            Against Friend
          </span>
          <img src={friendMode.src} alt="Game Mode" />
        </div>
        <div className="game-mode-card">
          <span className="mode-game-button" onClick={handleGoToRandomGame}>
            Random Player
          </span>
          <img src={randomMode.src} alt="Game Mode" />
        </div>
      </div>
    </div>
  );
}

/* Play Page */
export default function PlayPage() {
  return (
    <>
      <BoardTheme />
      <GameMode />
    </>
  );
}
