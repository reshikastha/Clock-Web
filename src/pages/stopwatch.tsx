import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


import "../styles/timetool.css";
import Navbar from "../components/navbar";
import About from "../components/about";
import Header from "../components/header";

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

 

  return (
    <div className="tool-dashboard">
    <Navbar/>

      <main className="tool-main">
      <Header/>

        <div className="tool-content">
         <About/>

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

        
        </div>
      </main>
    </div>
  );
}

export default Stopwatch;