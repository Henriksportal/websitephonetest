require('dotenv').config();  // Load environment variables
const express = require("express");
const { google } = require("googleapis");
const app = express();
// Use the port provided by Render, or default to 3000
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

async function authSheets() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL, // From environment variable
        private_key: process.env.GOOGLE_SHEETS_CREDENTIALS_KEY.split(String.raw`\n`).join('\n'),   // From environment variable
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const authClient = await auth.getClient();
    return google.sheets({ version: "v4", auth: authClient   
 });
  } catch (error) {
    console.error("Error authenticating Google Sheets:", error);
    throw error; // Re-throw for route to handle
  }
}

app.get("/fish-data", async (req, res) => {
  try {
    const sheets = await authSheets();
    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID, // From environment variable
      range: "fish box",
    });

    res.send(getRows.data);
  } catch (error) {
    console.error("Error fetching spreadsheet data:", error);
    res.status(500).send("Internal Server Error"); 
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));
