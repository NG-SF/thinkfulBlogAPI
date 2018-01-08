'use strict';
const mongoose = require('mongoose');
const moment = require('moment');
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

// virtual property to return date formated with moment.js
blogSchema.virtual('publishDate').get(function() {
  return moment(Date.now()).format('MMMM Do YYYY');
});

// instance method that returns blog posts in format that we want
blogSchema.methods.serialize = function() {
  return {
    title: this.title,
    content: this.content,
    author: this.authorName,
    created: this.publishDate,
    id: this._id
  };
}

const BlogPost = mongoose.model('posts', blogSchema);
module.exports = { BlogPost };