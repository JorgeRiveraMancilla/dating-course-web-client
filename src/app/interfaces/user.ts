import { Photo } from './photo';

export interface User {
  id: number;
  userName: string;
  email: string;
  knownAs: string;
  age: number;
  gender: string;
  introduction?: string;
  interests?: string;
  lookingFor?: string;
  city: string;
  country: string;
  created: Date;
  lastActive: Date;
  photos: Photo[];
  mainPhoto?: Photo;
}
