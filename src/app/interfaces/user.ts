import { Photo } from './photo';

export interface User {
  id: number;
  userName: string;
  email: string;
  knownAs: string;
  birthDate: string;
  age: number;
  gender: string;
  introduction?: string;
  lookingFor?: string;
  interests?: string;
  city: string;
  country: string;
  created: Date;
  lastActive: Date;
  photos: Photo[];
  mainPhoto?: Photo;
  isLiked: boolean;
}
