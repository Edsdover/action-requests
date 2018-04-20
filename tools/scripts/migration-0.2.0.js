const admin = require('firebase-admin');

const serviceAccount = require('../../../../../.config/private/action-requests-service-account-private-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

db.collection('actionRequests')
  .get()
  .then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      processDocument(doc);
    });
  });

function processDocument(doc) {
  const key = doc.id;
  const actionRequest = doc.data();
  const ref = db.collection('actionRequests').doc(key);

  // console.log(JSON.stringify(actionRequest, null, 2));

  const updateSet = {
    reporter: formatReporter(actionRequest.reporter),
    reporterName: actionRequest.reporter
  }

  if (actionRequest.photoUrls && actionRequest.photoUrls.length && !actionRequest.attachments) {
    updateSet.attachments = createAttachments(actionRequest.photoUrls);
  }

  if (!actionRequest.watchers) {
    updateSet.watchers = [];
  }

  // if (key === 'stomb123851234567901') {
  //   ref.update(updateSet);
  // }
  // ref.update(updateSet);
  console.log(`Updated: ${key}`);
  console.log(JSON.stringify(updateSet, null, 2));
}

function createAttachments(photoUrls) {
  const attachments = [];

  for (let photoUrl of photoUrls) {
    attachments.push({
      attachmentUrl: photoUrl,
      filename: 'migration',
      thumbUrl: photoUrl
    });
  }

  return attachments;
}

function formatReporter(previousReporter) {
  if (previousReporter.includes('@')) {
    return previousReporter;
  }

  return 'bill@premier-pump.net';
}
