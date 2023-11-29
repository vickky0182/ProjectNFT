function validate() {
  var password = document.getElementById("pass");
  var length = document.getElementById("length");

  if (password.value.length >= 8) {
    alert("Login Succesfull");
    window.location.replace("succesful_login.html");
    return false;
  } else {
    alert("Login Failed");
  }
}
