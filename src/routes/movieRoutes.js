import express from 'express';

import { COUNTRIES, GENRES, AGE_RATINGS } from '../constants.js';
import { uploadPoster } from '../imageHandler.js';
import { renderErrorPage, sendJsonErrorPage, sendJsonValidationError } from '../middleware/errorHandler.js';
import { MovieService } from '../services/MovieService.js';
import { ValidationError, NotFoundError, DuplicateError } from '../utils/errors.js';

const router = express.Router();
const movieService = new MovieService();

// GET FORM to add a movie
router.get('/add/new', (req, res) => {
    try {
        res.render('editMovie', {
            action: `/movie/create`,
            genres: GENRES,
            countries: COUNTRIES,
            ageRating: AGE_RATINGS
        });
    } catch (error) {
        console.error('Error loading add movie page:', error);
        renderErrorPage(res, 'unknown', 'page');
    }
});

// GET FROM to edit movie form
router.get('/edit/:movieSlug', async (req, res) => {
    try {
        const movieSlug = req.params.movieSlug;
        const editData = await movieService.getMovieForEdit(movieSlug, GENRES, COUNTRIES, AGE_RATINGS);

        res.render('editMovie', {
            ...editData,
            action: `/movie/update/${movieSlug}`
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return renderErrorPage(res, 'notFound', 'movie');
        }
        console.error('Error loading edit movie page:', error);
        renderErrorPage(res, 'unknown', 'movie');
    }
});

// CREATE a new movie
router.post('/create', uploadPoster, async (req, res) => {
    try {
        const result = await movieService.createMovie(req.body, req.file);

        res.json({
            valid: true,
            message: `${result.title} has been created successfully!`,
            redirect: `/movie/${result.slug}`,
            title: result.title
        });

    } catch (error) {
        if (error instanceof ValidationError) {
            return sendJsonValidationError(res, 'validationError', 'movie', error.details);
        }
        if (error instanceof DuplicateError) {
            return res.status(400).json({
                valid: false,
                message: `A movie with the title "${error.value}" already exists.`,
                errors: [
                    {
                        field: 'title',
                        message: `A movie with the title "${error.value}" already exists.`
                    }
                ]
            });
        }
        console.error("Create movie error:", error);
        sendJsonErrorPage(res, 'unknown', 'movie');
    }
});

// UPDATE a move
router.post('/update/:movieSlug', uploadPoster, async (req, res) => {
    try {
        const movieSlug = req.params.movieSlug;
        const result = await movieService.updateMovie(movieSlug, req.body, req.file);

        res.json({
            valid: true,
            message: `${result.title} has been updated successfully!`,
            redirect: `/movie/${result.slug}`,
            title: result.title
        });

    } catch (error) {
        if (error instanceof ValidationError) {
            return sendJsonValidationError(res, 'validationError', 'movie', error.details);
        }
        if (error instanceof DuplicateError) {
            return res.status(400).json({
                valid: false,
                message: `A movie with the title "${error.value}" already exists.`,
                errors: [
                    {
                        field: 'title',
                        message: `A movie with the title "${error.value}" already exists.`
                    }
                ]
            });
        }
        if (error instanceof NotFoundError) {
            return sendJsonErrorPage(res, 'notFound', 'movie');
        }

        console.error("Update movie error:", error);
        sendJsonErrorPage(res, 'unknown', 'movie');
    }
});

// GET MOVIE POSTER by filename
router.get('/moviePosters/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const { posterPath } = await movieService.getPosterPathByFilename(filename);

        res.sendFile(posterPath, (err) => {
            if (err && !res.headersSent) {
                res.status(404).send('Poster not found');
            }
        });
    } catch (error) {
        console.error('Error loading poster:', error);
        res.status(500).send('Server error');
    }
});

// GET MOVIE POSTER by slug
router.get('/:movieSlug/poster', async (req, res) => {
    try {
        const movieSlug = req.params.movieSlug;
        const { posterPath } = await movieService.getPosterPathBySlug(movieSlug);

        res.download(posterPath, (err) => {
            if (err && !res.headersSent) {
                res.status(500).send('Error downloading poster');
            }
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).send('Poster not found');
        }
        console.error('Error loading poster:', error);
        res.status(500).send('Server error');
    }
});

// GET ACTORS SECTION of movie detail page
router.get('/:movieSlug/actors', async (req, res) => {
    try {
        const movieSlug = req.params.movieSlug;
        const movieActors = await movieService.getMovieActorsForDisplay(movieSlug);

        res.render('partials/actorSection', movieActors);
    } catch (error) {
        console.error('Error loading actors:', error);
        res.status(500).send('<p>Failed to load actors</p>');
    }
});

// GET MOVIE DETAIL PAGE
router.get('/:movieSlug', async (req, res) => {
    try {
        const movieSlug = req.params.movieSlug;
        const movieData = await movieService.getMovieForDisplay(movieSlug);

        res.render('movie', movieData);
    } catch (error) {
        if (error instanceof NotFoundError) {
            return renderErrorPage(res, 'notFound', 'movie');
        }
        console.error('Error loading movie details:', error);
        renderErrorPage(res, 'unknown', 'movie');
    }
});

export default router;