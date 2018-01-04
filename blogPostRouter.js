const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const mongoose = require('mongoose');
const { BlogPost } = require('./models');

mongoose.Promise = global.Promise;
router.use(bodyParser.json());

// when the root of this router is called with GET, return
// all current blog posts
router.get('/', (req, res) => {
  BlogPost.find()
    .then(posts => {
      res.json({
      posts: posts.map( 
        (post) => post.serialize())
    })
  }).catch(err => {
    console.log(err);
    res.status(500).json({message: "Can't get blog posts. Something went wrong."});
  });
});

//returns blog post by id
router.get('/:id', (req, res) => {
  BlogPost.findById(req.params.id)
    .then(post => res.json(post.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: "Can't get your post. Something went wrong."})
    });
});

// when a new blog post is posted, make sure it's
// got required fields ('title','content','author'). if not,
// log an error and return a 400 status code. if okay,
// add new post with a 201.
router.post('/', (req, res) => {
  // ensure 'title', 'content', 'author' are in request body
  const requiredFields = ['title', 'content', 'author'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  BlogPost.create({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author})
    .then(post => res.status(201).json(post.serialize()))
    .catch(err => { 
    console.error(err);
    res.status(500).json({message: "Sorry, cannot create your post. Internal error."});
});
});

// when DELETE request comes in with an id in path,
// try to delete that item from posts.
router.delete('/:id', (req, res) => {
  BlogPost.findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch(err => {
      console.error(err);
      res.status(500).json({message: "Can't delete your post. Something went wrong."})
    });
});
// when PUT request comes in with updated item, ensure has
// required fields. also ensure that item id in url path, and
// item id in updated item object match. if problems with any
// of that, log error and send back status code 400. otherwise
// call `BlogPosts.update` with updated item.
router.put('/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
      const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
      console.error(message);
      return res.status(400).json({message: message});
  }
  const toUpdate = {};
  const updatableFields = ['title', 'content', 'author'];
  
  updatableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });
  BlogPost
  .findByIdAndUpdate(req.params.id, {$set: toUpdate})
  .then(post => res.status(204).end())
  .catch(err => res.status(500).json({message: "Internal error"}));
});

module.exports = router;
