const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080



app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Create new URL page

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userObject: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

//My URLs home page

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userObject: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

//URL page by id

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userObject: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

//Generate random short URL

app.post("/urls", (req, res) => {
  const userObject = users[req.cookies["user_id"]]
  if (userObject) {
    let newID = generateRandomString();
    urlDatabase[newID] = req.body.longURL;
    res.redirect(`/urls/${newID}`);
  } else if (!userObject) {
    res.send('Go away hacker!!')
  };
});

function generateRandomString() {
  const result = Math.random().toString(36).substring(2,8);
  return result;
}

//Redirect user to longURL path

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.send('Error: no such URL');
  } else {
    const longURL = urlDatabase[req.params.id];
    res.redirect(longURL);
  }
});

// Delete URL feature

app.post("/urls/:id/delete", (req,res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

// update URL feature

app.post("/urls/:id/update", (req,res) => {
  let longURL = req.body.longURL;
  const id = req.params.id;
  urlDatabase[id] = longURL;
  res.redirect(`/urls`);
});

app.post("/urls/:id", (req,res) => {
  res.redirect(`/urls/${req.params.id}`);
});

//Login Page and Post Functionality

app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user_id: req.cookies["user_id"],
    userObject: users.user_id
  };
  res.render("login", templateVars);
  console.log(users);
});

app.post("/login", (req, res) => {
  for (const user in users) {
    if (users[user].email === req.body.email) 
    user_id = users[user].id;
    userObject = users[user];
    console.log(users[user].id);
  }
  if (getUserByEmail(req.body.email) && checkForPasswordMatch(req.body.password) ) {
    console.log('working');
    res.cookie('user_id', users[user_id].id);
    res.redirect('/urls');
  } else {
    res.status(403);
    res.send('Error: wrong email and/or password');
  }
});

//Logout functionality 

app.post("/logout", (req, res) => {
  res.clearCookie('user_id',);
  res.redirect('/urls');
});

// Registration page

app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user_id: req.cookies["user_id"],
    userObject: users.user_id
  };
  res.render("register", templateVars);
});

//User data
const users = {};

//callback that checks to see if user email exists
function getUserByEmail(value) {
  for (const user in users) {
    if (users[user].email === value) {
      return true;
    }
  }
};

function checkForPasswordMatch(value) {
  for (const user in users) {
    if (users[user].password === value) {
      return true;
    }
  }
};

//register functionality for users
app.post("/register", (req, res) => {
  if (getUserByEmail(req.body.email) === false) {
    res.status(400);
    res.send('User already exists!');
    return;
  }
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  users[id] = {
    id,
    email,
    password
  };
  if (!email || !password) {
    res.status(400);
    res.send('Please fill out all fields');
    setTimeout(() => res.redirect('/register'), 500)
  }
  res.cookie('user_id', id);
  res.redirect('/urls');
});

