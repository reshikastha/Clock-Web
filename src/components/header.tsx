import { useEffect, useState } from "react";
import "../styles/dashboard.css";


function Header() {
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const formatTime = (
        date: Date,
        timeZone: string,
        includeSeconds = false,
        ): string  =>{
        return new Intl.DateTimeFormat("en-GB", {
            timeZone,
            hour: "2-digit",
            minute: "2-digit",
            ...(includeSeconds && { second: "2-digit" }),
            hour12: false,
        }).format(date);
    }
        
    

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
  )
}

export default Header