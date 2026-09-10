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
import About from "../components/about";
import Header from "../components/header";

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


function Dashboard() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

 

  return (
    <div className="dashboard">
        <Navbar/>

      <main className="main-content">
      
      <Header/>
        <div className="dashboard-content">
          <About/>

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

          
        </div>
      </main>
    </div>
  );
}

export default Dashboard;