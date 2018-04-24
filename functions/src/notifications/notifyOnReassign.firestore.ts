import { sendEmail } from './mailgun.service';
import { ccAddresses, EMAIL_PREFIX } from './shared';
import { validateEmail } from './util';

// Sends an email when Action Request is reassigned
export function handleNotifyOnReassign(change, context) {
  const actionRequest = change.after.data();
  const previousValue = change.before.data();
  const timestamp = new Date().toUTCString().slice(0, -5);

  if (actionRequest.notifyOnReassign === timestamp) {
    console.info(`onReassign notification has already triggered. Goodbye!`);
    return 0;
  }

  if (actionRequest.assignee === previousValue.assignee) {
    console.info(`Assignee hasn't changed. Goodbye!`);
    return 0;
  }

  console.info(`Debug: actionRequest:`, JSON.stringify(actionRequest, null, 2));

  const emailSubject = actionRequest.isUrgent
    ? `[${EMAIL_PREFIX}] (${actionRequest.humanReadableCode}) Urgent Action Request Assigned`
    : `[${EMAIL_PREFIX}] (${actionRequest.humanReadableCode}) Action Request Assigned`;
  const toAddress = actionRequest.assignee;

  const sanitizedWatchers = (actionRequest.watchers && actionRequest.watchers.length)
    ? actionRequest.watchers.map(watcher => validateEmail(watcher))
    : [];

  const data = {
    to: validateEmail(toAddress),
    cc: [ validateEmail(ccAddresses), sanitizedWatchers ].join(','),
    subject: emailSubject,
    text: 'Action Request assigned.'
  };

  sendEmail(actionRequest, data);

  return change.after.ref.set({ notifyOnReassign: timestamp }, { merge: true });
}
