import { ReactNode } from "react";

export interface Event {
  location: string;
  _id: string;
  title: string;
  description: string;
  date: string;
  registrationType: 'individual' | 'school';
  detail: string;
}

export interface ExamSchedule {
  level: string;
  registerTime: string;
  examTime: string;
  examlocation: string;
}

export interface DetailEvent {
  id: string;
  title: string;
  description: string;
  date: string; // หรือ Date string
  location: string;
  registrationType: string;
  detail: string;
  image: string;
  examSchedules?: ExamSchedule[];
}