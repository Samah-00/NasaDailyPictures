// ------- Require Section -------
const express = require('express');
const router = express.Router();
const { Sequelize } = require('sequelize');
// use the cookie package
const bcrypt = require('bcrypt'); // to encrypt passwords
const session = require('express-session');
const crypto = require('crypto'); // to generate a secret key for the session

// --- global consts and variables ---
let indexMatched = false;
let emailUsed = false;
let timeOut = false;
const saltRounds = 10;

// --- prepare the session, the connection and the database ---
// generate a secret key for the session
 const secret = crypto.randomBytes(64).toString('hex');
router.use(session({
  secret: secret,
  resave: false,
  saveUninitialized: true,
}));

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'path/to/database.sqlite'
});

sequelize.authenticate().then(()=>{
  console.log('Connection has been established successfully.');
})
    .catch((err)=>{
      console.log(err);
    })

const User = require('../models/User')(sequelize); // Import the User model
User.sync({force: false}).then(() => {
  console.log("Users table is up");
});

const Comment = require('../models/Comment')(sequelize); // Import the Comment model
Comment.sync({force: false}).then(() => {
  console.log("Comments table is up");
});

// ------------ functions ------------
// Create a new user
async function createUser(email, name, lastName, password) {
  // Create a new user with the email, name, lastName and hashed password
  await User.create({ email, name, lastName, password: await bcrypt.hash(password, saltRounds) })
      .then(() => console.log("Created a user successfully."))
      .catch(err => {
        console.log(err);
        alert("An error has occurred: " + err.message);
      });
}

// Create a new comment
async function createComment(email, name, lastName, imageId, content) {
  // Create a new user with the email, name, lastName, imageId and content of the comment
  await Comment.create({ email, name, lastName, imageId, content })
      .then(() => console.log("Created a comment successfully."))
      .catch(err => {
        console.log(err);
        alert("An error has occurred: " + err.message);
      });
}

/**
 * This function checks if an email exists in the users' database
 * @param email
 * @returns {Promise<User>} true if the email exists, false otherwise
 */
async function isUserInDB(email) {
  return User.findOne({ where: { email }})
      .then(user =>{
            if (!user) {
              // If a user with the given email is not found
              console.log(`User not found with email: ${email}`);
              return false;
            } else {
              // If a user with the given email is found
              console.log(`User found: ${user.name} ${user.lastName}`);
              return true;
            }
          }
      )
      .catch(err => {
        console.log(err);
        alert("An error has occurred: " + err.message);
      });
}

/**
 * This function finds a user by his email then returns all the data for that user
 * @param email
 * @returns {Promise<User>}
 */
async function findUserByEmail(email) {
  return User.findOne({ where: { email }})
      .then(user =>{ return user })
      .catch(err => {
        console.log(err);
        alert("An error has occurred: " + err.message);
      });
}

// This function finds all the comments to an image and returns them
async function findCommentsByImageId(imageId) {
  return Comment.findAll({ where: { imageId }})
      .then(comments => {
        if(typeof comments === "undefined")
          return [];
        else{
          return comments;
        }
      })
      .catch(err => {console.log(err);alert("An error has occurred: " + err.message);});
}

/* GET home page */
router.get('/', function(req, res) {
  if(req.session.firstName) // if the user is still logged in then stay in the nasa feed page
    res.redirect('/nasa-feed')
  else
  {
    // Clear the session file then display the login view.
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('session is clear...ready to login');
        res.render('index',{ Title: 'Login', indexMatched, error: null});
      }
    });
  }
});


//post for the login page - when clicking on the login button
router.post('/', async (req, res) => {
  checkCredentials(req.body.emailBox, req.body.PasswordBox)
      .then(validLogin =>
          {
            if(validLogin) { //the passwords match
              // obtain the user's info from the DB and store them in a session then display the nasa-feed view
              findUserByEmail(req.body.emailBox).then( user => {
                    req.session.email = user.email;
                    req.session.firstName = user.name;
                    req.session.lastName = user.lastName;
                    res.redirect('/nasa-feed');
              }).catch(() => {
                req.session.email = null;
                req.session.firstName = null;
                req.session.lastName = null;
                res.redirect('/nasa-feed');
              });
            } else {
              indexMatched =  false;
              res.render('index',{ Title: 'Login', indexMatched, error: `Email address or password isn't correct`});
            }
          }).catch(err =>
  {
    console.log(err);
    res.render('index',{ Title: 'Login', indexMatched, error: 'An error occurred, please try again' });
  });
});

