import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../interfaces/user';

export const userDetailPageResolverResolver: ResolveFn<User> = (route) => {
  const userService = inject(UserService);

  const userIdStr = route.paramMap.get('id');

  if (!userIdStr) throw new Error('User ID not found');
  else if (isNaN(parseInt(userIdStr)))
    throw new Error('User ID is not a number');

  const userId = parseInt(userIdStr);

  return userService.getUser(userId);
};
