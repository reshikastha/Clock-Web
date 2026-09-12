export interface City {
   id: string;
  name: string;
  country: string;
  timeZone: string;
  fallbackGmt: string;
  highlighted: boolean;
  order: number;
}

export interface CityFormData {
  name: string;
  country: string;
  timeZone: string;
}

export interface TimeZoneData  {
    zoneName: string;
  gmtOffset: number;
  timestamp: number;
}
export interface TimeApiResponse {
 status: "OK" | "FAILED";
  message: string;
  zones: TimeZoneData[];
}

export interface StoredTimeData extends TimeZoneData {

  fetchedAt: number;
}



