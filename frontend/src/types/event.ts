import { ReactNode } from "react";

export interface Event {
  location: string;
  id: string;
  title: string;
  description: string;
  date: string;
  registrationType: 'individual' | 'school';
  detail: string;
}

