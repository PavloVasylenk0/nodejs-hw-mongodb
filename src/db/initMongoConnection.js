import mongoose from 'mongoose';
import getEnvVar from '../utils/getEnvVar.js';

const initMongoConnection = async () => {
  const user = getEnvVar('MONGODB_USER');
  const password = getEnvVar('MONGODB_PASSWORD');
  const url = getEnvVar('MONGODB_URL');
  const dbName = getEnvVar('MONGODB_DB');

  const mongoUri = `mongodb+srv://${user}:${password}@${url}/${dbName}?retryWrites=true&w=majority`;

  await mongoose.connect(mongoUri);

  console.log('Mongo connection successfully established!');
};

export default initMongoConnection;
