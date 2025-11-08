import express from 'express';
import { ObjectId } from 'mongodb';

import * as movieCatalogue from './movieCatalogue.js';
import * as actorCatalogue from './actorCatalogue.js';

const router = express.Router();
export default router;

router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    const totalMovies = await movieCatalogue.getTotalNumberOfMovies();
    const movies = await movieCatalogue.getMoviesPaginated(skip, limit);

    const totalPages = Math.ceil(totalMovies / limit);

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push({
            number: i,
            isCurrent: i === page
        });
    }

    res.render('index', {
        movies,
        page,
        totalPages,
        pages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
        prevPage: page - 1,
        nextPage: page + 1
    });
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

    res.render('addNewMovie', {

    });

});

router.post('/addNewMovie', (req, res) => {

    res.render('addNewMovie', {
        title: req.body.title
    });

});