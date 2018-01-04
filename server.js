'use strict';
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const app = express();
const blogPostRouter = require('./blogPostRouter');
const { PORT, DATABASE_URL } = require('./config');

mongoose.Promise = global.Promise;

// log the http layer
app.use(morgan('common'));
app.use(express.static('public'));

// when requests come into `/blog-posts`
// we'll route them to the express
// router instances we've imported.
app.use('/posts', blogPostRouter);

function runServer(databaseUrl = DATABASE_URL, port = PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, {useMongoClient: true}, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
