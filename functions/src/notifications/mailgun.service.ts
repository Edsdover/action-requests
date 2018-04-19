import { bccAddresses, defaultFromAddress, defaultToAddress, phoneNumber, mailgunApiKey, mailgunDomain, requestsUrl } from './shared';
import { generateHtml } from './email-template';

const mailgun = require('mailgun-js')({ apiKey: mailgunApiKey, domain: mailgunDomain });

export function queueMailgunMessage(payload) {
  console.info(`Debug: payload:`, JSON.stringify(payload, null, 2));

  mailgun.messages().send(payload, (error, body) => {
    if (error) {
      console.error('There was an error while sending the email:', error);
      return;
    }
    console.log('Email queued successfully.');
    console.log(`From: ${payload.from}`);
    console.log(`To: ${payload.to}`);
    console.log('Body:', payload.text);
  });
}

export function sendEmail(actionRequest, data) {
  const emailPayload = {
    to: defaultToAddress,
    bcc: bccAddresses,
    from: defaultFromAddress,
    html: generateHtml(actionRequest),
    ...data,
    text: `${data.text}\n\n${requestsUrl}/${actionRequest.key}`
  };

  queueMailgunMessage(emailPayload);
}

export function sendTextMessage(actionRequest, message) {
  const phonePayload = {
    to: phoneNumber,
    from: defaultFromAddress,
    text: `${message}\n\n${requestsUrl}/${actionRequest.key}`
  };

  queueMailgunMessage(phonePayload);
}
