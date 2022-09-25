const express = require("express");
const cookieParser = require('cookie-session');
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080; // default port 8080



app.set("view engine", "ejs");

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

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['user_id'],
  maxAge: 24 * 60 * 60 * 1000
}));

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
    userObject: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});

//My URLs home page

app.get("/urls", (req, res) => {  
  const userid = req.session.user_id
  const newUserURLS = urlsForUser(userid);
  const templateVars = {
    urls: newUserURLS,
    userObject: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

//URL page by id

app.get("/urls/:id", (req, res) => {
  const userid = req.session.user_id
  const newUserURLS = urlsForUser(userid);
  for (const shortURLS in newUserURLS) {
    if (userid === newUserURLS[shortURLS].userID) {
      const templateVars = {
        urls: newUserURLS,
        userObject: users[req.session.user_id],
        id: req.params.id        
      };
      res.render("urls_show", templateVars);
    } else {
      return res.send('Error: this URL does not belong to you!!')
    }
  }
});

//Generate random short URL

app.post("/urls", (req, res) => {
  const userObject = users[req.session.user_id]
  if (userObject) {
    let newID = generateRandomString();
    urlDatabase[newID] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    }
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
  urlDatabase[id].longURL = longURL;
  res.redirect(`/urls`);
});

app.post("/urls/:id", (req,res) => {
  const userObject = req.session.user_id;
  if (userObject) {
    res.redirect(`/urls/${req.params.id}`);
  } else {
    res.send('You are not logged in or the id does not exist!');
  }
});

//Login Page and Post Functionality

app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user_id: req.session.user_id,
    userObject: users.user_id
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  for (const user in users) {
    if (users[user].email === req.body.email) 
    user_id = users[user].id;
    userObject = users[user];
  }
  if (getUserByEmail(req.body.email) && checkForPasswordMatch(req.body.password) ) {
    req.session.user_id = users[user_id].id;
    res.redirect('/urls');
  } else {
    res.status(403);
    res.send('Error: wrong email and/or password');
  }
});

//Logout functionality 

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// Registration page

app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user_id: req.session.user_id,
    userObject: users.user_id
  };
  res.render("register", templateVars);
});

//User data
const users = {};

//register functionality for users
app.post("/register", (req, res) => {
  if (getUserByEmail(req.body.email) === false) {
    res.status(400);
    res.send('User already exists!');
    return;
  };
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashPassword = bcrypt.hashSync(password, 10)
  users[id] = {
    id,
    email,
    password: hashPassword
  };
  if (!email || !password) {
    res.status(400);
    res.send('Please fill out all fields');
    setTimeout(() => res.redirect('/register'), 500)
  }
  req.session.user_id = id;
  console.log(users);
  res.redirect('/urls');
});

// Callbacks

// Only shows the URLs for the logged in user
function urlsForUser(id) {
  const userURLS = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLS[shortURL] = urlDatabase[shortURL]
    }
  }
  
  return userURLS;
};

// Checks for passwords match
function checkForPasswordMatch(loginPassword) {
  for (const user in users) {
    if (bcrypt.compareSync(loginPassword, users[user].password)) {
      return true;
    }
  }
};

// checks to see if the emails match 
function getUserByEmail(value) {
  for (const user in users) {
    if (users[user].email === value) {
      return true;
    }
  }
};
