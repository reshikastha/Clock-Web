

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  CalendarDays,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "../service/alarmService";

import type { Alarm, AlarmFormData } from "../types/alarms";

import { db } from "../config/firebase";
import "../styles/alarms.css";
import Navbar from "../components/navbar";
import About from "../components/about";
import Header from "../components/header";


function getTodayDate(): string {
  const currentDate = new Date();

  const localDate = new Date(
    currentDate.getTime() -
      currentDate.getTimezoneOffset() * 60_000,
  );

  return localDate.toISOString().split("T")[0];
}

const emptyForm: AlarmFormData = {
  time: "08:00",
  date: getTodayDate(),
  label: "",
};

function formatAlarmDate(date: string): string {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function Alarms() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  const [formData, setFormData] =
    useState<AlarmFormData>(emptyForm);

  const [editingAlarm, setEditingAlarm] =
    useState<Alarm | null>(null);

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] = useState("");

  /*
   * Load alarms from Firebase.
   * onSnapshot automatically updates the page
   * whenever Firestore data changes.
   */
  useEffect(() => {
    const alarmsCollection = collection(
      db,
      "alarms",
    );

    const unsubscribe = onSnapshot(
      alarmsCollection,
      (snapshot) => {
        const firebaseAlarms: Alarm[] =
          snapshot.docs.map((alarmDocument) => {
            const data = alarmDocument.data();

            return {
              id: alarmDocument.id,
              time: data.time ?? "",
              date: data.date ?? "",
              label: data.label ?? "Alarm",
              enabled: data.enabled ?? true,
            };
          });

        firebaseAlarms.sort(
          (firstAlarm, secondAlarm) => {
            const firstDateTime =
              `${firstAlarm.date} ${firstAlarm.time}`;

            const secondDateTime =
              `${secondAlarm.date} ${secondAlarm.time}`;

            return firstDateTime.localeCompare(
              secondDateTime,
            );
          },
        );

        setAlarms(firebaseAlarms);
        setError("");
        setIsLoading(false);
      },
      (firebaseError) => {
        console.error(firebaseError);
        setError(
          "Could not load alarms from Firebase.",
        );
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const openAddForm = () => {
    setEditingAlarm(null);

    setFormData({
      time: "08:00",
      date: getTodayDate(),
      label: "",
    });

    setError("");
    setIsFormOpen(true);
  };

  const openEditForm = (alarm: Alarm) => {
    setEditingAlarm(alarm);

    setFormData({
      time: alarm.time,
      date: alarm.date,
      label: alarm.label,
    });

    setError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAlarm(null);
    setFormData(emptyForm);
    setError("");
  };

  const handleFormChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  /*
   * Add a new alarm or update an existing alarm.
   */
  const saveAlarm = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !formData.label.trim() ||
      !formData.time ||
      !formData.date
    ) {
      setError(
        "Please enter a label, time and date.",
      );
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      if (editingAlarm) {
        const alarmReference = doc(
          db,
          "alarms",
          editingAlarm.id,
        );

        await updateDoc(alarmReference, {
          label: formData.label.trim(),
          time: formData.time,
          date: formData.date,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(
          collection(db, "alarms"),
          {
            label: formData.label.trim(),
            time: formData.time,
            date: formData.date,
            enabled: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
        );
      }

      closeForm();
    } catch (firebaseError) {
      console.error(firebaseError);
      setError("Could not save the alarm.");
    } finally {
      setIsSaving(false);
    }
  };

  /*
   * Enable or disable an alarm.
   */
  const toggleAlarm = async (alarm: Alarm) => {
    try {
      const alarmReference = doc(
        db,
        "alarms",
        alarm.id,
      );

      await updateDoc(alarmReference, {
        enabled: !alarm.enabled,
        updatedAt: serverTimestamp(),
      });
    } catch (firebaseError) {
      console.error(firebaseError);
      setError("Could not update the alarm.");
    }
  };

  /*
   * Delete an alarm from Firebase.
   */
  const handleDeleteAlarm = async (
    alarm: Alarm,
  ) => {
    const shouldDelete = window.confirm(
      `Are you sure you want to delete "${alarm.label}"?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteDoc(
        doc(db, "alarms", alarm.id),
      );
    } catch (firebaseError) {
      console.error(firebaseError);
      setError("Could not delete the alarm.");
    }
  };

  return (
    <div className="alarm-dashboard">
      <Navbar />

      <main className="alarm-main">
        <Header />

        <div className="alarm-content">
          <About />

          <section className="alarms-card">
            {error && !isFormOpen && (
              <div className="alarm-error">
                {error}
              </div>
            )}

            {isLoading ? (
              <p className="alarm-status">
                Loading alarms...
              </p>
            ) : alarms.length === 0 ? (
              <div className="empty-alarms">
                <CalendarDays />

                <h3>No alarms yet</h3>

                <p>
                  Select Add alarm to create one.
                </p>
              </div>
            ) : (
              <div className="alarms-list">
                {alarms.map((alarm) => (
                  <div
                    className={`alarm-row ${
                      alarm.enabled
                        ? ""
                        : "disabled"
                    }`}
                    key={alarm.id}
                  >
                    <time>{alarm.time}</time>

                    <div className="alarm-information">
                      <h3>{alarm.label}</h3>

                      <p>
                        {formatAlarmDate(
                          alarm.date,
                        )}
                      </p>
                    </div>

                    <div className="alarm-actions">
                      <button
                        type="button"
                        className="alarm-icon-button"
                        onClick={() =>
                          openEditForm(alarm)
                        }
                        aria-label={`Edit ${alarm.label}`}
                      >
                        <Pencil />
                      </button>

                      <button
                        type="button"
                        className="alarm-icon-button delete"
                        onClick={() =>
                          handleDeleteAlarm(alarm)
                        }
                        aria-label={`Delete ${alarm.label}`}
                      >
                        <Trash2 />
                      </button>

                      <button
                        type="button"
                        className={`alarm-switch ${
                          alarm.enabled
                            ? "enabled"
                            : ""
                        }`}
                        onClick={() =>
                          toggleAlarm(alarm)
                        }
                        aria-label={
                          alarm.enabled
                            ? `Disable ${alarm.label}`
                            : `Enable ${alarm.label}`
                        }
                      >
                        <span />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              className="add-alarm-button"
              onClick={openAddForm}
            >
              <Plus />
              Add alarm
            </button>
          </section>
        </div>
      </main>

      {isFormOpen && (
        <div
          className="alarm-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeForm();
            }
          }}
        >
          <div
            className="alarm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="alarm-modal-title"
          >
            <div className="alarm-modal-header">
              <div>
                <span className="alarm-modal-eyebrow">
                  ALARM
                </span>

                <h2 id="alarm-modal-title">
                  {editingAlarm
                    ? "Edit alarm"
                    : "Set a new alarm"}
                </h2>
              </div>

              <button
                type="button"
                className="alarm-modal-close"
                onClick={closeForm}
                aria-label="Close form"
              >
                <X />
              </button>
            </div>

            <form
              className="alarm-form"
              onSubmit={saveAlarm}
            >
              <label>
                Alarm label

                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleFormChange}
                  placeholder="Morning run"
                  maxLength={40}
                  required
                  autoFocus
                />
              </label>

              <div className="alarm-form-row">
                <label>
                  Time

                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleFormChange}
                    required
                  />
                </label>

                <label>
                  Date

                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    min={getTodayDate()}
                    required
                  />
                </label>
              </div>

              {error && (
                <div className="alarm-error">
                  {error}
                </div>
              )}

              <div className="alarm-form-buttons">
                <button
                  type="button"
                  className="alarm-cancel-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="alarm-save-button"
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : editingAlarm
                      ? "Save changes"
                      : "Set alarm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Alarms;