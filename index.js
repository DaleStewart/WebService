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

//---------------------------------------------------------Endpoint handleing----------------------------------------------------------
//Basic endpoints: these two provide simple confirmation of server function. A welcome to api html page, and a status message
//-------------------------------------------------------------------------------------------------------------------------------------
app.get('/status', (req, res) => {
    const somee = { msg: 'success', status: 'okay' }
    res.send(somee);
})

app.get('', (req, res) => {
    //return the html file to be rendered
    res.sendFile(path.join(__dirname, '/index.html'));
});

//---------------------------------------------------------------
//idverify this endpoint verifies the user by ID
//---------------------------------------------------------------
app.post('/idverify', (req, res) => { 
  //return a
  var b0ddy = req["body"];
  var searchId = b0ddy["id"];

    const searchString = "SELECT * FROM client WHERE ID = " + searchId;
    console.log("SQL CALL: ___________ " + searchString);
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

//---------------------------------------------------------------
//verify endpoint
//---------------------------------------------------------------
app.post('/verify', (req, res) => {
    var b0ddy = req["body"];
    var searchLASTNAME = b0ddy["Last"];
    var slahsBirthday = b0ddy["birthday"];
    var Birthday = slahsBirthday.replace(/\//g,'-');
    console.log("birthday = " + Birthday);

    const searchString = "select * from client where LASTNAME = " + "'" + searchLASTNAME + "'" + " and VARCHAR_FORMAT (DOB,'MM-DD-YYYY')= " + "'" + Birthday + "'";
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
  
//---------------------------------------------------------------
//Ticket endpoint
//---------------------------------------------------------------
app.post('/idequipment', (req, res) => { 
  //return a ticket based on ticket number
  var b0ddy = req["body"];
  var searchID = b0ddy["id"];
  var decsearchID = parseFloat(searchID); 

    const searchString = "select ticketnumber, equipmentid from tickets where id = " + "'" + decsearchID + "'";
    console.log("SQL CALL: ___________ " + searchString);
    //connect to the DB2 database
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
        conn.close(async (err) => {
          console.log("Entered the async close")
          if (err) {
            console.error('error closing the database connection:', err);
          }
          
          // Send the table data as a response
          console.log("About to run try catch to clal helper function")//debug
          try {
            console.log("try")//debug
            const returnedObject = await myHelperFunction(data);
            res.json(returnedObject);
        } catch (err) {  
            console.log("catch")//debug
            console.error(err);
            res.status(500).send('An error occurred.');
        }
          //res.json(data);
          //console.log("main ran " + data);//debug
        });
      });
    });
});
//-------------------------------------------------------------------------------
//This helper function queries the database for each of the equipment descriptions mathcing our id 
function myHelperFunction(jsonObject) {
  const result = {}; // Empty object to store the JSON data

  return new Promise((resolve, reject) => {
    let operations = []; //array holds all our operations, each opp being one pass on the for loop to gather data

    //for loop is necessary to iterate over the jsonObject
    for (let i = 0; i < jsonObject.length; i++) {
      let operation = new Promise((resolve, reject) => {
        const searchString = "select equipmentdescription from equipment where equipmentid = ?";

        //Open the connection
        ibmdb.open(connString, (err, conn) => {
          if (err) {
            reject('Error connecting to the database');
          } else {
            conn.query(searchString, [jsonObject[i]['EQUIPMENTID']], (err, data) => {
              console.log(data);
              if (err) {
                reject('Error executing the query');
              } else {
                //close the connection, do something with the data you recieved
                conn.close((err) => {
                  if (err) {
                    reject('Error closing the database connection');
                  } else {
                    console.log("data object value: ", data);
                    console.log("dataobject index i", data[0]);
                    result[`equipment${i + 1}`] = data[0].EQUIPMENTDESCRIPTION;//makre sure to hit data[0] not only data
                    resolve();
                  }
                });
              }
            });
          }
        });
      });

      operations.push(operation); //add the operation to the array
    }

    //resolve our main promise ONLY after all operations have completed
    Promise.all(operations).then(() => resolve(result)).catch(err => reject(err));
  });
}
//-------------------------------------------------------------------------------





//---------------------------------------------------------------
//
//---------------------------------------------------------------
app.post('/a', (req, res) => { 
  //return a
  var b0ddy = req["body"];


    const searchString = "";
    console.log("SQL CALL: ___________ " + searchString);

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
          console.log(data); //debug
          res.json(data);
          console.log("ran");//debug
        });
      });
    });
});

//---------------------------------------------------------Listener handleing----------------------------------------------------------
//Sets the server to listen to a particular port for webtraffic
//-------------------------------------------------------------------------------------------------------------------------------------
app.listen(PORT, () => {
    console.log("Server running on port 8080");
});