const express = require("express");
morgan = require("morgan");

const app = express();

app.use(morgan("common"));

app.use(express.static('public'));

let topMovies = [
  {
    title: "The Big Lebowski",
    released: "1998",
    genre: "Comedy, Crime, Sport",
    directors: "Ethan Coen & Joel Coen"
  },
  {
    title: "Pulp Fiction",
    released: "1994",
    genre: "Crime, Drama",
    director: "Quentin Tarantino"
  },
  {
    title: "Snatch",
    released: "2000",
    genre: "Comedy, Crime",
    director: "Guy Ritchie"
  },
  {
    title: "Fargo",
    released: "1996",
    genre: "Crime, Drama, Thriller",
    directors: "Ethan Coen & Joel Coen"
  },
  {
    title: "City of God",
    released: "2002",
    genre: "Crime, Drama",
    directors: "Fernando Meirelles & Katia Lund"
  },
  {
    title: "City Lights",
    released: "1931",
    genre: "Comedy, Drama, Romance",
    director: "Charles Chaplin"
  },
  {
    title: "O Brother, Where Art Thou?",
    released: "2000",
    genre: "Adventure, Comedy, Crime, Music",
    director: "Ethan Coen & Joel Coen"
  },
  {
    title: "American Beauty",
    released: "1999",
    genre: "Drama",
    director: "Sam Mendes"
  },
  {
    title: "The Godfather",
    released: "1972",
    genre: "Crime, Drama",
    director: "Francis Ford Coppola"
  },
  {
    title: "Interstellar",
    released: "2014",
    genre: "Adventure, Drama, Sci-Fi",
    director: "Christopher Nolan"
  }
];

// GET homepage
app.get("/", (req, res) => {
  res.send("Welcome to myFlix!");
});

// GET a list of data about all movies
app.get('/movies', (req, res) => {
   res.send('Successful GET request returning data on all the movies');
 });

 // GET data about a single movie by title
 app.get('/movies/:title', (req, res) => {
   res.send('Successful GET request returning data on movie title: ' + req.params.title);
 });

 // GET data about a genre by title
 app.get('/movies/genres/:genre', (req, res) => {
   res.send('Successful GET request returning data on genre: ' + req.params.genre);
 });

 // GET data about a director by name
 app.get('/movies/directors/:name', (req, res) => {
   res.send('Successful GET request returning data on director:' + req.params.name);
 });

 // POST new user registration
 app.post('/users', (req, res) => {
   res.send('Succesful POST request registering new user');
 });

 // PUT user information
 app.put('/users/:username', (req, res) => {
   res.send('Succesful PUT request updating user information for user: ' + req.params.username);
 });

 // POST movie to user's list of favourite movies
app.post('/users/:username/movies/:title', (req, res) =>{
  res.send('Succesful POST request adding movie ID: ' + req.params.title + 'to favourites list of user: ' + req.params.username);
});

// DELETE movie from user's list of favourite movies
app.delete('/users/:username/movies/:title', (req, res) =>{
  res.send('Succesful DELETE request removing movie ID: ' + req.params.title + 'from favourites list of user: ' + req.params.username);
});

// DELETE user information
app.delete('/users/:username', (req, res) =>{
  res.send('Succesful DELETE request removing user: ' + req.params.username);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.listen(8080, () => console.log("Your app is listening on port 8080."));
