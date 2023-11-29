let walletid = request.body.Walletid;
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
        if (error) throw error;
        // If the account exists
        else if (results.length == 0) {
          // Authenticate the user
          request.session.signedup = true;
          request.session.walletid = walletid;

          var sql = "INSERT INTO accounts (walletid, password, email, name) VALUES ?",
          values = [walletid, password, email, name];

          connection.query(sql, [values], function (err, result) {
            if (err) throw err;
            console.log("Row inserted");

            response.redirect("/signed_up");
          });


          // Redirect to home page
          
        } else {
          response.send("Incorrect Username and/or Password!");
        }
        
      }
  )
  response.end();