'use strict';
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/restful_blog_app' || "mongodb://letmein:333999@ds237717.mlab.com:37717/restful_blog_db";

exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/restaurants-app';

exports.PORT = process.env.PORT || 8080;

