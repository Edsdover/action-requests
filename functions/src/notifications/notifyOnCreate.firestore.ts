import { sendEmail, sendTextMessage } from './mailgun.service';
import { defaultToAddress, EMAIL_PREFIX } from './shared';

// Sends an email when Action Request is created
export function handleNotifyOnCreate(snap, context) {
  const actionRequest = snap.data();
  const timestamp = new Date().toUTCString().slice(0, -4);

  if (actionRequest.notifyOnCreate === timestamp) {
    console.info(`onCreate notification has already triggered. Goodbye!`);
    return 0;
  }

  let emailSubject = `[${EMAIL_PREFIX}] (${actionRequest.humanReadableCode}) New Action Request`;
  let messageText = 'New Action Request opened.';

  if (actionRequest.isUrgent) {
    emailSubject = `[${EMAIL_PREFIX}] (${actionRequest.humanReadableCode}) Urgent Action Request`;
    messageText = 'Urgent Action Request opened.';

    // send text message for urgent requests
    sendTextMessage(actionRequest, `[${EMAIL_PREFIX}] (${actionRequest.humanReadableCode}) Urgent Action Request opened.`);
  }

  const data = {
    to: actionRequest.assignee,
    cc: defaultToAddress,
    subject: emailSubject,
    text: messageText
  };

  if (actionRequest.reporter.includes('@') && !actionRequest.reporter.includes(' ')) {
    data.cc = actionRequest.reporter;
  }

  sendEmail(actionRequest, data);

  return snap.ref.set({ notifyOnCreate: timestamp }, { merge: true });
}
