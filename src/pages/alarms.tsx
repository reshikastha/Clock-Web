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
import About from "../components/about";
import Header from "../components/header";

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


function Alarms() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [alarms, setAlarms] = useState<Alarm[]>(initialAlarms);



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

   useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);



  return (
    <div className="alarm-dashboard">
        <Navbar/>

      <main className="alarm-main">
        <Header/>

        <div className="alarm-content">

          <About/>

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

         
        </div>
      </main>
    </div>
  );
}

export default Alarms;