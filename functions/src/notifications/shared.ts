import * as functions from 'firebase-functions';

export const mailgunApiKey = functions.config().mailgun.apikey;
export const mailgunDomain = functions.config().mailgun.domain;

export const defaultToAddress = functions.config().notifications.default_to_address;
export const ccAddresses = functions.config().notifications.cc_addresses;
export const bccAddresses = functions.config().notifications.bcc_addresses;
export const phoneNumber = functions.config().notifications.phone_number;

export const defaultFromAddress = functions.config().notifications.default_from_address;
export const EMAIL_PREFIX = functions.config().notifications.email_prefix;
export const hostedUrl = functions.config().notifications.hosted_url;
export const requestsUrl = `${hostedUrl}/requests`;

export const fallbackImageUrl = `${hostedUrl}/assets/no-attachments.png`;
