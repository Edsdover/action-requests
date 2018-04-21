const admin = require('firebase-admin');

const serviceAccount = require('../../../../../.config/private/action-requests-service-account-private-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const assignees = [];
const reporters = [];

db.collection('actionRequests')
  .get()
  .then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      processDocument(doc.data());
    });
  })
  .then(() => {
    setTimeout(() => {
      console.log('assignees');
      console.log(JSON.stringify(
        Array.from(new Set(assignees)).sort(), null, 2
      ));
      console.log('reporters');
      console.log(JSON.stringify(
        Array.from(new Set(reporters)).sort(), null, 2
      ));
    }, 10 * 1000);
  });

function processDocument(actionRequest) {
  assignees.push(actionRequest.assignee);
  reporters.push(actionRequest.reporter);
}

