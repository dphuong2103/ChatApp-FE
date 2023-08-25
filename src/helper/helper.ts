import { UserCredential } from 'firebase/auth';
import { User } from '@data-type';

export async function convertGoogleUserToUser(
  ggUser: UserCredential
): Promise<User | null> {
  if (ggUser.user == null) return null;
  return {
    id: ggUser.user.uid ?? '',
    displayName: ggUser.user.displayName ?? '',
    email: ggUser.user.email ?? '',
    accessToken: await ggUser.user.getIdToken(),
  };
}
