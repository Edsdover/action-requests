const admin = require('firebase-admin');

const serviceAccount = require('../../../../../.config/private/action-requests-service-account-private-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const output = [];

db.collection('actionRequests')
  .get()
  .then(async (querySnapshot) => {
    await new Promise(done => setTimeout(done, 5000));
    querySnapshot.forEach((doc) => {
      processDocument(doc);
    });
  })
  .then(() => console.log(JSON.stringify(output, null, 2)));

function processDocument(doc) {
  const key = doc.id;
  const actionRequest = doc.data();
  const ref = db.collection('actionRequests').doc(key);

  if (new Date(actionRequest.createdAt) > new Date("Wed May 28 2018 11:46:33 GMT-0700 (PDT)")) {
    output.push(actionRequest);
  }
}
