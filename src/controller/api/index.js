import express from 'express';
import jwt from 'jsonwebtoken';
import log4js from 'log4js';

import shareRouter from './share';
import accountsRouter from './accounts';
import User from '../../model/User';

import {auth} from '../../config';

const logger = log4js.getLogger('Api');
const apiRouter = new express.Router();

apiRouter.post('/token', (req, res) => {
  const {secret} = auth.jwt;
  const {username: reqUsername, password: reqPassword} = req.body;
  User.findUniqueUserByUsername(reqUsername, (err, user) => {
    const {username, password, ...profile} = user;
    if (err) {
      logger.error(`Fetching user named ${reqUsername} from database failed.`);
      throw err;
    }
    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Authentication failed. User not found.',
      });
    } else {
      if (password !== reqPassword) {
        res.statue(400).json({
          success: false,
          message: 'Authentication failed. Wrong password.',
        });
      } else {
        const payload = {
          username,
          profile,
        };

        const token = jwt.sign(payload, secret, {
          expiresIn: '1 days',
        });

        res.json({
          success: true,
          message: 'Enjoy yourself in this awesome app.',
          token,
        });
      }
    }
  });
});

apiRouter.use('/accounts', accountsRouter);
apiRouter.use('/share', shareRouter);

export default apiRouter;
