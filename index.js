const mongoose = require('mongoose');
  Models = require('./models.js');
  morgan = require("morgan");
  express = require("express");
  bodyParser = require("body-parser");

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(morgan("common"));

app.use(express.static('public'));

app.use(bodyParser.json());


// GET homepage
app.get("/", (req, res) => {
  res.send("Welcome to myFlix!");
});

// GET a list of data about all movies
app.get('/movies', (req, res) => {
   Movies.find()
   .then((movies) => {
     res.status(201).json(movies);
   })
   .catch((err) => {
     console.error(err);
     res.status(500).send("Error: " + err);
   });
 });

 // GET a list of all the users
app.get("/users", function (req, res) {
  Users.find()
    .then(function (users) {
      res.status(201).json(users);
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

 // GET data about a single movie by title
 app.get('/movies/:title', (req, res) => {
   Movies.findOne({ Movie: req.params.Title})
   .then((movie) => {
     res.status(201).json(movie);
   })
   .catch((err) => {
     res.status(500).send("Error: This movie is not in our database");
   });
 });

 // GET data about a genre by name
 app.get('/movies/Genres/:Name', (req, res) => {
   Movies.findOne({ "Genre.Name": req.params.Name })
   .then((movie) => {
     res.status(201).json(movie.Genre);
   })
   .catch((err) => {
     console.error(err);
     res.status(500).send("Error: This genre is not in our database");
   });
 });

 // GET data about a director by name
 app.get('/movies/Directors/:Name', (req, res) => {
   Movies.findOne({ "Director.Name": req.params.Name })
   .then((movie) => {
     res.status(201).json(movie.Director);
   })
   .catch((err) => {
     console.error(err);
     res.status(500).send("Error: This director is not in our database");
   });
 });

 // Allow users to register
 app.post('/users', (req, res) => {
   Users.findOne({ Username: req.body.Username })
     .then((user) => {
       if (user) {
         return res.status(400).send(req.body.Username + 'already exists');
       } else {
         Users
           .create({
             Username: req.body.Username,
             Password: req.body.Password,
             Email: req.body.Email,
             Birthday: req.body.Birthday
           })
           .then((user) =>{res.status(201).json(user) })
         .catch((error) => {
           console.error(error);
           res.status(500).send('Error: No new user was created');
         })
       }
     })
     .catch((error) => {
       console.error(error);
       res.status(500).send('Error: ' + error);
     });
 });

 // PUT user information
 app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: The user was not updated');
    } else {
      res.json(updatedUser);
    }
  });
});

// POST movie to user's list of favourite movies
app.post('/users/:Username/Movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { FavoriteMovies: req.params.MovieID }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
   if (err) {
     console.error(err);
     res.status(500).send('Error: The movie was not added to the user\'s Favorites List');
   } else {
     res.json(updatedUser);
   }
  });
});

// DELETE movie from user's list of favourite movies
app.delete('/users/:Username/Movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $pull: { FavoriteMovies: req.params.MovieID }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
   if (err) {
     console.error(err);
     res.status(500).send('Error: The movie was not deleted from the user\'s Favorites List');
   } else {
     res.json(updatedUser);
   }
  });
});

// DELETE user information
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send('User' + req.params.Username + ' was not found');
      } else {
        res.status(200).send('User' + req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: The user was not deleted');
    });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.listen(8080, () => console.log("Your app is listening on port 8080."));
