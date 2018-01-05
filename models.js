'use strict';
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// represents schema for blog posts
const blogSchema = mongoose.Schema({
  title: {type: String, required: true},
  content: String,
  author: {
    firstName: String,
    lastName: String
    },
  created: {type: Date, default: Date.now()}
});

// virtual property to return full author name
blogSchema.virtual('authorName').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim()});

// instance method that returns blog posts in format that we want
blogSchema.methods.serialize = function() {
  return {
    title: this.title,
    content: this.content,
    author: this.authorName,
    created: this.created,
    id: this._id
  };
}

const BlogPost = mongoose.model('posts', blogSchema);
module.exports = { BlogPost };