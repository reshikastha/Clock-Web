export interface City {
  name: string;
  country: string;
  timeZone: string;
  fallbackGmt: string;
  highlighted?: boolean;
}

export interface TimeZoneData  {
    countryCode?: string;
  countryName?: string;
  zoneName: string;
  gmtOffset: number;
  timestamp: number;
  dst?: number;
}
export interface TimeApiResponse {
  status: "OK" | "FAILED";
  message: string;
  zones: TimeZoneData[];
}

export interface StoredTimeData extends TimeZoneData {

  fetchedAt: number;
}


