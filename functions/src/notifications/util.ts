export function titlecase(str) {
  if (!str) { return ''; }
  return str.replace(/\b\S/g, function(t) { return t.toUpperCase(); });
}

export function validateEmail(emailAddress) {
  const email = emailAddress.replace(/ /g, '').trim().toLowerCase();
  if (email === '@premier-pump.net' || !email.includes('@') || !_validateEmail(email)) {
    console.log(`Debug: Email validation FAILED: ${email}`);
    return 'bill@premier-pump.net';
  }
  console.log(`Debug: Email validation SUCCEEDED: ${email}`);
  return email;
}

function _validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // tslint:disable-line:max-line-length
  return re.test(email);
}
