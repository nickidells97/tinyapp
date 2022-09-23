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
  let newID = generateRandomString();
  urlDatabase[newID] = req.body.longURL;
  res.redirect(`/urls/${newID}`);
});

function generateRandomString() {
  const result = Math.random().toString(36).substring(2,8);
  return result;
}

//Redirect user to longURL path

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
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

//Login/logout functionality on headers.ejs

app.post("/login", (req, res) => {
  res.cookie('user_id', generateRandomString());
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id', );
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

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  users[id] = {
    id,
    email,
    password
  }
  res.cookie('user_id', id)
  res.redirect('/urls');
});