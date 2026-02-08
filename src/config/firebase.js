const admin = require('firebase-admin');
const env = require('./env');
const logger = require('./logger');

class FirebaseAdmin {
  constructor() {
    if (!FirebaseAdmin.instance) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: env.FIREBASE_PROJECT_ID,
            clientEmail: env.FIREBASE_CLIENT_EMAIL,
            privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          }),
          projectId: env.FIREBASE_PROJECT_ID
        });
        
        logger.info('Firebase Admin SDK initialized');
        FirebaseAdmin.instance = this;
      } catch (error) {
        logger.error('Failed to initialize Firebase Admin SDK:', error);
        throw error;
      }
    }
    return FirebaseAdmin.instance;
  }

  getAuth() {
    return admin.auth();
  }
}

const instance = new FirebaseAdmin();
module.exports = instance;
