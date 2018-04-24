import { sendEmail } from './mailgun.service';
import { ccAddresses, EMAIL_PREFIX } from './shared';
import { validateEmail } from './util';

// Sends an email when Action Request is resolved
export function handleNotifyOnResolve(change, context) {
  const actionRequest = change.after.data();
  const previousValue = change.before.data();
  const timestamp = new Date().toUTCString().slice(0, -7);

  if (actionRequest.notifyOnResolve === timestamp) {
    console.info(`onResolve notification has already triggered. Goodbye!`);
    return 0;
  }

  if (actionRequest.status === previousValue.status ) {
    console.info(`Status hasn't changed. Goodbye!`);
    return 0;
  }

  if (actionRequest.status !== 'resolved') {
    console.info(`Action Request is not resolved. Goodbye!`);
    return 0;
  }

  console.info(`Debug: actionRequest:`, JSON.stringify(actionRequest, null, 2));

  const emailSubject = `[${EMAIL_PREFIX}] (${actionRequest.humanReadableCode}) Action Request Resolved`;
  const toAddress = actionRequest.assignee;

  const sanitizedWatchers = (actionRequest.watchers && actionRequest.watchers.length)
    ? actionRequest.watchers.map(watcher => validateEmail(watcher))
    : [];

  const data = {
    to: validateEmail(toAddress),
    cc: [ validateEmail(ccAddresses), sanitizedWatchers ].join(','),
    subject: emailSubject,
    text: 'Action Request resolved.'
  };

  sendEmail(actionRequest, data);

  return change.after.ref.set({ notifyOnResolution: timestamp }, { merge: true });
}
