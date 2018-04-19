import { sendEmail } from './mailgun.service';
import { ccAddresses, EMAIL_PREFIX } from './shared';

// Sends an email when Action Request is resolved
export function handleNotifyOnResolve(change, context) {
  const actionRequest = change.after.data();
  const previousValue = change.before.data();
  const timestamp = new Date().toUTCString().slice(0, -4);

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

  const emailSubject = `[${EMAIL_PREFIX}] (${actionRequest.humanReadableCode}) Action Request Resolved`;
  const toAddress = actionRequest.assignee;

  const data = {
    to: toAddress,
    cc: [ccAddresses, ...actionRequest.ccAddresses || []].join(','),
    subject: emailSubject,
    text: 'Action Request resolved.'
  };

  sendEmail(actionRequest, data);

  return change.after.ref.set({ notifyOnResolution: timestamp }, { merge: true });
}