router.get('/logout', function(req, res) {
  // Clear the session file then display the login view.
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      res.redirect('/errorPage');
    } else {
      console.log('session is clear...ready to login');
      indexMatched = false;
      res.redirect('/')
    }
  });
});

//this function checks if the email exists in the database and that the password match (is correct)
//returns true if it matches, false otherwise
async function checkCredentials(email,password) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    console.log(`User not found with email: ${email}`);
    return false;
  }
  else {
    console.log(`User found: ${user.email}`);
    return await bcrypt.compare(password, user.password)
        .then(isPasswordValid => {
          if(isPasswordValid) {
            console.log("passwords match");
            return true;
          } else {
            console.log("passwords don't match");
            return false;
          }
        });
  }
}

router.get('/registration', function(req, res) {
  res.render('registration', { Title: 'Register', emailUsed ,timeOut });
});

router.get('/nasa-feed', function(req, res) {
  if(req.session.firstName) // if the user is still logged in stay in the nasa feed page
    res.render('nasa', { Title: 'Nasa Feed', firstName: req.session.firstName, lastName: req.session.lastName});
  else
  {
    indexMatched =  false;
    res.redirect('/');
  }
});


router.post('/getUserData', function(req, res) {
  //make sure the session didn't expire
  if(!req.session.email)
    res.redirect('/'); //if expired go to login page
  else{
    res.json(req.session.email);
  }
});


router.get('/Password', async function(req, res) {
  let userExist = await isUserInDB(req.query.emailBox);
  if(!userExist && req.cookies.email){
    res.render('Password', { Title: 'Password', matched: false });
  }
  else if(userExist || !req.cookies.email) { //to make sure that the user exists
    emailUsed = userExist;
    timeOut = false;
    res.redirect('/registration');
  }
  else { //to make sure that the user exists
    emailUsed = userExist;
    timeOut = false;
    res.redirect('/registration');
  }
});

router.post('/Password',function(req,res){
  const pass1 = req.body.password1Box;
  const pass2 = req.body.password2Box;

  //to check if the user exists (in case he signed in the same time from another browser)
  isUserInDB(req.cookies.email)
      .then( userExist =>
          {
            if(userExist) {
              emailUsed = true;
              timeOut = false;
              res.redirect('/registration');
            } else {
              if(req.cookies.email) //to check if the 30 seconds didn't pass
              {
                if(pass1 === pass2)
                {
                  //create user
                  createUser(req.cookies.email,req.cookies.firstName, req.cookies.lastName,pass1)
                      .catch(err => console.log(err));
                  indexMatched = true;
                  res.redirect('/');
                }
                else
                  res.render('Password',{ Title: 'Password',matched: true });
              }
              else // 30 seconds has passed since the user registered
              {
                emailUsed = false;
                timeOut = true;
                res.redirect('/registration');
              }
            }
          }).catch(err => {
            console.log(err);
            res.redirect('/errorPage');
          });
});

router.post('/addComment', function(req, res) {
  //make sure the session didn't expire
  if(!req.session.email)
    res.redirect('/'); //if expired go to login page
  else
  {
    createComment(req.session.email,req.session.firstName,req.session.lastName,req.body.imageId,req.body.content)
        .then(() =>
            findCommentsByImageId(req.body.imageId)
                .then(comments => {
                  res.json(comments);
                })
                .catch(() => res.redirect('errorPage'))
        )
        .catch(()=> res.redirect('/errorPage'));
  }
});

router.delete('/comments/:id', (req, res) => {
  const commentId = req.params.id;
    const imageId = req.body.imageId;
  // Use Sequelize to delete the comment with the given id
  Comment.destroy({
    where: {
      id: commentId
    }
  })
      .then(() => {
        findCommentsByImageId(imageId)
            .then(comments => {
              res.json(comments);
            })
      })
      .catch(error => {
        res.status(500).json({ error: error.message });
        res.redirect('/errorPage');
      });
});

router.post('/findComments', function(req, res) {
  //make sure the session didn't expire
  if(!req.session.email)
    res.redirect('/'); //if expired go to login page
  else
  {
    findCommentsByImageId(req.body.imageId) //returning all the comments belonging to a specific imageID
        .then(comments => {
          res.json(comments);
        })
        .catch(() => res.redirect('errorPage'))
  }
});

// GET error page
// redirect to this page when an error occurs
router.get('/errorPage', function(req, res) {
  res.render('errorPage',{ Title: 'Error'});
});

module.exports = router;
