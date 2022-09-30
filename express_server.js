const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080; // default port 8080

//Dependencies
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['user_id'],
  maxAge: 24 * 60 * 60 * 1000
}));

//Callbacks & data objects

const {
  getUserByEmail,
  checkForPasswordMatch,
  urlsForUser,
  generateRandomString,
  urlDatabase,
  users} = require('./helpers.js');


//Routes

app.get("/", (req, res) => {
  if (req.session.user_id) {
    return res.redirect(`/urls`);
  } else {
    return res.redirect(`/login`);
  }
});

app.get("/urls.json", (req, res) => {
  return res.json(urlDatabase);
});

//Create new URL page

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userObject: users[req.session.user_id]
  };
  return res.render("urls_new", templateVars);
});

//My URLs home page

app.get("/urls", (req, res) => {
  const userid = req.session.user_id;
  const newUserURLS = urlsForUser(userid);
  const templateVars = {
    urls: newUserURLS,
    userObject: users[req.session.user_id]
  };
  return res.render("urls_index", templateVars);
});

//URL page by id

app.get("/urls/:id", (req, res) => {
  const userid = req.session.user_id;
  const newUserURLS = urlsForUser(userid);
  if (!userid) {
    return res.send('error: user not found');
  }
  const shortURLEntry = urlDatabase[req.params.id];
  if (userid !== shortURLEntry.userID) {
    return res.status(401).send('You are not the owner of this URL');
  }
  for (const shortURLS in newUserURLS) {
    if (userid === newUserURLS[shortURLS].userID) {
      const templateVars = {
        urls: newUserURLS,
        userObject: users[req.session.user_id],
        id: req.params.id
      };
      return res.render("urls_show", templateVars);
    } else {
      return res.send('Error: this URL does not belong to you!!');
    }
  }
});

//Generate random short URL

app.post("/urls", (req, res) => {
  const userObject = users[req.session.user_id];
  if (userObject) {
    const newID = generateRandomString();
    urlDatabase[newID] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    return res.redirect(`/urls/${newID}`);
  } else if (!userObject) {
    return res.send('Go away hacker!!');
  }
});

//Redirect user to longURL path

app.get("/u/:id", (req, res) => {
  const userid = req.session.user_id;
  if (!userid) {
    return res.send('error: user not found');
  }
  if (!urlDatabase[req.params.id]) {
    return res.send('Error: no such URL');
  } else {
    const longURL = urlDatabase[req.params.id].longURL;
    return res.redirect(longURL);
  }
});

// Delete URL feature

app.post("/urls/:id/delete", (req,res) => {
  const userid = req.session.user_id;
  if (!userid) {
    return res.send('error: user not found');
  }
  const shortURLEntry = urlDatabase[req.params.id];
  if (userid !== shortURLEntry.userID) {
    return res.status(401).send('You are not the owner of this URL');
  }
  delete urlDatabase[req.params.id];
  return res.redirect(`/urls`);
});

// update URL feature

app.post("/urls/:id", (req,res) => {
  const userid = req.session.user_id;
  const shortURLEntry = urlDatabase[req.params.id];
  if (!userid) {
    return res.status(401).send('You are not logged in or the id does not exist!');
  }
  if (userid !== shortURLEntry.userID) {
    return res.status(401).send('You are not the owner of this URL');
  }
  const longURL = req.body.longURL;
  const id = req.params.id;
  urlDatabase[id].longURL = longURL;
  return res.redirect(`/urls`);
});

//Login Page and Post Functionality

app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user_id: req.session.user_id,
    userObject: users.user_id
  };
  return res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  let user_id;
  let userObject;
  if (!req.body.email || !req.body.password) {
    return res.send('please fill out login information');
  }
  for (const user in users) {
    if (users[user].email === req.body.email)
      user_id = users[user].id;
    userObject = users[user];
  }
  if (getUserByEmail(req.body.email, users) && checkForPasswordMatch(req.body.password)) {
    req.session.user_id = users[user_id].id;
    return res.redirect('/urls');
  } else {
    return res.status(403).send('Error: wrong email and/or password');
  }
});

//Logout functionality

app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect('/urls');
});

// Registration page

app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user_id: req.session.user_id,
    userObject: users.user_id
  };
  return res.render("register", templateVars);
});

//register functionality for users
app.post("/register", (req, res) => {
  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send('User already exists!');
  }
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashPassword = bcrypt.hashSync(password, 10);
  users[id] = {
    id,
    email,
    password: hashPassword
  };
  if (!email || !password) {
    return res.status(400).send('Please fill out all fields');
  }
  req.session.user_id = id;
  return res.redirect('/urls');
});

// server listening confirmation message
app.listen(PORT, () => {
  return console.log(`Example app listening on port ${PORT}!`);
});