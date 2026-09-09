import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlarmClock,
  Clock3,
  Globe2,
  Timer,
} from "lucide-react";

import "../styles/timetool.css";
import Navbar from "../components/navbar";

function formatCurrentTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Australia/Adelaide",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function formatStopwatch(milliseconds: number) {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  const hundredths = Math.floor((milliseconds % 1000) / 10);

  return {
    main: `${String(minutes).padStart(2, "0")}:${String(
      seconds,
    ).padStart(2, "0")}`,
    hundredths: String(hundredths).padStart(2, "0"),
  };
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

function Stopwatch() {
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [milliseconds, setMilliseconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  useEffect(() => {
    const clockInterval = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => window.clearInterval(clockInterval);
  }, []);

  useEffect(() => {
    if (!running) return;

    const stopwatchInterval = window.setInterval(() => {
      setMilliseconds((current) => current + 10);
    }, 10);

    return () => window.clearInterval(stopwatchInterval);
  }, [running]);

  const resetStopwatch = () => {
    setRunning(false);
    setMilliseconds(0);
    setLaps([]);
  };

  const stopwatchTime = formatStopwatch(milliseconds);

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
            <p className="tool-label">STOPWATCH</p>
            <h1>Measure what's running</h1>
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

          <section className="stopwatch-card">
            <div className="stopwatch-display">
              <span>{stopwatchTime.main}</span>
              <small>.{stopwatchTime.hundredths}</small>
            </div>

            <div className="stopwatch-buttons">
              <button
                className="primary-button"
                onClick={() => setRunning((current) => !current)}
              >
                {running ? "Pause" : "Start"}
              </button>

              <button
                onClick={() =>
                  setLaps((current) => [
                    ...current,
                    milliseconds,
                  ])
                }
                disabled={milliseconds === 0}
              >
                Lap
              </button>

              <button onClick={resetStopwatch}>
                Reset
              </button>
            </div>

            {laps.length > 0 && (
              <div className="lap-list">
                {laps.map((lap, index) => {
                  const time = formatStopwatch(lap);

                  return (
                    <div key={`${lap}-${index}`}>
                      <span>Lap {index + 1}</span>
                      <strong>
                        {time.main}.{time.hundredths}
                      </strong>
                    </div>
                  );
                })}
              </div>
            )}
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

export default Stopwatch;