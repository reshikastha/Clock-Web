import { useEffect, useState } from "react";
import {
  AlarmClock,
  Clock3,
  Globe2,
  Plus,
  Timer,
} from "lucide-react";

import "../styles/dashboard.css";
import Navbar from "../components/navbar";

interface City {
  name: string;
  country: string;
  timeZone: string;
  gmt: string;
  highlighted?: boolean;
}

const cities: City[] = [
  {
    name: "San Francisco",
    country: "United States",
    timeZone: "America/Los_Angeles",
    gmt: "GMT−7",
    highlighted: true,
  },
  {
    name: "New York",
    country: "United States",
    timeZone: "America/New_York",
    gmt: "GMT−4",
  },
  {
    name: "London",
    country: "United Kingdom",
    timeZone: "Europe/London",
    gmt: "GMT+1",
  },
  {
    name: "Berlin",
    country: "Germany",
    timeZone: "Europe/Berlin",
    gmt: "GMT+2",
  },
  {
    name: "Adelaide",
    country: "Australia",
    timeZone: "Australia/Adelaide",
    gmt: "GMT+9:30",
    highlighted: true,
  },
  {
    name: "Tokyo",
    country: "Japan",
    timeZone: "Asia/Tokyo",
    gmt: "GMT+9",
    highlighted: true,
  },
  {
    name: "Singapore",
    country: "Singapore",
    timeZone: "Asia/Singapore",
    gmt: "GMT+8",
    highlighted: true,
  },
  {
    name: "Mumbai",
    country: "India",
    timeZone: "Asia/Kolkata",
    gmt: "GMT+5:30",
  },
];

function formatTime(
  date: Date,
  timeZone: string,
  includeSeconds = false,
): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    ...(includeSeconds && { second: "2-digit" }),
    hour12: false,
  }).format(date);
}

function AnalogClock({ date }: { date: Date }) {
  const seconds = date.getSeconds();
  const minutes = date.getMinutes() + seconds / 60;
  const hours = (date.getHours() % 12) + minutes / 60;

  return (
    <div className="analog-clock">
      {Array.from({ length: 60 }, (_, index) => (
        <span
          key={index}
          className={`clock-marker ${
            index % 5 === 0 ? "clock-marker-major" : ""
          }`}
          style={{ transform: `rotate(${index * 6}deg)` }}
        />
      ))}

      <span
        className="clock-hand hour-hand"
        style={{ transform: `rotate(${hours * 30}deg)` }}
      />

      <span
        className="clock-hand minute-hand"
        style={{ transform: `rotate(${minutes * 6}deg)` }}
      />

      <span
        className="clock-hand second-hand"
        style={{ transform: `rotate(${seconds * 6}deg)` }}
      />

      <span className="clock-centre" />
    </div>
  );
}

function Dashboard() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  const adelaideDate = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Adelaide",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(currentTime);

  return (
    <div className="dashboard">
        <Navbar/>

      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <p className="section-label">WORLD CLOCK</p>
            <h1>Everywhere, at once</h1>
          </div>

          <div className="current-time">
            <strong>
              {formatTime(
                currentTime,
                "Australia/Adelaide",
                true,
              )}
            </strong>

            <span>{adelaideDate}</span>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="reference-card">
            <AnalogClock date={currentTime} />

            <div className="reference-information">
              <p className="section-label">REFERENCE DIAL</p>

              <h2>One true time, read three ways</h2>

              <p className="reference-description">
                The dial keeps mechanical time in the background — hour,
                minute, and a running second hand in signal orange — while
                every panel below reads from the same clock. Nothing here
                drifts.
              </p>

              <div className="clock-details">
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

          <section className="city-grid">
            {cities.map((city) => (
              <article
                className={`city-card ${
                  city.highlighted ? "city-card-highlighted" : ""
                }`}
                key={city.name}
              >
                <div>
                  <h3>{city.name}</h3>
                  <p>{city.country}</p>
                </div>

                <time>
                  {formatTime(currentTime, city.timeZone)}
                </time>

                <span>{city.gmt}</span>
              </article>
            ))}

            <button className="add-city-card">
              <Plus />
              <span>Add city</span>
            </button>
          </section>

          <footer className="dashboard-footer">
            Chronodeck — a reference UI for time-keeping utilities · every
            readout above is live
          </footer>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;