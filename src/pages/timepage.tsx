import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlarmClock,
  Clock3,
  Globe2,
  Timer as TimerIcon,
} from "lucide-react";

import "../styles/timetool.css";
import Navbar from "../components/navbar";
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

function AnalogClock({ date }: { date: Date }) {
  const seconds = date.getSeconds();
  const minutes = date.getMinutes() + seconds / 60;
  const hours = (date.getHours() % 12) + minutes / 60;

  return (
    <div className="tool-analog-clock">
      {Array.from({ length: 60 }, (_, index) => (
        <span
          key={index}
          className={`tool-marker ${
            index % 5 === 0 ? "major" : ""
          }`}
          style={{ transform: `rotate(${index * 6}deg)` }}
        />
      ))}

      <span
        className="tool-hand hour"
        style={{ transform: `rotate(${hours * 30}deg)` }}
      />
      <span
        className="tool-hand minute"
        style={{ transform: `rotate(${minutes * 6}deg)` }}
      />
      <span
        className="tool-hand second"
        style={{ transform: `rotate(${seconds * 6}deg)` }}
      />
      <span className="tool-clock-centre" />
    </div>
  );
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

  const formattedDate = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Adelaide",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(currentTime);

  return (
    <div className="tool-dashboard">
        <Navbar/>

      <main className="tool-main">
        <header className="tool-header">
          <div>
            <p className="tool-label">TIMER</p>
            <h1>Count down on purpose</h1>
          </div>

          <div className="tool-current-time">
            <strong>{formatCurrentTime(currentTime)}</strong>
            <span>{formattedDate}</span>
          </div>
        </header>

        <div className="tool-content">
          <section className="tool-reference-card">
            <AnalogClock date={currentTime} />

            <div className="tool-reference-info">
              <p className="tool-label">REFERENCE DIAL</p>
              <h2>One true time, read three ways</h2>

              <p className="tool-description">
                The dial keeps mechanical time in the background
                — hour, minute, and a running second hand in
                signal orange — while every panel below reads
                from the same clock. Nothing here drifts.
              </p>

              <div className="tool-details">
                <div>
                  <span>PRECISION</span>
                  <strong>±1s</strong>
                </div>

                <div>
                  <span>SOURCE</span>
                  <strong>system clock</strong>
                </div>

                <div>
                  <span>FORMAT</span>
                  <strong>24h</strong>
                </div>
              </div>
            </div>
          </section>

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

          <footer className="tool-footer">
            Chronodeck — a reference UI for time-keeping
            utilities · every readout above is live
          </footer>
        </div>
      </main>
    </div>
  );
}

export default TimerPage;