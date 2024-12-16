import { Auth } from './auth';

export interface AuthState {
  currentAuth: Auth | null;
  roles: string[];
  isInitialized: boolean;
}
