import React, { useState, useEffect } from "react";

export default function TimerUI() {
  const [timeLeft, setTimeLeft] = useState(180);
  const [isRunning, setIsRunning] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setIsGameOver(true);
          setIsRunning(false);
          window.dispatchEvent(new Event("round:expired")); // optional Phaser hook - I'm not sure what this does
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // cleanup: stop interval when component rerenders/unmounts or isRunning changes
    return () => clearInterval(interval);
  }, [isRunning]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="timer-div"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
      <h1 className="timer-text">⏱️ Time Remaining</h1>

      {isGameOver ? (
        <span className="game-over-text">❌ Game Over!</span>
      ) : (
        <span className="time-text">
          {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </span>
      )}
    </div>
  );
}