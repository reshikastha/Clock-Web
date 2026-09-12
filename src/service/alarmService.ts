import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
  type Unsubscribe, 
} from "firebase/firestore";

import { db } from "../config/firebase";

import type{ Alarm, AlarmFormData } from "../types/alarms";

const ALARMS_COLLECTION = "alarms";

export function subscribeToAlarms(
  onSuccess: (alarms: Alarm[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const alarmsReference = collection(
    db,
    ALARMS_COLLECTION,
  );

  return onSnapshot(
    alarmsReference,
    (snapshot) => {
      const alarms: Alarm[] = snapshot.docs.map(
        (alarmDocument) => {
          const data = alarmDocument.data();

          return {
            id: alarmDocument.id,
            time: data.time ?? "",
            date: data.date ?? "",
            label: data.label ?? "Alarm",
            enabled: data.enabled ?? true,
            createdAt: data.createdAt ?? null,
          };
        },
      );

      alarms.sort((firstAlarm, secondAlarm) => {
        const firstValue =
          `${firstAlarm.date} ${firstAlarm.time}`;

        const secondValue =
          `${secondAlarm.date} ${secondAlarm.time}`;

        return firstValue.localeCompare(secondValue);
      });

      onSuccess(alarms);
    },
    (error) => {
      onError(error);
    },
  );
}

export async function createAlarm(
  alarm: AlarmFormData,
): Promise<void> {
  await addDoc(
    collection(db, ALARMS_COLLECTION),
    {
      label: alarm.label.trim(),
      time: alarm.time,
      date: alarm.date,
      enabled: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  );
}

export async function editAlarm(
  alarmId: string,
  alarm: AlarmFormData,
): Promise<void> {
  const alarmReference = doc(
    db,
    ALARMS_COLLECTION,
    alarmId,
  );

  await updateDoc(alarmReference, {
    label: alarm.label.trim(),
    time: alarm.time,
    date: alarm.date,
    updatedAt: serverTimestamp(),
  });
}

export async function setAlarmEnabled(
  alarmId: string,
  enabled: boolean,
): Promise<void> {
  const alarmReference = doc(
    db,
    ALARMS_COLLECTION,
    alarmId,
  );

  await updateDoc(alarmReference, {
    enabled,
    updatedAt: serverTimestamp(),
  });
}

export async function removeAlarm(
  alarmId: string,
): Promise<void> {
  const alarmReference = doc(
    db,
    ALARMS_COLLECTION,
    alarmId,
  );

  await deleteDoc(alarmReference);
}

export { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, updateDoc };
