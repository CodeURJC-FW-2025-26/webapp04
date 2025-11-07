import fs from 'node:fs/promises';
import {database} from './database.js';
import * as movieCatalogue from './movieCatalogue.js';
import * as actorCatalogue from './actorCatalogue.js';

const DATA_FOLDER = './data';
const dataMovies = 'movies.json';
const dataActors = 'actors.json';

const CLEAR_DB_ON_START = true; // TODO

if (CLEAR_DB_ON_START) {
    await database.collection('movies').deleteMany({});
    await database.collection('actors').deleteMany({});
}

const dataMoviesString = await fs.readFile(`${DATA_FOLDER}/${dataMovies}`, 'utf8');
const dataActorsString = await fs.readFile(`${DATA_FOLDER}/${dataActors}`, 'utf8');

const movies = JSON.parse(dataMoviesString);
const actors = JSON.parse(dataActorsString);

const actorIdByName = {};
for (const actor of actors) {
    actorIdByName[actor.name] = await actorCatalogue.addActor(actor);
}

for (const movie of movies) {
    if (Array.isArray(movie.actors)) {
        const mapped = [];
        for (const entry of movie.actors) {
            const actorId = actorIdByName[entry.name];
            if (!actorId) {
                continue;
            }

            mapped.push({
                actorId,
                role: entry.role
            });
        }
        movie.actors = mapped;
    }
    await movieCatalogue.addMovie(movie);
}

console.log('Demo data loaded');