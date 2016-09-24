import jwt from 'jsonwebtoken';
import unless from 'express-unless';
import log4js from 'log4js';
import {auth} from '../config';

const logger = log4js.getLogger('Access');

/* eslint-disable consistent-return */
/* eslint-disable no-else-return */
function authenticateToken(req, res, next) {
  const {secret} = auth.jwt;
  let token = '';
  const authorizationHeader = req.headers.authorization;
  if (authorizationHeader) {
    const infos = authorizationHeader.split(' ');
    const schema = infos[0];

    if (schema !== 'Bearer') {
      return res.json({
        success: false,
        message: `Wrong schema "${schema}" request header "Authorization".`,
      });
    }
    token = infos[1];
  } else {
    token = req.body.token || req.query.token || req.headers['x-access-token'];
  }

  if (token) {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.json({
          success: false,
          message: 'Failed to authenticate token.',
        });
      } else {
        /* eslint-disable no-param-reassign */
        req.user = decoded;
        return next();
      }
    });
  } else {
    return res.status(403).json({
      success: false,
      message: 'No token provided',
    });
  }
}
authenticateToken.unless = unless;

function loggerAccess(req, res, next) {
  logger.debug(`Accessed ${req.url}`);
  return next();
}

export {
  authenticateToken,
  loggerAccess,
};