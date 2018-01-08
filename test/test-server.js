const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require("mongoose");
const expect = chai.expect;
const should = chai.should();
const {TEST_DATABASE_URL} = require('../config');
const { BlogPost } = require('../models');
const { app, runServer, closeServer } = require('../server');

chai.use(chaiHttp);

// generate documents for testing using Faker library
function seedBlogData() {
  console.info('seeding data');
  const seedData = [];
  for (let i=1; i<=10; i++) {
    seedData.push(generateBlogData());
  }
  return BlogPost.insertMany(seedData);
}

// generate an object represnting a blog post
// can be used to generate seed data for db
// or request.body data
function generateBlogData() {
  return {
    title: faker.lorem.sentence(),
    content: faker.lorem.content(),
    author: {
      firstName: faker.name.firstName(),
      lastName:  faker.name.lastName()
    },
    created: faker.date.recent()
}


// this function deletes the entire database.
// we'll call it in an `afterEach` block below
// to ensure data from one test does not stick
// around for next one
function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('BlogPosts', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedBlogData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

describe('GET endpoint', function() {

  it('should return all existing posts on GET', function() {

    return chai
      .request(app)
      .get('/posts')
      .then(function(_res) {
        res = _res;
        res.should.have.status(200);
        res.body.posts.should.have.length.of.at.least(1);
        return BlogPost.count();
      })
      .then(function(count) {
        res.body.posts.should.have.length.of(count);
      });
  });

  it('should return blog posts with right fields', function() {

    let resPost;

      return chai.request(app)
        .get('/posts')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body.posts).to.be.a('array');
          expect(res.body.posts).to.have.length.of.at.least(1);

          res.body.posts.forEach(function(post) {
            expect(post).to.be.a('object');
            expect(post).to.include.keys(
              'id', 'title', 'content', 'author', 'created');
          });
          resPost = res.body.posts[0];
          return BlogPost.findById(resPost.id);
        })
        .then(function(post) {
          expect(resPost.id).to.equal(post.id);
          expect(resPost.title).to.equal(post.title);
          expect(resPost.content).to.equal(post.content);
          expect(resPost.author).to.equal(post.author);
          expect(resPost.created).to.equal(post.created);
        });
    });
  });

describe('POST endpoint', function() {
    // strategy: make a POST request with data,
    // then prove that the blog we get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it('should add a new blog post', function() {

      const newPost = generateBlogData();

      return chai.request(app)
        .post('/posts')
        .send(newPost)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys(
            'id', 'title', 'content', 'author', 'created');
          expect(res.body.name).to.equal(newPost.name);
          // cause Mongo should have created id on insertion
          expect(res.body.id).to.not.be.null;
          expect(res.body.title).to.equal(newPost.title);
          expect(res.body.author).to.equal(newPost.author);
          expect(res.body.created).to.equal(newPost.created);

          return BlogPost.findById(res.body.id);
        })
        .then(function(post) {
          expect(post.title).to.equal(newPost.title);
          expect(post.author.firstName).to.equal(newPost.author.firstName);
          expect(post.author.lastName).to.equal(newPost.author.lastName);
          expect(post.content).to.equal(newPost.content);
          expect(post.created).to.equal(newPost.created);
        });
    });
  });
 
describe('PUT endpoint', function() {
    // strategy:
    //  1. Get an existing blog post from db
    //  2. Make a PUT request to update that post
    //  3. Prove post returned by request contains data we sent
    //  4. Prove post in db is correctly updated
    it('should update fields you send over', function() {
      const updateData = {
        title: 'This is a test post',
        content: 'futuristic fusion, solar winds, star wars, star trek and harry potter'
      };

      return BlogPost
        .findOne()
        .then(function(post) {
          updateData.id = post.id;

          // make request then inspect it to make sure it reflects
          // data we sent
          return chai.request(app)
            .put(`/posts/${post.id}`)
            .send(updateData);
        })
        .then(function(res) {
          expect(res).to.have.status(204);

          return BlogPost.findById(updateData.id);
        })
        .then(function(post) {
          expect(post.title).to.equal(updateData.title);
          expect(post.content).to.equal(updateData.content);
        });
    });
  });

  describe('DELETE endpoint', function() {
    // strategy:
    //  1. get a blog post
    //  2. make a DELETE request for that post's id
    //  3. assert that response has right status code
    //  4. prove that post with the id doesn't exist in db anymore
    it('delete a blog post by id', function() {

      let post;

      return BlogPost
        .findOne()
        .then(function(_post) {
          post = _post;
          return chai.request(app).delete(`/restaurants/${post.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return BlogPost.findById(post.id);
        })
        .then(function(_post) {
          expect(_post).to.be.null;
        });
    });
  });
});
}