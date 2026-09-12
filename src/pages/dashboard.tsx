import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
   MapPin,
  Plus,
  Trash2,
  X,
} from "lucide-react";



import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";

import "../styles/dashboard.css";
import Navbar from "../components/navbar";
import About from "../components/about";
import Header from "../components/header";
import type { City, CityFormData, TimeApiResponse, StoredTimeData ,} from "../types/dashboard";


type CityTimes = Record<string, StoredTimeData>;

type DefaultCity = Omit<City, "id">;

const API_Key = import.meta.env.VITE_TIMEZONE_API_KEY;
const API_URL =
  "https://api.timezonedb.com/v2.1/list-time-zone";

  
const defaultCities: DefaultCity[] = [
  {
    name: "San Francisco",
    country: "United States",
    timeZone: "America/Los_Angeles",
    fallbackGmt: "GMT−7",
    highlighted: true,
    order: 1,
  },
  {
    name: "New York",
    country: "United States",
    timeZone: "America/New_York",
    fallbackGmt: "GMT−4",
    highlighted: false,
    order: 2,
  },
  {
    name: "London",
    country: "United Kingdom",
    timeZone: "Europe/London",
    fallbackGmt: "GMT+1",
    highlighted: false,
    order: 3,
  },
  {
    name: "Berlin",
    country: "Germany",
    timeZone: "Europe/Berlin",
    fallbackGmt: "GMT+2",
    highlighted: false,
    order: 4,
  },
  {
    name: "Adelaide",
    country: "Australia",
    timeZone: "Australia/Adelaide",
    fallbackGmt: "GMT+9:30",
    highlighted: true,
    order: 5,
  },
  {
    name: "Tokyo",
    country: "Japan",
    timeZone: "Asia/Tokyo",
    fallbackGmt: "GMT+9",
    highlighted: true,
    order: 6,
  },
  {
    name: "Singapore",
    country: "Singapore",
    timeZone: "Asia/Singapore",
    fallbackGmt: "GMT+8",
    highlighted: true,
    order: 7,
  },
  {
    name: "Mumbai",
    country: "India",
    timeZone: "Asia/Kolkata",
    fallbackGmt: "GMT+5:30",
    highlighted: false,
    order: 8,
  },
];

const emptyCityForm: CityFormData = {
  name: "",
  country: "",
  timeZone: "",
};

function createCityDocumentId(
  timeZone: string,
): string {
  return encodeURIComponent(
    timeZone.toLowerCase(),
  );
}

function formatGmtOffset(
  offsetInSeconds: number,
): string {
  if (offsetInSeconds === 0) {
    return "GMT";
  }

  const sign =
    offsetInSeconds < 0 ? "−" : "+";

  const absoluteSeconds = Math.abs(
    offsetInSeconds,
  );

  const hours = Math.floor(
    absoluteSeconds / 3600,
  );

  const minutes = Math.floor(
    (absoluteSeconds % 3600) / 60,
  );

  if (minutes === 0) {
    return `GMT${sign}${hours}`;
  }

  return `GMT${sign}${hours}:${String(
    minutes,
  ).padStart(2, "0")}`;
}

function getBrowserGmtOffset(
  timeZone: string,
): string {
  const timeZonePart =
    new Intl.DateTimeFormat("en-AU", {
      timeZone,
      timeZoneName: "longOffset",
    })
      .formatToParts(new Date())
      .find(
        (part) =>
          part.type === "timeZoneName",
      );

  return timeZonePart?.value ?? "GMT";
}

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

function getTimeZoneAbbreviation(
  date: Date,
  timeZone: string,
): string {
  const timeZonePart =
    new Intl.DateTimeFormat("en-AU", {
      timeZone,
      timeZoneName: "short",
    })
      .formatToParts(date)
      .find(
        (part) =>
          part.type === "timeZoneName",
      );

  return timeZonePart?.value ?? "";
}

