import { MongoClient } from 'mongodb';

const client = new MongoClient('mongodb://localhost:27017');
await client.connect();

export const database = client.db('cinemateca');
console.log('Connected to Database');
