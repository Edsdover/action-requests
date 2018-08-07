import { Timestamp } from '@firebase/firestore-types';

export abstract class FirebaseAbstract {
  key: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
