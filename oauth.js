const express = require("express");
const session = require("express-session");
const { google } = require("googleapis");

const app = express();
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Google APIの設定
const CLIENT_ID = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com";
const CLIENT_SECRET = "xxxxxxxxxxxxxxxxxxxxxxxx";
const REDIRECT_URI = "http://localhost:3000/oauth2callback";
const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const API_SERVICE_NAME = "calendar";
const API_VERSION = "v3";

// OAuthフローの設定
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

app.get("/", (req, res) => {
  // 認証されていない場合はOAuthフローを開始する
  if (!req.session.credentials) {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });
    res.redirect(authUrl);
  } else {
    // 認証された場合はカレンダーAPIを実行する
    oauth2Client.setCredentials(req.session.credentials);
    const calendar = google.calendar({ version: API_VERSION, auth: oauth2Client });
    // カレンダーAPIを使用して何かを実行する
  }
});

app.get("/oauth2callback", async (req, res) => {
  try {
    const { tokens } = await oauth2Client.getToken(req.query.code);
    req.session.credentials = tokens;
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error");
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
