const firebaseAdmin = require('../config/firebase');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
const env = require('../config/env');

/**
 * Middleware to verify Firebase ID token
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await firebaseAdmin.getAuth().verifyIdToken(token);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };
    
    next();
  } catch (error) {
    if (error.code === 'auth/id-token-expired') {
      return next(new UnauthorizedError('Token expired'));
    }
    if (error.code === 'auth/argument-error') {
      return next(new UnauthorizedError('Invalid token format'));
    }
    next(new UnauthorizedError('Invalid token'));
  }
};

/**
 * Middleware to check if user is a system admin
 */
const requireAdmin = (req, res, next) => {
  try {
    if (!req.user || !req.user.email) {
      throw new UnauthorizedError('Authentication required');
    }

    const adminEmails = env.ADMIN_EMAILS.split(',').map(email => email.trim().toLowerCase());
    const userEmail = req.user.email.toLowerCase();

    if (!adminEmails.includes(userEmail)) {
      throw new ForbiddenError('Admin access required');
    }

    req.user.isAdmin = true;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication - attaches user if token is valid, but doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await firebaseAdmin.getAuth().verifyIdToken(token);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };
    
    next();
  } catch (error) {
    // Don't fail, just continue without user
    next();
  }
};

module.exports = {
  verifyFirebaseToken,
  requireAdmin,
  optionalAuth
};
