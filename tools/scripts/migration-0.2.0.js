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
    reporterName: actionRequest.reporter,
    assignee: actionRequest.assignee.toLowerCase()
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

  if (previousReporter === 'Dean') {
    return 'dean@premier-pump.net';
  }

  if (previousReporter === 'Douglas sandstrom ') {
    return 'dsandstrom@premier-pump.net';
  }

  if (previousReporter === 'Garrett') {
    return 'gorr@premier-pump.net';
  }

  if (previousReporter === 'Garrett ') {
    return 'gorr@premier-pump.net';
  }

  if (previousReporter === 'Garrett Orr') {
    return 'gorr@premier-pump.net';
  }

  if (previousReporter === 'Gavin') {
    return 'ghigley@premier-pump.net';
  }

  if (previousReporter === 'Gavin Higley') {
    return 'ghigley@premier-pump.net';
  }

  if (previousReporter === 'Jeff Lane') {
    return 'jlane@premier-pump.net';
  }

  if (previousReporter === 'Jordan') {
    return 'jordan@premier-pump.net';
  }

  if (previousReporter === 'KEVIN') {
    return 'kevin@premier-pump.net';
  }

  if (previousReporter === 'Kevin') {
    return 'kevin@premier-pump.net';
  }

  if (previousReporter === 'Kevin Mendoza') {
    return 'kmendoza@premier-pump.net';
  }

  if (previousReporter === 'Lorne Hofeld') {
    return 'lhofeld@premier-pump.net';
  }

  if (previousReporter === 'Matt') {
    return 'mhouser@premier-pump.net';
  }

  if (previousReporter === 'Matt Houser') {
    return 'mhouser@premier-pump.net';
  }

  if (previousReporter === 'Matt houser') {
    return 'mhouser@premier-pump.net';
  }

  if (previousReporter === 'Matthew Houser') {
    return 'mhouser@premier-pump.net';
  }

  if (previousReporter === 'Matthew houser') {
    return 'mhouser@premier-pump.net';
  }

  if (previousReporter === 'Bill') {
    return 'bill@premier-pump.net';
  }

  if (previousReporter === 'Bill mils') {
    return 'Bill Mills';
  }

  if (previousReporter === 'Cody P') {
    return 'Cody';
  }

  if (previousReporter === 'Cord') {
    return 'Cord Hull';
  }

  if (previousReporter === 'Code h') {
    return 'Cord Hull';
  }

  if (previousReporter === 'Garrett') {
    return 'Garrett Orr';
  }

  if (previousReporter === 'Garrett ') {
    return 'Garrett Orr';
  }

  if (previousReporter === 'Gavin') {
    return 'Gavin Higley';
  }

  if (previousReporter === 'KEVIN') {
    return 'Kevin';
  }

  if (previousReporter === 'Mark Niehaus') {
    return 'Mark Neuhaus';
  }

  if (previousReporter === 'Robert ') {
    return 'Robert Hamm';
  }

  if (previousReporter === 'Robert Ham') {
    return 'Robert Hamm';
  }

  if (previousReporter === 'jeff ') {
    return 'Jeff Lane';
  }

  if (previousReporter === 'matt') {
    return 'mhouser@premier-pump.net';
  }

  return titlecase(previousReporter).trim();
}

function titlecase(str) {
  if (!str) { return ''; }
  return str.replace(/\b\S/g, function(t) { return t.toUpperCase(); });
}
