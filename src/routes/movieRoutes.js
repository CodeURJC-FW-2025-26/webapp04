import express from 'express';

import { COUNTRIES, GENRES, AGE_RATINGS } from '../constants.js';
import { uploadPoster } from '../imageUploader.js';
import { renderErrorPage, renderValidationError } from '../middleware/errorHandler.js';
import { MovieService } from '../services/MovieService.js';
import { ValidationError, NotFoundError, DuplicateError } from '../utils/errors.js';

const router = express.Router();
const movieService = new MovieService();

// Movie detail page
router.get('/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const movieData = await movieService.getMovieForDisplay(slug);
        
        res.render('movie', movieData);
    } catch (error) {
        if (error instanceof NotFoundError) {
            return renderErrorPage(res, 'notFound', 'movie');
        }
        console.error('Error loading movie details:', error);
        renderErrorPage(res, 'unknown', 'movie');
    }
});

router.get('/:slug/actors', async (req, res) => {
    try {
        const slug = req.params.slug;
        const movieActors = await movieService.getMovieActorsForDisplay(slug);

        res.render('partials/actorSection', movieActors);
    } catch (error) {
        console.error('Error loading actors:', error);
        res.status(500).send('<p>Failed to load actors</p>');
    }
});

// Movie poster download
router.get('/:slug/poster', async (req, res) => {
    try {
        const slug = req.params.slug;
        const { posterPath } = await movieService.getPosterPathBySlug(slug);

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

// Add new movie form
router.get('/add/new', (req, res) => {
    try {
        res.render('editMovie', {
            countries: COUNTRIES,
            action: `/movie/create`,
            ageRating: AGE_RATINGS,
            genres: GENRES
        });
    } catch (error) {
        console.error('Error loading add movie page:', error);
        renderErrorPage(res, 'unknown', 'page');
    }
});

// Create new movie
router.post('/create', uploadPoster, async (req, res) => {
    try {
        const result = await movieService.createMovie(req.body, req.file);
        
        res.redirect(`/status/movie-created?title=${encodeURIComponent(result.title)}&slug=${result.slug}`);
    } catch (error) {
        if (error instanceof ValidationError) {
            return renderValidationError(res, error.type, 'movie', error.details);
        }
        if (error instanceof DuplicateError) {
            return renderValidationError(res, 'duplicateTitle', 'movie', { title: error.value });
        }
        console.error('Error adding movie:', error);
        renderErrorPage(res, 'unknown', 'movie');
    }
});

// Edit movie form
router.get('/:slug/edit', async (req, res) => {
    try {
        const slug = req.params.slug;
        const editData = await movieService.getMovieForEdit(slug, GENRES, COUNTRIES, AGE_RATINGS);
        
        res.render('editMovie', {
            ...editData,
            action: `/movie/${slug}/update`
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return renderErrorPage(res, 'notFound', 'movie');
        }
        console.error('Error loading edit movie page:', error);
        renderErrorPage(res, 'unknown', 'movie');
    }
});

// Update movie
router.post('/:slug/update', uploadPoster, async (req, res) => {
    try {
        const movieSlug = req.params.slug;
        const result = await movieService.updateMovie(movieSlug, req.body, req.file);
        
        res.redirect(`/status/movie-updated?title=${encodeURIComponent(result.title)}&slug=${result.slug}`);
    } catch (error) {
        if (error instanceof NotFoundError) {
            return renderErrorPage(res, 'notFound', 'movie');
        }
        if (error instanceof ValidationError) {
            return renderValidationError(res, error.type, 'movie', error.details);
        }
        console.error('Error updating movie:', error);
        renderErrorPage(res, 'unknown', 'movie');
    }
});

// Serve poster images
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

export default router;