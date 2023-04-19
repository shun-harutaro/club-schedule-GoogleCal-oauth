const {google} = require('googleapis');
const express = require('express');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;
/**
 * To use OAuth2 authentication, we need access to a CLIENT_ID, CLIENT_SECRET, AND REDIRECT_URI
 * from the client_secret.json file. To get these credentials for your application, visit
 * https://console.cloud.google.com/apis/credentials.
 */
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

// Access scopes for read-only Calendar activity.
const scopes = ['https://www.googleapis.com/auth/calendar']

// Generate a url that asks permissions for the Drive activity scope
const authorizationUrl = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',
  /** Pass in the scopes array defined above.
    * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
  scope: scopes,
  // Enable incremental authorization. Recommended as a best practice.
  include_granted_scopes: true
});

const getGoogleUser = async ({ code }) => {
  const { tokens } = await oauth2Client.getToken(code);
  const googleUser = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`,{
    headers: {
      Authorization: `Bearer ${tokens.id_token}`,
    },
  })
  .then(res => {
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    return res.json();
  })
  .then(data => {
    console.log(data);
  })
  .catch(err => {
    throw new Error(err.message);
  })
  return googleUser;
}

/*
const app = express();
app.listen(8000, () => {
    console.log(`Listening on port 8000`);
});

app.get('/', function(req, res) {
    console.log(authorizationUrl);
    return res.writeHead(301, { "Location": authorizationUrl })
})
*/