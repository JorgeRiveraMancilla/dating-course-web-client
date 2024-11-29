import { Auth } from './auth';

export class UserParams {
  gender: string;
  minAge = 18;
  maxAge = 99;
  pageNumber = 1;
  pageSize = 10;
  orderBy = 'lastActive';

  constructor(auth: Auth | null) {
    this.gender = auth?.userGender === 'female' ? 'male' : 'female';
  }
}
