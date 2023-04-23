"use strict"

const {google} = require('googleapis');
const port = 8080;
const http = require('http');
const fs = require('fs');
const url = require('url');
require('dotenv').config()

// ref: https://developers.google.com/identity/protocols/oauth2/web-server?hl=ja#node.js
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

// Generate a url that asks permissions for the Drive activity scope
const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  include_granted_scopes: true
});

const readFile = (file, response) => {
    fs.readFile(`./${file}`, (err, data) => {
        if (err) {
            console.log("Error reading the file");
        }
        response.end(data);
    });
}

const app = http.createServer((req, res) => {
    switch (req.url) {
        case '/':
            /*
            if (true) {
                //res.redirect(authorizationUrl);
            }else {
                oauth2Client.setCredentials(req.session.credentials);
                const calendar = google.calendar({ version: API_VERSION, auth: oauth2Client });
            }
            */
           res.writeHead(301, {location: authorizationUrl});
           res.end();
           break;
        // Receive the callback from Google's OAuth 2.0 server.
        case req.url.startsWith('/redirect') && req.url:
            (async() => {
                try {
                    // Handle the OAuth 2.0 server response
                    let q = url.parse(req.url, true).query;
                    if (q.error) {
                        console.log('Error:'+q.error);
                    } else {
                        const { tokens } = await oauth2Client.getToken(q.code);
                        oauth2Client.setCredentials(tokens);
                        const calendar = google.calendar('v3');
                        const res = await calendar.events.list({
                            auth: oauth2Client,
                            calendarId: 'primary',
                            timeMin: new Date().toISOString(),
                            maxResults: 10,
                            singleEvents: true,
                            orderBy: 'startTime',
                        });
                        const events = res.data.items;
                        events.map((item, i) => {
                            const start = item.start.dateTime || item.start.date;
                            console.log(`${start} - ${item.summary}`)
                        });
                        
                    }
                } catch(err) {
                    console.error(err);
                    res.writeHead(500, {
                        "Content-Type": "text/plain"
                    })
                    res.write("Error");
                    res.end();
                }
            })();
            break;
        default:
            res.writeHead(404, {
                "Content-Type": "text/html"
            });
            readFile("view/404.html", res)
            break;
    }
})

app.listen(port);
console.log(`The server has started on port ${port}`);