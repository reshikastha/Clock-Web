import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


import "../styles/timetool.css";
import Navbar from "../components/navbar";
import About from "../components/about";
import Header from "../components/header";
interface TimerPreset {
  name: string;
  seconds: number;
}

const timerPresets: TimerPreset[] = [
  { name: "Focus block", seconds: 5 * 60 },
  { name: "Short break", seconds: 10 * 60 },
  { name: "Deep work", seconds: 15 * 60 },
  { name: "Full sprint", seconds: 25 * 60 },
];

function formatCurrentTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Australia/Adelaide",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}



function TimerPage() {
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedSeconds, setSelectedSeconds] = useState(300);
  const [remainingSeconds, setRemainingSeconds] =
    useState(300);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const clockInterval = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => window.clearInterval(clockInterval);
  }, []);

  useEffect(() => {
    if (!running || remainingSeconds <= 0) return;

    const timerInterval = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          setRunning(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerInterval);
  }, [running, remainingSeconds]);

  const choosePreset = (seconds: number) => {
    setRunning(false);
    setSelectedSeconds(seconds);
    setRemainingSeconds(seconds);
  };

  const resetTimer = () => {
    setRunning(false);
    setRemainingSeconds(selectedSeconds);
  };

  const progress =
    selectedSeconds === 0
      ? 0
      : (remainingSeconds / selectedSeconds) * 100;

  return (
    <div className="tool-dashboard">
        <Navbar/>

      <main className="tool-main">
       <Header/>

        <div className="tool-content">
         <About/>

          <section className="timer-card">
            <div
              className="timer-progress"
              style={{
                background: `conic-gradient(
                  #ff7040 ${progress}%,
                  #343a44 ${progress}%
                )`,
              }}
            >
              <div>
                <strong>
                  {formatCountdown(remainingSeconds)}
                </strong>

                <span>
                  {remainingSeconds === 0
                    ? "COMPLETE"
                    : running
                      ? "RUNNING"
                      : "READY"}
                </span>
              </div>
            </div>

            <div className="timer-options">
              {timerPresets.map((preset) => (
                <button
                  key={preset.name}
                  className={
                    selectedSeconds === preset.seconds
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    choosePreset(preset.seconds)
                  }
                >
                  <span>{preset.name}</span>
                  <small>
                    {String(preset.seconds / 60).padStart(
                      2,
                      "0",
                    )}
                    :00
                  </small>
                </button>
              ))}

              <div className="timer-buttons">
                <button
                  className="primary-button"
                  onClick={() =>
                    setRunning((current) => !current)
                  }
                  disabled={remainingSeconds === 0}
                >
                  {running ? "Pause" : "Start"}
                </button>

                <button onClick={resetTimer}>
                  Reset
                </button>
              </div>
            </div>
          </section>

        
        </div>
      </main>
    </div>
  );
}

export default TimerPage;