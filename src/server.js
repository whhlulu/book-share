import 'babel-polyfill';
import path from 'path';
import express from 'express';
import expressGraphQL from 'express-graphql';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
import session from 'express-session';
import PrettyError from 'pretty-error';

import schema from './data/schema';
import assets from './assets';
import {port, auth} from './config';
import mongodbConnect from './database/db';

import React from 'react';
import {renderToString} from 'react-dom/server';
import {match, RouterContext} from 'react-router';
import routes from './router/routes';

import {Provider} from 'react-redux';
import store from './stores/Store';

import indexRouter from './controller/index';
import apiRouter from './controller/api';
import testRouter from './controller/test';
import {loggerAccess} from './controller/middlewares';
import passport from './core/passport';

import WithStylesContext from './components/WithStylesContext';

const server = global.server = express();
const MongoStore = require('connect-mongo')(session);

//
// Tell any CSS tooling (such as Material UI) to use all vendor prefixes if the
// user agent is not known.
// -----------------------------------------------------------------------------
global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || 'all';

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
server.enable('trust proxy');
server.use(express.static(path.join(__dirname, 'public')));
server.use(cookieParser(auth.session.secret));
server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());

//
// Authentication
// -----------------------------------------------------------------------------
server.use(cors());
server.use(session({
  secret: auth.session.secret,
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({dbPromise: mongodbConnect}),
}));
server.use(passport.initialize());
server.use(passport.session());
server.use(passport.loggerMiddleware());

/**
 *
 * Tool middlewares
 */
server.use(loggerAccess);

//
// Register API middleware
// -----------------------------------------------------------------------------
server.use('/graphql', expressGraphQL(req => ({
  schema,
  graphiql: true,
  rootValue: {request: req},
  pretty: process.env.NODE_ENV !== 'production',
})));

server.use('/api', apiRouter);
server.use('/manage', indexRouter);
server.use('/test', testRouter);

server.get('*', (req, res) => {
  match({routes, location: req.url}, (err, redirectLocation, renderProps) => {
    const template = require('./views/index.jade');
    const data = {
      title: '图书分享',
      description: '',
      css: '',
      body: '',
      entry: assets.main.js,
    };

    if (err) {
      res.status(500).send(err.message);
    } else if (redirectLocation) {
      res.redirect(302, redirectLocation.pathname + redirectLocation.search);
    } else if (renderProps) {
      const css = [];

      data.body = renderToString(
        <Provider store={store}>
          <WithStylesContext onInsertCss={styles => css.push(styles._getCss())}>
            <RouterContext {...renderProps} />
          </WithStylesContext>
        </Provider>
      );

      res.status(200).send(template(data));
    } else {
      res.status(404).send('Not found');
    }
  }); // ~match
});

//
// Error handling
// -----------------------------------------------------------------------------
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');

server.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.log(pe.render(err)); // eslint-disable-line no-console
  const template = require('./views/error.jade');
  const statusCode = err.status || 500;
  res.status(statusCode);
  res.send(template({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '' : err.stack,
  }));
});

//
// Launch the server
// -----------------------------------------------------------------------------
server.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`The server is running at http://localhost:${port}/`);
});
