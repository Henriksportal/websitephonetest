const express = require("express");
const { google } = require("googleapis");


const app = express();
const port = 8080;

app.use(express.json());
app.use(express.static('public'));



async function authSheets() {
    const auth = new google.auth.GoogleAuth({
        keyFile:"keys.json",
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });



// const app = express();
// const port = process.env.PORT || 8080; // Use Render's port or fallback

// app.use(express.json());
// app.use(express.static('public'));

// async function authSheets() {
//     const auth = new google.auth.GoogleAuth({
//         credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS), // Get from env var
//         scopes: ["https://www.googleapis.com/auth/spreadsheets"],
//     });

    const authClient = await auth.getClient();

    const sheets = google.sheets({version: "v4", auth: authClient });

    return {
        auth,
        authClient, 
        sheets, 
    };

}

app.get("/fish-data", async(req,res)=>{
    const { sheets } = await authSheets();
    const getRows = await sheets.spreadsheets.values.get({
        spreadsheetId: '10NO4fONhwkQ9BhvEnR1aNVX0oFRonV5-gYZdZwKlidk',
        range: "fish box"
    });

    res.send(getRows.data);
})




app.listen(port, () => console.log(`Listening on port ${port}`));
