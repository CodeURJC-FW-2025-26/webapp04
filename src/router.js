import express from 'express';
import { ObjectId } from 'mongodb';

import * as movieCatalogue from './movieCatalogue.js';
import * as actorCatalogue from './actorCatalogue.js';
import {getImagePath, renameUploadedFile, uploadPoster} from "./imageUploader.js";

const router = express.Router();
export default router;

router.get('/', async (req, res) => {
    const movies = await movieCatalogue.getMovies();
    res.render('index', {movies});
});


router.get('/movieDetails/:id', async (req, res) => {
    try {
        const movieId = new ObjectId(req.params.id);
        const movie = await movieCatalogue.getMovie(movieId);

        if (!movie) {
            return res.status(404).send('Movie not found');
        }

        const actorsResolved = [];

        if (Array.isArray(movie.actors)) {
            for (const ref of movie.actors) {
                const actor = await actorCatalogue.getActor(ref.actorId);
                if (!actor) {
                    continue;
                }

                actorsResolved.push({
                    id: actor._id.toString(),
                    name: actor.name,
                    portrait: actor.portrait,
                    description: actor.description,
                    role: ref.role
                });
            }
        }

        res.render('movieDetails', {
            ...movie,
            id: movie._id.toString(),
            genresText: movie.genre?.join(', '),
            countriesText: movie.countryOfProduction?.join(', '),
            hasActors: actorsResolved.length > 0,
            actors: actorsResolved
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.get('/personDetails/:id', async (req, res) => {
    try {
        const actorId = new ObjectId(req.params.id);
        const actor = await actorCatalogue.getActor(actorId);

        if (!actor) {
            return res.status(404).send('Actor not found');
        }

        const birthDate = new Date(actor.dateOfBirth);
        const birthdayFormatted = birthDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();

        res.render('personDetails', {
            ...actor,
            birthdayFormatted,
            age
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
});


router.get('/addNewMovie', (req, res) => {
    try {
        res.render('addNewMovie', {});

    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.post('/addNewMovie', uploadPoster, (req, res) => {
    try {
        let oldName = req.file?.filename;

        const finName = renameUploadedFile(oldName, req.body.title, req.body.releaseYear);

        const movie = {
            title: req.body.title,
            poster: getImagePath(finName),
            description: req.body.description,
            genre: Array.isArray(req.body.genre) ? req.body.genre : [req.body.genre],
            releaseYear: Number(req.body.releaseYear),
            countryOfProduction: Array.isArray(req.body.countryOfProduction) ? req.body.countryOfProduction : [req.body.countryOfProduction],
            ageRestriction: Number(req.body.ageRestriction),
            actors: Array.isArray(req.body.actors) ? req.body.actors : [req.body.actors]
        };

        movieCatalogue.addMovie(movie);
        res.redirect('/');

    } catch (err) {
        res.status(500).send('Server error');

    }
});