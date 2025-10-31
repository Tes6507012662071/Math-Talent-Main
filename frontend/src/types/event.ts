export interface Station {
  id?: string; 
  stationName: string;
  address: string;
  capacity: number;
  code: number;
}

export interface Event {
  id: string;
  nameEvent: string; 
  detail?: string;
  dateAndTime: string;
  location?: string;
  registrationType: 'individual' | 'school';
  images?: string;
  levels?: string[];
  stations: Station[];
  createdAt?: string; 
  updatedAt?: string; 
}