import React from "react";
import "./globals.css";
function LoadingPaddle() {
  return (
    <div className="container">
      <div className="bat">
        <div className="handle">
          <div className="inner"></div>
        </div>
        <div className="front"></div>
      </div>
      <div className="ball"></div>
    </div>
  );
}

export default LoadingPaddle;
