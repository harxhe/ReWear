import { connectToDatabase, disconnectFromDatabase, mongoose } from '../src/db/mongoose.js';

await connectToDatabase();

try {
  await mongoose.connection.dropDatabase();
  console.log('ReWear MongoDB database dropped successfully.');
} finally {
  await disconnectFromDatabase();
}
