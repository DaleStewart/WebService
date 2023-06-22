const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const cors = require('cors'); 

//data base vars
const ibmdb = require("ibm_db") //require("ibm_db")
   //conn = new ibmdb.Database()
   connString = "database=bludb;hostname=b1bc1829-6f45-4cd4-bef4-10cf081900bf.c1ogj3sd0tgtu0lqde00.databases.appdomain.cloud;port=32304;uid=jhk43616;pwd=0eVaH3ipUpwy4hcg;SECURITY=SSL";

//port setup
const PORT = 8080;

//app setup
const app = express();
app.use(bodyParser.json());
app.use(cors());

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

app.post('/ticket', (req, res) => { 
  //return a ticket based on ticket number
  var b0ddy = req["body"];
    var searchTicket = b0ddy["ticket"];

    const searchString = "select * from tickets where TICKETNUMBER = " + "'" + searchTicket + "'" + " VARCHAR_FORMAT (DOB,'MM-DD-YYYY')= " + "'" + Birthday + "'";
    console.log(searchString);
    // Connect to the IBM DB2 database
    ibmdb.open(connString, (err, conn) => {
      if (err) {
        console.error('Error connecting to the database:', err);
        res.status(500).send('Error connecting to the database');
        return;
      }
  
      // Execute a query to fetch the entire table
      conn.query(searchString, (err, data) => {
        if (err) {
          console.error('Error executing the query:', err);
          res.status(500).send('Error executing the query');
          return;
        }
  
        // Close the database connection
        conn.close((err) => {
          if (err) {
            console.error('Error closing the database connection:', err);
          }
  
          // Send the table data as a response
          console.log("About to run")//debug
          console.log(data[0]); //debug
          res.json(data[0]);
          console.log("ran");//debug
        });
      });
    });

});

app.post('/verify', (req, res) => {
    var b0ddy = req["body"];
    var searchLASTNAME = b0ddy["Last"];
    var Birthday = b0ddy["birthday"];

    const searchString = "select * from client where LASTNAME = " + "'" + searchLASTNAME + "'" + " VARCHAR_FORMAT (DOB,'MM-DD-YYYY')= " + "'" + Birthday + "'";
    console.log(searchString);
    // Connect to the IBM DB2 database
    ibmdb.open(connString, (err, conn) => {
      if (err) {
        console.error('Error connecting to the database:', err);
        res.status(500).send('Error connecting to the database');
        return;
      }
  
      // Execute a query to fetch the entire table
      conn.query(searchString, (err, data) => {
        if (err) {
          console.error('Error executing the query:', err);
          res.status(500).send('Error executing the query');
          return;
        }
  
        // Close the database connection
        conn.close((err) => {
          if (err) {
            console.error('Error closing the database connection:', err);
          }
  
          // Send the table data as a response
          console.log("About to run")//debug
          console.log(data[0]); //debug
          res.json(data[0]);
          console.log("ran");//debug
        });
      });
    });
  });

app.listen(PORT, () => {
    console.log("Server running on port 8080");
});