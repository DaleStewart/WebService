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
app.post('/pickupday', (req, res) => { 
  //return a
  var b0ddy = req["body"];
  var zip = b0ddy["zip"];


    const searchString = "SELECT SCHEDULEDATE FROM SCHEDULES WHERE ZIPCODE = " + "'" + zip + "'";
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
//
//---------------------------------------------------------------
app.put('/appointment', async (req, res) => { 
  //Grab body
  var b0ddy = req["body"];
  var id = b0ddy["id"];
  var day = b0ddy["day"];
  var dateofweek = '';
  day = day.toLowerCase();
  console.log("Day is " + day);
  returnedObject = await myTicketFunction(id);
  console.log("ticket num is " + returnedObject['TICKETNUMBER']);
  var ticketnum = returnedObject['TICKETNUMBER'];
  

  //switch statement, if it's saturday, sunday, or mispelled return with {message:invalid}
  switch (day) {
    case "monday":
        console.log("Case monday");
        dateofweek = getNextDay(1);
        break;
    case "tuesday":
        console.log("Case tuesday");
        dateofweek = getNextDay(2);
        break;
    case "wednesday":
        console.log("Case wednesday");
        dateofweek = getNextDay(3);
        break;
    case "thursday":
        console.log("Case thursday");
        dateofweek = getNextDay(4);
        break;
    case "friday":
        console.log("Case friday");
        dateofweek = getNextDay(5);
        break;
    default:
        dateofweek = 'invalid';
        console.log("This day is not recognized");
        res.send({"message": "We do not work weekends and this date is not recognized"})
        break;
}

    //convert to string, cutoff time info, convert back tdate
    let dateOnlyString = dateofweek.toISOString().slice(0,10);
    console.log("Just converted&cut: " + dateOnlyString); // Outputs: "2023-07-04"
    dateofweek = new Date(dateOnlyString);
    
    console.log("Converted back to date obj: " + dateofweek);

    //const searchString = "SELECT * FROM ClIENT WHERE LASTNAME = 'fox'";
    const searchString = "INSERT INTO PICKUPAPPT (ID, APPTDATE, TICKETNUMBER) VALUES (" + "'" + id + "', " + "'" + dateOnlyString + "', " + "'" + ticketnum + "')";
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

//helper function to get the date of the next occurance of the specified day of the week (where monday = 1 and sunday = 7)
function getNextDay(numday) {
  let date = new Date();
  date.setDate(date.getDate() + ((numday + 7 - date.getDay()) % 7));
  return date;
}

//This helper function queries the database for a ticket mathcing our id 
async function myTicketFunction(id) {
  const searchString = "SELECT * FROM TICKETS WHERE ID = " + "'" + id + "'";

  return new Promise((resolve, reject) => {
      ibmdb.open(connString, (err, conn) => {
          if (err) {
              console.error('Error connecting to the database:', err);
              reject('Error connecting to the database');
              return;
          }

          conn.query(searchString, [id], (err, data) => {
              if (err) {
                  console.error('Error executing the query:', err);
                  reject('Error executing the query');
                  return;
              }

              conn.close((err) => {
                  if (err) {
                      console.error('Error closing the database connection:', err);
                      reject('Error closing the database connection');
                      return;
                  }
                  console.log(data);
                  resolve(data[0]);  // Assuming that `id` is a unique identifier
              });
          });
      });
  });
}

//---------------------------------------------------------Listener handleing----------------------------------------------------------
//Sets the server to listen to a particular port for webtraffic
//-------------------------------------------------------------------------------------------------------------------------------------
app.listen(PORT, () => {
    console.log("Server running on port 8080");
});