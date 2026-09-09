import { useEffect, useState } from "react";
import {
  AlarmClock,
  Clock3,
  Globe2,
  Plus,
  Timer,
} from "lucide-react";

import "../styles/alarms.css";
import Navbar from "../components/navbar";

interface Alarm {
  id: number;
  time: string;
  name: string;
  schedule: string;
  enabled: boolean;
}

const initialAlarms: Alarm[] = [
  {
    id: 1,
    time: "06:30",
    name: "Morning run",
    schedule: "Mon–Fri",
    enabled: true,
  },
  {
    id: 2,
    time: "08:00",
    name: "Standup prep",
    schedule: "Weekdays",
    enabled: true,
  },
  {
    id: 3,
    time: "22:30",
    name: "Wind down",
    schedule: "Every day",
    enabled: false,
  },
];

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Australia/Adelaide",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function AnalogClock({ date }: { date: Date }) {
  const seconds = date.getSeconds();
  const minutes = date.getMinutes() + seconds / 60;
  const hours = (date.getHours() % 12) + minutes / 60;

  return (
    <div className="alarm-analog-clock">
      {Array.from({ length: 60 }, (_, index) => (
        <span
          key={index}
          className={`alarm-clock-marker ${
            index % 5 === 0 ? "major-marker" : ""
          }`}
          style={{ transform: `rotate(${index * 6}deg)` }}
        />
      ))}

      <span
        className="alarm-clock-hand alarm-hour-hand"
        style={{ transform: `rotate(${hours * 30}deg)` }}
      />

      <span
        className="alarm-clock-hand alarm-minute-hand"
        style={{ transform: `rotate(${minutes * 6}deg)` }}
      />

      <span
        className="alarm-clock-hand alarm-second-hand"
        style={{ transform: `rotate(${seconds * 6}deg)` }}
      />

      <span className="alarm-clock-centre" />
    </div>
  );
}

function Alarms() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [alarms, setAlarms] = useState<Alarm[]>(initialAlarms);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  const toggleAlarm = (id: number) => {
    setAlarms((currentAlarms) =>
      currentAlarms.map((alarm) =>
        alarm.id === id
          ? { ...alarm, enabled: !alarm.enabled }
          : alarm,
      ),
    );
  };

  const addAlarm = () => {
    const newAlarm: Alarm = {
      id: Date.now(),
      time: "12:00",
      name: "New alarm",
      schedule: "Every day",
      enabled: true,
    };

    setAlarms((currentAlarms) => [
      ...currentAlarms,
      newAlarm,
    ]);
  };

  const formattedDate = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Adelaide",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(currentTime);

  return (
    <div className="alarm-dashboard">
        <Navbar/>

      <main className="alarm-main">
        <header className="alarm-header">
          <div>
            <p className="alarm-label">ALARMS</p>
            <h1>Wake, break, remind</h1>
          </div>

          <div className="alarm-current-time">
            <strong>{formatTime(currentTime)}</strong>
            <span>{formattedDate}</span>
          </div>
        </header>

        <div className="alarm-content">
          <section className="alarm-reference-card">
            <AnalogClock date={currentTime} />

            <div className="alarm-reference-information">
              <p className="alarm-label">REFERENCE DIAL</p>

              <h2>One true time, read three ways</h2>

              <p className="alarm-description">
                The dial keeps mechanical time in the background
                — hour, minute, and a running second hand in
                signal orange — while every panel below reads
                from the same clock. Nothing here drifts.
              </p>

              <div className="alarm-clock-details">
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

          <section className="alarms-card">
            <div className="alarms-list">
              {alarms.map((alarm) => (
                <div
                  className={`alarm-row ${
                    !alarm.enabled ? "disabled" : ""
                  }`}
                  key={alarm.id}
                >
                  <time>{alarm.time}</time>

                  <div className="alarm-information">
                    <h3>{alarm.name}</h3>
                    <p>{alarm.schedule}</p>
                  </div>

                  <button
                    type="button"
                    className={`alarm-switch ${
                      alarm.enabled ? "enabled" : ""
                    }`}
                    onClick={() => toggleAlarm(alarm.id)}
                    aria-label={
                      alarm.enabled
                        ? `Disable ${alarm.name}`
                        : `Enable ${alarm.name}`
                    }
                  >
                    <span />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="add-alarm-button"
              onClick={addAlarm}
            >
              <Plus />
              Add alarm
            </button>
          </section>

          <footer className="alarm-footer">
            Chronodeck — a reference UI for time-keeping
            utilities · every readout above is live
          </footer>
        </div>
      </main>
    </div>
  );
}

export default Alarms;