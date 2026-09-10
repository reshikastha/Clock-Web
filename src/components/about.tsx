import { useEffect, useState } from "react";

import "../styles/dashboard.css";


function About() {

  const [currentTime, setCurrentTime] = useState<Date>(new Date());


    const AnalogClock = ({ date }: { date: Date }) =>{
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


 useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);
  return (
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
  )
}

export default About