function Dashboard() {
  const [cities, setCities] = useState<
    City[]
  >([]);

  const [cityTimes, setCityTimes] =
    useState<CityTimes>({});

  const [currentTick, setCurrentTick] =
    useState(Date.now());

  const [cityForm, setCityForm] =
    useState<CityFormData>(emptyCityForm);

  const [isCityFormOpen, setIsCityFormOpen] =
    useState(false);

  const [isCitiesLoading, setIsCitiesLoading] =
    useState(true);

  const [
    isTimezoneLoading,
    setIsTimezoneLoading,
  ] = useState(true);

  const [cityError, setCityError] =
    useState("");

  const [apiError, setApiError] =
    useState("");

  const [isSaving, setIsSaving] =
    useState(false);

  /*
   * Load cities from Firestore.
   * If the collection is empty, add the
   * original default cities to Firebase.
   */
  useEffect(() => {
    const citiesCollection = collection(
      db,
      "cities",
    );

    const unsubscribe = onSnapshot(
      citiesCollection,
      (snapshot) => {
        if (snapshot.empty) {
          const seedCities = async () => {
            try {
              await Promise.all(
                defaultCities.map((city) => {
                  const cityId =
                    createCityDocumentId(
                      city.timeZone,
                    );

                  return setDoc(
                    doc(db, "cities", cityId),
                    {
                      ...city,
                      createdAt:
                        serverTimestamp(),
                    },
                  );
                }),
              );
            } catch (error) {
              console.error(error);

              setCityError(
                "Could not add the default cities.",
              );

              setIsCitiesLoading(false);
            }
          };

          void seedCities();
          return;
        }

        const firebaseCities: City[] =
          snapshot.docs.map(
            (cityDocument) => {
              const data =
                cityDocument.data();

              return {
                id: cityDocument.id,
                name: data.name ?? "",
                country:
                  data.country ?? "",
                timeZone:
                  data.timeZone ?? "",
                fallbackGmt:
                  data.fallbackGmt ?? "GMT",
                highlighted:
                  data.highlighted ?? false,
                order: data.order ?? 0,
              };
            },
          );

        firebaseCities.sort(
          (firstCity, secondCity) =>
            firstCity.order -
            secondCity.order,
        );

        setCities(firebaseCities);
        setIsCitiesLoading(false);
        setCityError("");
      },
      (error) => {
        console.error(error);

        setCityError(
          "Could not load cities from Firebase.",
        );

        setIsCitiesLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  /*
   * Get current timezone information
   * from TimeZoneDB.
   */
  const fetchCityTimes =
    useCallback(async () => {
      if (cities.length === 0) {
        return;
      }

      if (!API_Key) {
        setApiError(
          "TimeZoneDB API key is missing.",
        );

        setIsTimezoneLoading(false);
        return;
      }

      setApiError("");

      try {
        const response = await fetch(
          `${API_URL}?key=${encodeURIComponent(
            API_Key,
          )}&format=json&fields=zoneName,gmtOffset,timestamp`,
        );

        if (!response.ok) {
          throw new Error(
            "TimeZoneDB request failed.",
          );
        }

        const data: TimeApiResponse =
          await response.json();

        if (data.status !== "OK") {
          throw new Error(
            data.message ||
              "TimeZoneDB request failed.",
          );
        }

        const requiredTimeZones = new Set(
          cities.map(
            (city) => city.timeZone,
          ),
        );

        const updatedTimes =
          data.zones.reduce<CityTimes>(
            (result, zone) => {
              if (
                requiredTimeZones.has(
                  zone.zoneName,
                )
              ) {
                result[zone.zoneName] = {
                  ...zone,
                  fetchedAt: Date.now(),
                };
              }

              return result;
            },
            {},
          );

        setCityTimes(updatedTimes);
      } catch (error) {
        console.error(error);

        setApiError(
          "Live timezone API is unavailable. Browser timezone data is being used.",
        );
      } finally {
        setIsTimezoneLoading(false);
      }
    }, [cities]);

  useEffect(() => {
    void fetchCityTimes();

    const refreshId = window.setInterval(
      () => {
        void fetchCityTimes();
      },
      10 * 60 * 1000,
    );

    return () =>
      window.clearInterval(refreshId);
  }, [fetchCityTimes]);

  useEffect(() => {
    const clockId = window.setInterval(
      () => {
        setCurrentTick(Date.now());
      },
      1000,
    );

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

    const elapsedTime =
      currentTick - apiData.fetchedAt;

    const utcTimeAtFetch =
      (apiData.timestamp -
        apiData.gmtOffset) *
      1000;

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

  const openCityForm = () => {
    setCityForm(emptyCityForm);
    setCityError("");
    setIsCityFormOpen(true);
  };

  const closeCityForm = () => {
    setCityForm(emptyCityForm);
    setCityError("");
    setIsCityFormOpen(false);
  };

  const handleCityFormChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;

    setCityForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const addCity = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const name = cityForm.name.trim();
    const country =
      cityForm.country.trim();
    const timeZone =
      cityForm.timeZone.trim();

    if (!name || !country || !timeZone) {
      setCityError(
        "Please enter the city, country and timezone.",
      );
      return;
    }

    try {
      new Intl.DateTimeFormat("en-AU", {
        timeZone,
      }).format(new Date());
    } catch {
      setCityError(
        "Invalid timezone. Example: Asia/Kathmandu",
      );
      return;
    }

    const cityAlreadyExists = cities.some(
      (city) =>
        city.timeZone.toLowerCase() ===
        timeZone.toLowerCase(),
    );

    if (cityAlreadyExists) {
      setCityError(
        "This timezone is already on your dashboard.",
      );
      return;
    }

    setIsSaving(true);
    setCityError("");

    try {
      const cityId =
        createCityDocumentId(timeZone);

      await setDoc(
        doc(db, "cities", cityId),
        {
          name,
          country,
          timeZone,
          fallbackGmt:
            getBrowserGmtOffset(timeZone),
          highlighted: false,
          order: Date.now(),
          createdAt: serverTimestamp(),
        },
      );

      closeCityForm();
    } catch (error) {
      console.error(error);

      setCityError(
        "Could not save the city to Firebase.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const removeCity = async (
    city: City,
  ) => {
    const shouldDelete = window.confirm(
      `Remove ${city.name} from the dashboard?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteDoc(
        doc(db, "cities", city.id),
      );
    } catch (error) {
      console.error(error);

      setCityError(
        "Could not delete the city.",
      );
    }
  };

  return (
    <div className="dashboard">
      <Navbar />

      <main className="main-content">
        <Header />

        <div className="dashboard-content">
          <About />

          {apiError && (
            <div className="timezone-api-message">
              {apiError}
            </div>
          )}

          {cityError && !isCityFormOpen && (
            <div className="city-error-message">
              {cityError}
            </div>
          )}

          {isCitiesLoading ? (
            <p className="cities-loading">
              Loading cities...
            </p>
          ) : (
            <section className="city-grid">
              {cities.map((city) => {
                const cityDate =
                  getCityDate(city);

                return (
                  <article
                    className={`city-card ${
                      city.highlighted
                        ? "city-card-highlighted"
                        : ""
                    }`}
                    key={city.id}
                  >
                    <button
                      type="button"
                      className="delete-city-button"
                      onClick={() =>
                        removeCity(city)
                      }
                      aria-label={`Remove ${city.name}`}
                    >
                      <Trash2 />
                    </button>

                    <div>
                      <h3>{city.name}</h3>

                      <p>
                        {city.country}

                        <span className="timezone-abbreviation">
                          {" "}
                          ·{" "}
                          {getTimeZoneAbbreviation(
                            cityDate,
                            city.timeZone,
                          )}
                        </span>
                      </p>
                    </div>

                    <time>
                      {isTimezoneLoading
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

              <button
                type="button"
                className="add-city-card"
                onClick={openCityForm}
              >
                <Plus />
                <span>Add city</span>
              </button>
            </section>
          )}
        </div>
      </main>

      {isCityFormOpen && (
        <div
          className="city-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeCityForm();
            }
          }}
        >
          <div
            className="city-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="city-modal-title"
          >
            <div className="city-modal-header">
              <div>
                <span>WORLD CLOCK</span>

                <h2 id="city-modal-title">
                  Add a new city
                </h2>
              </div>

              <button
                type="button"
                className="city-modal-close"
                onClick={closeCityForm}
                aria-label="Close form"
              >
                <X />
              </button>
            </div>

            <form
              className="city-form"
              onSubmit={addCity}
            >
              <label>
                City name

                <input
                  type="text"
                  name="name"
                  value={cityForm.name}
                  onChange={
                    handleCityFormChange
                  }
                  placeholder="Kathmandu"
                  required
                  autoFocus
                />
              </label>

              <label>
                Country

                <input
                  type="text"
                  name="country"
                  value={cityForm.country}
                  onChange={
                    handleCityFormChange
                  }
                  placeholder="Nepal"
                  required
                />
              </label>

              <label>
                IANA timezone

                <input
                  type="text"
                  name="timeZone"
                  value={cityForm.timeZone}
                  onChange={
                    handleCityFormChange
                  }
                  placeholder="Asia/Kathmandu"
                  required
                />
              </label>

              <div className="timezone-example">
                <MapPin />

                <span>
                  Examples: Asia/Kathmandu,
                  Australia/Adelaide,
                  America/Toronto
                </span>
              </div>

              {cityError && (
                <div className="city-error-message">
                  {cityError}
                </div>
              )}

              <div className="city-form-buttons">
                <button
                  type="button"
                  className="city-cancel-button"
                  onClick={closeCityForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="city-save-button"
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : "Add city"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;