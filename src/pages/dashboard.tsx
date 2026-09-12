import { useEffect, useState, useCallback } from "react";
import {
  Plus,
} from "lucide-react";

import "../styles/dashboard.css";
import Navbar from "../components/navbar";
import About from "../components/about";
import Header from "../components/header";
import type { City, TimeApiResponse, StoredTimeData } from "../types/dashboard";


type CityTimes = Record<string, StoredTimeData>;


const API_Key = import.meta.env.VITE_TIMEZONE_API_KEY;
const API_URL =
  "https://api.timezonedb.com/v2.1/list-time-zone";
const cities: City[] = [
  {
    name: "San Francisco",
    country: "United States",
    timeZone: "America/Los_Angeles",
    fallbackGmt: "fallback Gmt−7",
    highlighted: true,
  },
  {
    name: "New York",
    country: "United States",
    timeZone: "America/New_York",
    fallbackGmt: "fallback Gmt−4",
  },
  {
    name: "London",
    country: "United Kingdom",
    timeZone: "Europe/London",
    fallbackGmt: "fallback Gmt+1",
  },
  {
    name: "Berlin",
    country: "Germany",
    timeZone: "Europe/Berlin",
    fallbackGmt: "fallback Gmt+2",
  },
  {
    name: "Adelaide",
    country: "Australia",
    timeZone: "Australia/Adelaide",
    fallbackGmt: "fallbackGmt+9:30",
    highlighted: true,
  },
  {
    name: "Tokyo",
    country: "Japan",
    timeZone: "Asia/Tokyo",
    fallbackGmt: "fallback Gmt+9",
    highlighted: true,
  },
  {
    name: "Singapore",
    country: "Singapore",
    timeZone: "Asia/Singapore",
    fallbackGmt: "fallback Gmt+8",
    highlighted: true,
  },
  {
    name: "Mumbai",
    country: "India",
    timeZone: "Asia/Kolkata",
    fallbackGmt: "fallback Gmt+5:30",
  },
];


function formatTime(
  date: Date,
  timeZone: string,
): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatGmtOffset(
  offsetInSeconds: number,
): string {
  const sign =
    offsetInSeconds < 0 ? "−" : "+";

  const absoluteOffset = Math.abs(
    offsetInSeconds,
  );

  const hours = Math.floor(
    absoluteOffset / 3600,
  );

  const minutes = Math.floor(
    (absoluteOffset % 3600) / 60,
  );

  if (minutes === 0) {
    return `GMT${sign}${hours}`;
  }

  return `GMT${sign}${hours}:${String(
    minutes,
  ).padStart(2, "0")}`;
}

function getTimezoneAbbreviation(
  date: Date,
  timeZone: string,
): string {
  const parts = new Intl.DateTimeFormat(
    "en-AU",
    {
      timeZone,
      timeZoneName: "short",
    },
  ).formatToParts(date);

  return (
    parts.find(
      (part) =>
        part.type === "timeZoneName",
    )?.value ?? ""
  );
}


function Dashboard() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
   const [cityTimes, setCityTimes] = useState<CityTimes>({});
  const [currentTick, setCurrentTick] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const fetchCityTimes =
    useCallback(async () => {
      setApiError("");

      if (!API_Key) {
        setApiError(
          "Timezone API key is missing.",
        );

        setIsLoading(false);
        return;
      }

      try {
        const url =
          `${API_URL}?key=${encodeURIComponent(
            API_Key,
          )}` +
          "&format=json" +
          "&fields=zoneName,gmtOffset,timestamp";

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `API request failed: ${response.status}`,
          );
        }

        const data: TimeApiResponse =
          await response.json();

        if (data.status !== "OK") {
          throw new Error(
            data.message ||
              "Timezone API request failed.",
          );
        }

        const requestedTimezones =
          new Set(
            cities.map(
              (city) => city.timeZone,
            ),
          );

        const fetchedAt = Date.now();

        const selectedZones =
          data.zones.filter((zone) =>
            requestedTimezones.has(
              zone.zoneName,
            ),
          );

        const newCityTimes =
          Object.fromEntries(
            selectedZones.map((zone) => [
              zone.zoneName,
              {
                ...zone,
                fetchedAt,
              },
            ]),
          );

        setCityTimes(newCityTimes);
      } catch (error) {
        console.error(
          "Timezone API error:",
          error,
        );

        setApiError(
          "Live timezone information is unavailable. Browser timezone data is being used.",
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchCityTimes();

    const refreshId =
      window.setInterval(
        fetchCityTimes,
        10 * 60 * 1000,
      );

    return () =>
      window.clearInterval(refreshId);
  }, [fetchCityTimes]);

  useEffect(() => {
    const clockId =
      window.setInterval(() => {
        setCurrentTick(Date.now());
      }, 1000);

    return () =>
      window.clearInterval(clockId);
  }, []);

  const getCityDate = (
    city: City,
  ): Date => {
    const apiData =
      cityTimes[city.timeZone];

    if (!apiData) {
      return new Date(currentTick);
    }

    /*
     * TimeZoneDB's timestamp represents
     * the local timestamp.
     *
     * Subtracting gmtOffset converts it
     * into a UTC timestamp.
     */
    const utcTimeAtFetch =
      (apiData.timestamp -
        apiData.gmtOffset) *
      1000;

    const elapsedTime =
      currentTick -
      apiData.fetchedAt;

    return new Date(
      utcTimeAtFetch + elapsedTime,
    );
  };

  const getCityOffset = (
    city: City,
  ): string => {
    const apiData =
      cityTimes[city.timeZone];

    if (!apiData) {
      return city.fallbackGmt;
    }

    return formatGmtOffset(
      apiData.gmtOffset,
    );
  };


  return (
    <div className="dashboard">
        <Navbar/>

      <main className="main-content">
      
      <Header/>
        <div className="dashboard-content">
          <About/>
        {apiError && (
                <div className="timezone-api-message">
                  {apiError}
                </div>
              )}
          
          <section className="city-grid">
            {cities.map((city) => {
              const cityDate =
                getCityDate(city);

              const apiData =
                cityTimes[city.timeZone];

              return (
                <article
                  className={`city-card ${
                    city.highlighted
                      ? "city-card-highlighted"
                      : ""
                  }`}
                  key={city.timeZone}
                >
                  <div>
                    <h3>{city.name}</h3>

                    <p>
                      {city.country}

                      {apiData && (
                        <span className="timezone-abbreviation">
                          {" "}
                          ·{" "}
                          {getTimezoneAbbreviation(
                            cityDate,
                            city.timeZone,
                          )}
                        </span>
                      )}
                    </p>
                  </div>

                  <time>
                    {isLoading
                      ? "--:--"
                      : formatTime(
                          cityDate,
                          city.timeZone,
                        )}
                  </time>

                  <span>
                    {getCityOffset(city)}
                  </span>
                </article>
              );
            })}

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