import * as functions from 'firebase-functions';

import { handleNotifyOnCreate } from './notifyOnCreate.firestore';
import { handleNotifyOnReassign } from './notifyOnReassign.firestore';
import { handleNotifyOnResolve } from './notifyOnResolve.firestore';

const basePath = '/actionRequests';

export const notifyOnCreate = functions.firestore.document(`${basePath}/{requestId}`).onCreate(handleNotifyOnCreate);
export const notifyOnReassign = functions.firestore.document(`${basePath}/{requestId}`).onUpdate(handleNotifyOnReassign);
export const notifyOnResolve = functions.firestore.document(`${basePath}/{requestId}`).onUpdate(handleNotifyOnResolve);
