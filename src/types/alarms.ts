import type { Timestamp } from "firebase/firestore";

export interface Alarm {
  id: string;
  time: string;
  date: string;
  label: string;
  enabled: boolean;
  createdAt?: Timestamp | null;
}

export interface AlarmFormData {
  time: string;
  date: string;
  label: string;
}