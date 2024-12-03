export interface ProfileForm {
  [key: string]: string | Date | undefined;
  userName: string;
  knownAs: string;
  gender: string;
  birthDate: Date;
  city: string;
  country: string;
  introduction?: string;
  lookingFor?: string;
  interests?: string;
}
