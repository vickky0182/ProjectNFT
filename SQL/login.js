const mysql = require("mysql");
const express = require("express");
const session = require("express-session");
const path = require("path");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "aasil",
  database: "nodelogin",
  port: 3306,
});

const app = express();

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));

// http://localhost:3000/
app.get("/", function (request, response) {
  // Render login template
  response.sendFile(path.join(__dirname + "/login.html"));
});


app.get("/login", function (request, response) {
  // Render login template
  response.sendFile(path.join(__dirname + "/login.html"));
});

app.get("/signup", function (request, response) {
  // Render login template
  response.sendFile(path.join(__dirname + "/signup.html"));
});




// http://localhost:3000/auth
app.post("/login", function (request, response) {
  // Capture the input fields
  let walletid = request.body.walletid;
  let password = request.body.password;
  // Ensure the input fields exists and are not empty
  if (walletid && password) {
    // Execute SQL query that'll select the account from the database based on the specified username and password
    connection.query(
      "SELECT * FROM accounts WHERE id = ? AND password = ?",
      [walletid, password],
      function (error, results, fields) {
        // If there is an issue with the query, output the error
        if (error) throw error;
        // If the account exists
        if (results.length > 0) {
          // Authenticate the user
          request.session.loggedin = true;
          request.session.walletid = walletid;
          // Redirect to home page
          response.redirect("/signed_in");
        } else {
          response.send("Incorrect Username and/or Password!");
        }
      }
    );
  } else {
    response.send("Please enter Username and Password!");
    response.end();
  }
});

// http://localhost:3000/home
app.get("/signed_in", function (request, response) {
  // If the user is loggedin
  if (request.session.loggedin) {
    
    // Output username
    response.send("Welcome back, wallet_id:" + request.session.walletid + "!");
  } else {
    // Not logged in
    response.send("Please login to view this page!");
  }
});


app.get("/signed_up", function (request, response) {
  // If the user is loggedin
  if (request.session.signedup) {
    // Output username
    response.send( request.session.walletid+" has been registered" + "!");
  } else {
    // Not logged in
    response.send("Please register to view this page!");
  }
});







app.post("/signup", function (request, response) {
  // Capture the input fields
  console.log(request.body);

  let walletid = request.body.walletid;
  let password = request.body.password;
  let email = request.body.email;
  let name = request.body.name;
  let c_password = request.body.c_password;


  // Ensure the input fields exists and are not empty
    // Execute SQL query that'll select the account from the database based on the specified username and password
    connection.query(
      // "INSERT INTO accounts (walletid, password, email, name) VALUES (?,?,?,?)",
      "SELECT * FROM accounts WHERE id = ?",
      [walletid],
      function (error, results, fields) {
        // If there is an issue with the query, output the error
        if (walletid && password && email && name && c_password) {
        if (error) throw error;
        // If all  the fields are not empty
        else if(password != c_password){
          response.send("Passwords do not match!");
        }
        else if (results.length == 0) {
          // Authenticate the user
          request.session.signedup = true;
          request.session.walletid = walletid;

          var sql = "INSERT INTO accounts VALUES ?",
          values = [[walletid,name, password, email]];

          connection.query(sql, [values], function (err, result) {
            if (err) throw err;

            else{
            console.log("Row inserted");
            response.redirect("/signed_up");
            }

            
          });


          // Redirect to home page
          
        }
       }
        else {
          response.send("Incorrect Username and/or Password!");
        }
        
      }
  )
    }); 






app.listen(3000);
