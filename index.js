const express = require("express");
morgan = require("morgan");

const app = express();

app.use(morgan("common"));

app.use(express.static("public"));

let topMovies = [
  {
    title: "The Big Lebowski",
    directors: "Ethan Coen & Joel Coen"
  },
  {
    title: "Pulp Fiction",
    director: "Quentin Tarantino"
  },
  {
    title: "Snatch",
    director: "Guy Ritchie"
  },
  {
    title: "Fargo",
    directors: "Ethan Coen & Joel Coen"
  },
  {
    title: "City of God",
    directors: "Fernando Meirelles & Katia Lund"
  },
  {
    title: "City Lights",
    director: "Charles Chaplin"
  },
  {
    title: "O Brother, Where Art Thou?",
    director: "Ethan Coen & Joel Coen"
  },
  {
    title: "American Beauty",
    director: "Sam Mendes"
  },
  {
    title: "The Godfather",
    director: "Francis Ford Coppola"
  },
  {
    title: "Interstellar",
    director: "Christopher Nolan"
  }
];

// GET requests

app.get("/", (req, res) => {
  res.send("Welcome to myFlix!");
});

app.get("/movies", (req, res) => {
  res.json(topMovies);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.listen(8080, () => console.log("Your app is listening on port 8080."));
