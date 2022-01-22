// index.js

/**
 *  Required External Modules
 */

import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { ga, sc } from './lib/ns-scraper.js';
import asyncHandler from 'express-async-handler';

/**
 * App Variables
 */

const __dirname = dirname(fileURLToPath(import.meta.url)); // jshint ignore:line
const app = express();
const port = process.env.PORT || '3000';

/**
 * App Configuration
 */

dotenv.config();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/scripts', express.static(`${__dirname}/node_modules/`));

/**
 * Routes Definitions
 */

app.get('/', (req, res) => {
  res.render('main', {
    page: 'intro'
  });
});
app.get('/apidoc', (req, res) => {
  res.render('main', {
    page: 'apidoc'
  });
});

app.get('/ga', asyncHandler(async (req, res, next) => { // jshint ignore:line
  let data = await ga().then(result => {
    if(result !== false) {
      return JSON.parse(result);
    }
    else {
      return false;
    }
  });
  res.render('main', {
    page: 'ga',
    data: data
  });
}));

app.get('/sc', asyncHandler(async (req, res, next) => { // jshint ignore:line
  let data = await sc().then(data => {
    if(data !== false) {
      let json = JSON.parse(data);
      return json;
    }
    else {
      return false;
    }
  });
  res.render('main', {
    page: 'sc',
    data: data
  });
}));

app.get('*', function (req, res, next) {
  const error = new Error('Not found');
  error.statusCode = 404;
  next(error);
});

app.use((error, req, res, next) => { // jshint ignore:line
  if (!error.statusCode) {
    error.statusCode = 500;
  }

  res.render('main', {
    page: 'error',
    title: error.statusCode,
    message: error.message || 'Internal Server Error'
  });
});

/**
 * Server Activation
 */

app.listen(port, () => {
  console.log('Listening on %d', port);
});