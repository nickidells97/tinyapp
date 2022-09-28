const bcrypt = require("bcryptjs");

const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
};

function checkForPasswordMatch(loginPassword) {
  for (const user in users) {
    if (bcrypt.compareSync(loginPassword, users[user].password)) {
      return true;
    }
  }
}

function urlsForUser(id) {
  const userURLS = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLS[shortURL] = urlDatabase[shortURL];
    }
  }
  
  return userURLS;
}

function generateRandomString() {
  const result = Math.random().toString(36).substring(2,8);
  return result;
}

const users = {};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID:"aj48lw"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aj48lw"
  },
};


module.exports = {getUserByEmail, checkForPasswordMatch, urlsForUser, generateRandomString, urlDatabase, users};