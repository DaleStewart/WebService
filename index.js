const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');

//port setup
const PORT = 8080;

//app setup
const app = express();
app.use(bodyParser.json());


//Endpoint handleing
//endpoint for testing the status of the API 
app.get('/status', (req, res) => {
    const somee = { msg: 'success', status: 'okay' }
    res.send(somee);
})

app.get('', (req, res) => {
    //return the html file to be rendered
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.listen(PORT, () => {
    console.log("Server running on port 8080");
});