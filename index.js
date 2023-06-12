const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');

//data base vars
var ibmdb = require("ibm_db") //require("ibm_db")
  , conn = new ibmdb.Database()
  , cn = "database=bludb;hostname=b1bc1829-6f45-4cd4-bef4-10cf081900bf.c1ogj3sd0tgtu0lqde00.databases.appdomain.cloud;port=32304;uid=jhk43616;pwd=XHSgreteeb64OhPg;ssl=true";

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

app.get('/testdb', (req, res) => {
    // open a connection to the database
    conn.openSync(cn);
    // Select data from table
    conn.queryResult("select * from client", function (err, result) {
        if(err) {
            console.log(err);
            return;
        }

        // Fetch single row at once and process it.
        // Note that queryResult will bring only 64k data from server and result.fetchSync
        // will return each row from this 64k client buffer. Once all data is read from
        // buffer, ibm_db driver will bring another 64k chunk of data from server.
        var data;
        while( data = result.fetchSync() )
        {
            console.log(data);
        }

        // drop the table and close connection.
        conn.querySync("drop table mytab");
        conn.closeSync();
        res.send(data);
    });
  
})

app.get('', (req, res) => {
    //return the html file to be rendered
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.listen(PORT, () => {
    console.log("Server running on port 8080");
});