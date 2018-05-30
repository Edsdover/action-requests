const admin = require('firebase-admin');

const serviceAccount = require('../../../../../.config/private/action-requests-service-account-private-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const input = require('../../backup.json');

for (const restoredActionRequest of input) {
  const key = restoredActionRequest.key;
  console.log(`key:`, key);
  console.log(`restoredActionRequest:`, JSON.stringify(restoredActionRequest, null, 2));

  db.collection('actionRequests').doc(key).set(restoredActionRequest);
}
