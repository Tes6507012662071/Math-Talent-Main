// frontend/src/types/event.ts
export interface Station {
  stationName: string;
  address: string;
  capacity: number;
  code: number;
}

export interface Event {
  _id: string;
  nameEvent: string;
  detail?: string;
  dateAndTime: string;
  location?: string;
  images?: string;
  registrationType: 'individual' | 'school';
  stations: Station[];
}