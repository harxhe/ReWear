import mongoose from 'mongoose';

import { requireMongoUri } from '../config/env.js';

let connectionPromise;

export async function connectToDatabase() {
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(requireMongoUri());
  }

  await connectionPromise;
  return mongoose.connection;
}

export async function disconnectFromDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

export { mongoose };
