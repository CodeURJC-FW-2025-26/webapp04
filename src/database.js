import { MongoClient } from 'mongodb';
import { DATABASE } from './constants.js';

const client = new MongoClient(DATABASE.URI);
await client.connect();

export const database = client.db(DATABASE.NAME);
console.log(`Connected to Database: ${DATABASE.NAME}`);