import * as functions from 'firebase-functions';

const api_key = encodeURIComponent(functions.config().mailgun.apikey);
const domain = encodeURIComponent(functions.config().mailgun.domain);
const mailgun = require('mailgun-js')({ apiKey: api_key, domain: domain });

const defaultToAddress = encodeURIComponent(functions.config().notifications.defaultToAddress);
const ccAddresses = encodeURIComponent(functions.config().notifications.ccAddresses);
const bccAddresses = encodeURIComponent(functions.config().notifications.bccAddresses);
const phoneNumber = encodeURIComponent(functions.config().notifications.phoneNumber);

const defaultFromAddress = encodeURIComponent(functions.config().notifications.defaultFromAddress);
const EMAIL_PREFIX = encodeURIComponent(functions.config().notifications.emailPrefix);
const requestsUrl = encodeURIComponent(functions.config().notifications.requestsUrl);

const fallbackImageUrl = 'https://loremflickr.com/120/120/cat';

// Sends an email when Action Request is created
exports.notifyOnCreate = functions.firestore
  .document('/actionRequests/{requestId}')
  .onCreate(event => {
    const actionRequest = event.data.data();
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

    sendEmail(actionRequest, { subject: emailSubject, text: messageText });

    return event.data.ref.set({ notifyOnCreate: timestamp }, { merge: true });
});

// Sends an email when Action Request is reassigned
exports.notifyOnReassign = functions.firestore
  .document('/actionRequests/{requestId}')
  .onUpdate(event => {
    const actionRequest = event.data.data();
    const previousValue = event.data.previous.data();
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

    const data = {
      to: toAddress,
      cc: ccAddresses,
      subject: emailSubject,
      text: 'Action Request assigned.'
    };

    sendEmail(actionRequest, data);

    return event.data.ref.set({ notifyOnReassign: timestamp }, { merge: true });
});

// Sends an email when Action Request is resolved
exports.notifyOnResolve = functions.firestore
.document('/actionRequests/{requestId}')
.onUpdate(event => {
  const actionRequest = event.data.data();
  const previousValue = event.data.previous.data();
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
    cc: ccAddresses,
    subject: emailSubject,
    text: 'Action Request resolved.'
  };

  sendEmail(actionRequest, data);

  return event.data.ref.set({ notifyOnResolution: timestamp }, { merge: true });
});

function queueMailgunMessage(payload) {
  mailgun.messages().send(payload, (error, body) => {
    if (error) {
      console.error('There was an error while sending the email:', error);
      return;
    }
    console.log('Email queued successfully.');
    console.log(`From: ${payload.from}`);
    console.log(`To: ${payload.to}`);
    console.log('Body:', payload.text);
    console.info(`Debug: payload:`, JSON.stringify(payload, null, 2));
  });
}

function sendEmail(actionRequest, data) {
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

function sendTextMessage(actionRequest, message) {
  const phonePayload = {
    to: phoneNumber,
    from: defaultFromAddress,
    text: `${message}\n\n${requestsUrl}/${actionRequest.key}`
  };

  queueMailgunMessage(phonePayload);
}

function titlecase(str) {
  if (!str) { return ''; }
  return str.replace(/\b\S/g, function(t) { return t.toUpperCase(); });
}

function generateHtml(actionRequest) {
  // tslint:disable max-line-length
  return `<div>
  <div>
    <h3>Action Request</h3>
    <p>
      ${ actionRequest.humanReadableCode || 'Unknown ID' }
      <br>
      <span style="color: #aaa;">${ actionRequest.updatedAt && new Date(actionRequest.updatedAt).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }) || '' }</span>
      <br><br>
      <a href="${requestsUrl}/${actionRequest.key}" target="_blank" style="text-decoration:none;cursor:pointer;">
        <button style="cursor:pointer;position:relative;padding:0;overflow:hidden;border-width:0;outline:0;border-radius:2px;box-shadow:0 1px 4px rgba(0,0,0,.6);background-color:#009688;color:#ecf0f1;transition:background-color .3s" type="button">
          <span style="cursor:pointer;display: block;position: relative;padding: 12px 24px;">
            OPEN
          </span>
        </button>
      </a>
    </p>

    <h3>Reporter</h3>
    <p>
      ${ actionRequest.reporter || 'No reporter name provided.' }
    </p>

    <h3>Assignee</h3>
    <p>
      ${ actionRequest.assignee || 'No assignee.' }
    </p>

    <h3>Sales Order</h3>
    <p>
      SO# ${ actionRequest.salesOrderNumber && actionRequest.salesOrderNumber.toUpperCase() || 'Unknown' }
    </p>

    <h3>Category</h3>
    <p>
      ${ titlecase(actionRequest.category) }
    </p>

    <h3>Discrepancy</h3>
    <p>
      ${ actionRequest.discrepancy || 'No discrepancy information provided.' }
    </p>

    <h3>Suggested Remedy</h3>
    <p>
      ${ actionRequest.suggestedRemedy || 'No suggested remedy provided.' }
    </p>

    <h3>Photos</h3>
    <div>
      <span>
        <a target="_blank" href="${ (actionRequest.photoUrls && actionRequest.photoUrls.length && actionRequest.photoUrls[0]) || requestsUrl + '/' + actionRequest.key }">
          <img src="${ (actionRequest.photoUrls && actionRequest.photoUrls.length && actionRequest.photoUrls[0]) || fallbackImageUrl }" style="height: 120px;width: 120px;margin-left: 10px;margin-right: 10px;object-fit: cover;">
        </a>
      </span>
    </div>

    <h3>Status</h3>
    <p>
      ${ titlecase(actionRequest.status) || 'No status available.' }
    </p>

    <h3>Approved Plan of Action</h3>
    <p>
      ${ actionRequest.approvedActionPlan || 'No action plan available.' }
    </p>

    <h3>ECN</h3>
    <p>
      ${ actionRequest.ecn || 'No ECN provided.' }
    </p>

    <h3>${ actionRequest.resolution && 'Resolution' || '' }</h3>
    <p>
      ${ actionRequest.resolution || '' }
    </p>
  </div>
  <div>
    <a href="${requestsUrl}/${actionRequest.key}" target="_blank" style="text-decoration:none;cursor:pointer;">
      <button style="cursor:pointer;position:relative;padding:0;overflow:hidden;border-width:0;outline:0;border-radius:2px;box-shadow:0 1px 4px rgba(0,0,0,.6);background-color:#009688;color:#ecf0f1;transition:background-color .3s" type="button">
        <span style="cursor:pointer;display: block;position: relative;padding: 12px 24px;">
          VIEW
        </span>
      </button>
    </a>
  </div>
  </div>`;
}
