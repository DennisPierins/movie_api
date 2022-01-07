/**
 * Imports all modules needed for the api
 */
const mongoose = require("mongoose");
Models = require("./models.js");
morgan = require("morgan");
express = require("express");
bodyParser = require("body-parser");
passport = require("passport");
require("./passport");
cors = require("cors");

const Movies = Models.Movie;
const Users = Models.User;

/**
 * Connects the MongoDB database
 */
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
//.catch(error => handleError(error));
//mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

/**
 * Allows the use of express
 */
const app = express();

/**
 * Logs a timestamp and pathname to the console
 */
app.use(morgan("common"));

/**
 * Serves the documentation.html file to the browser
 */
app.use(express.static("public"));

app.use(bodyParser.json());

let allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:1234",
  "http://localhost:4200",
  "https://themyflixapi.herokuapp.com",
  "https://myflixmoviedb.netlify.app",
  "https://dennispierins.github.io",
];

const { check, validationResult } = require("express-validator");

/**
 * cors blocks request from origins not specifically included in
 * allowedOrigins array
 */
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn't found on the list of allowed allowedOrigins
        let message =
          "The CORS policy for this application doesn't allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

// app.use(cors());

/**
 * imports auth.js containing api call to login endpoint and authentication
 */
let auth = require("./auth")(app);

/**
 * api call to homepage
 */
app.get("/", (req, res) => {
  res.send("Welcome to myFlix!");
});

/**
 * api call to GET all movies data
 * passport.authenticate('jwt', { session: false })
 */
app.get(
  "/movies",

  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * api call to GET all users data
 */
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    Users.find()
      .then(function (users) {
        res.status(201).json(users);
      })
      .catch(function (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * api call to GET data about a single movie by title
 */
app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Movie: req.params.Title })
      .then((movie) => {
        res.status(201).json(movie);
      })
      .catch((err) => {
        res.status(500).send("Error: This movie is not in our database");
      });
  }
);

/**
 * api call to GET data about a genre by genre name
 */
app.get(
  "/movies/Genres/:Name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.Name })
      .then((movie) => {
        res.status(201).json(movie.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: This genre is not in our database");
      });
  }
);

/**
 * api call to GET data about a director by director name
 */
app.get(
  "/movies/Directors/:Name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Director.Name": req.params.Name })
      .then((movie) => {
        res.status(201).json(movie.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: This director is not in our database");
      });
  }
);

/**
 * api call to POST a new user to register
 */
app.post(
  "/users",
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty() which means "opposite of isEmpty" in plain english "is not empty" or use .isLength({min: 5}) which means minimum value of 5 characters are only allowed
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .send(
          "Error: Your username must contain a minimum of five non alphanumeric characters, a password is required and a valid email address must be submitted"
        );
    }

    let hashedPassword = Users.hashPassword(req.body.Password);

    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + "already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: No new user was created");
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

/**
 * api call to GET data about a single user by username
 */
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * api call to update user data by username
 */
app.put(
  "/users/:Username",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .send(
          "Error: Your username must contain a minimum of five non alphanumeric characters, a password is required and a valid email address must be submitted"
        );
    }

    let hashedPassword = Users.hashPassword(req.body.Password);

    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: The user was not updated");
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * api call to post a new movie to a user's favourite list
 */
app.post(
  "/users/:Username/Movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res
            .status(500)
            .send(
              "Error: The movie was not added to the user's Favorites List"
            );
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * api call to delete a movie from a user's favourite list
 */
app.delete(
  "/users/:Username/Movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res
            .status(500)
            .send(
              "Error: The movie was not deleted from the user's Favorites List"
            );
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * api call to delete a user from the user collection in the database
 */
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res
            .status(400)
            .send("User " + req.params.Username + " was not found");
        } else {
          res.status(200).send("User " + req.params.Username + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: The user was not deleted");
      });
  }
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

//app.listen(8080, () => console.log("Your app is listening on port 8080."));

/**
 * Listens for requests and looks for a pre-configured port number in the environment variable
 * If nothing is found it sets the port to 8080
 */
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
