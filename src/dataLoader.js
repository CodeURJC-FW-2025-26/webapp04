import fs from 'node:fs/promises';
import { PATHS } from './constants.js';
import { database } from './database.js';
import * as movieCatalogue from './movieCatalogue.js';
import * as actorCatalogue from './actorCatalogue.js';

const DATA_FOLDER = './data';
const UPLOADS_FOLDER = './uploads';
const dataMovies = 'movies.json';
const dataActors = 'actors.json';

const CLEAR_DB_ON_START = true; // set to true to clear existing data on each start

if (CLEAR_DB_ON_START) {
    await database.collection('movies').deleteMany({});
    await database.collection('actors').deleteMany({});
}

const moviesCount = await database.collection('movies').countDocuments();
const actorsCount = await database.collection('actors').countDocuments();

if (moviesCount !== 0 && actorsCount !== 0) {
    console.log('Demo data not loaded because collections are not empty.');
} else {
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

    await fs.rm(UPLOADS_FOLDER, { recursive: true, force: true });
    await fs.mkdir(UPLOADS_FOLDER);
    await fs.cp(DATA_FOLDER + '/../public/img/moviePosters', UPLOADS_FOLDER + '/' + PATHS.MOVIE_POSTERS, { recursive: true });
    await fs.cp(DATA_FOLDER + '/../public/img/actorPortraits', UPLOADS_FOLDER + '/' + PATHS.ACTOR_PORTRAITS, { recursive: true });

    console.log('Demo data loaded');
}