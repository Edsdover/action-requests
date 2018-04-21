const admin = require('firebase-admin');

const serviceAccount = require('../../../../../.config/private/action-requests-service-account-private-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const requests = [];

db.collection('actionRequests')
  .get()
  .then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      processDocument(doc.data());
    });
  })
  .then(() => {
    setTimeout(() => {
      console.log(JSON.stringify(
        requests, null, 2
      ));
    }, 10 * 1000);
  });

function processDocument(actionRequest) {
  requests.push(actionRequest);
}

