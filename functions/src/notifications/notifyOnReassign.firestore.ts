import { sendEmail } from './mailgun.service';
import { ccAddresses, EMAIL_PREFIX } from './shared';

// Sends an email when Action Request is reassigned
export function handleNotifyOnReassign(change, context) {
  const actionRequest = change.after.data();
  const previousValue = change.before.data();
  const timestamp = new Date().toUTCString().slice(0, -4);

  if (actionRequest.notifyOnReassign === timestamp) {
    console.info(`onReassign notification has already triggered. Goodbye!`);
    return 0;
  }

  if (actionRequest.assignee === previousValue.assignee) {
    console.info(`Assignee hasn't changed. Goodbye!`);
    return 0;
  }

  const emailSubject = actionRequest.isUrgent
    ? `[${EMAIL_PREFIX}] (${actionRequest.humanReadableCode}) Urgent Action Request Assigned`
    : `[${EMAIL_PREFIX}] (${actionRequest.humanReadableCode}) Action Request Assigned`;
  const toAddress = actionRequest.assignee;

  console.info(`Debug: actionRequest:`, JSON.stringify(actionRequest, null, 2));

  const data = {
    to: toAddress,
    cc: [ccAddresses, ...actionRequest.watchers || []].join(','),
    subject: emailSubject,
    text: 'Action Request assigned.'
  };

  sendEmail(actionRequest, data);

  return change.after.ref.set({ notifyOnReassign: timestamp }, { merge: true });
}
