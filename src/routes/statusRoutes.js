import express from 'express';
import { createSuccessPage, createErrorPage } from '../utils/statusPageHelper.js';

const router = express.Router();

// Movie status pages
router.get('/movie-created', (req, res) => {
    const movieTitle = req.query.title || 'Unknown Movie';
    const movieSlug = req.query.slug;

    const pageData = createSuccessPage(
        'Movie Created Successfully',
        `"${movieTitle}" has been added.`,
        `/movie/${movieSlug}`,
        'bi-eye',
        'View Movie Details'
    );

    res.render('statusPage', pageData);
});

router.get('/movie-updated', (req, res) => {
    const movieTitle = req.query.title || 'Unknown Movie';
    const movieSlug = req.query.slug;

    const pageData = createSuccessPage(
        'Movie Updated Successfully',
        `"${movieTitle}" has been updated.`,
        `/movie/${movieSlug}`,
        'bi-eye',
        'View Movie Details'
    );

    res.render('statusPage', pageData);
});

router.get('/movie-deleted', (req, res) => {
    const movieTitle = req.query.title || 'Unknown Movie';

    const pageData = createSuccessPage(
        'Movie Deleted Successfully',
        `"${movieTitle}" has been removed.`,
        '/',
        'bi-house-fill',
        'Go to Home'
    );

    res.render('statusPage', pageData);
});

// Actor status pages
router.get('/actor-created', (req, res) => {
    const actorName = req.query.name || 'Unknown Actor';
    const actorSlug = req.query.slug;
    const movieSlug = req.query.movieSlug;
    const movieTitle = req.query.movieTitle;

    // If created from movie context, redirect back to movie
    if (movieSlug && movieTitle) {
        const pageData = createSuccessPage(
            'Actor Added to Movie',
            `"${actorName}" has been added to "${movieTitle}".`,
            `/movie/${movieSlug}`,
            'bi-eye',
            'Back to Movie'
        );
        return res.render('statusPage', pageData);
    }

    // Standard actor creation (standalone)
    const pageData = createSuccessPage(
        'Actor Created Successfully',
        `"${actorName}" has been added.`,
        `/actor/${actorSlug}`,
        'bi-eye',
        'View Actor Details'
    );

    res.render('statusPage', pageData);
});

router.get('/actor-updated', (req, res) => {
    const actorName = req.query.name || 'Unknown Actor';
    const actorSlug = req.query.slug;

    const pageData = createSuccessPage(
        'Actor Updated Successfully',
        `"${actorName}" has been updated.`,
        `/actor/${actorSlug}`,
        'bi-eye',
        'View Actor Details'
    );

    res.render('statusPage', pageData);
});

router.get('/actor-deleted', (req, res) => {
    const actorName = req.query.name || 'Actor';

    const pageData = createSuccessPage(
        'Actor Deleted Successfully',
        `${actorName} has been removed.`,
        '/',
        'bi-house-fill',
        'Go to Home'
    );

    res.render('statusPage', pageData);
});

router.get('/actor-removed-from-movie', (req, res) => {
    const actorName = req.query.actorName || 'Actor';
    const movieTitle = req.query.movieTitle || 'Movie';
    const movieSlug = req.query.movieSlug;

    const pageData = createSuccessPage(
        'Actor Removed from Movie',
        `"${actorName}" has been removed from "${movieTitle}".`,
        movieSlug ? `/movie/${movieSlug}` : '/',
        'bi-eye',
        movieSlug ? 'Back to Movie' : 'Go to Home'
    );

    res.render('statusPage', pageData);
});

router.get('/actor-updated-in-movie', (req, res) => {
    const actorName = req.query.actorName || 'Actor';
    const movieTitle = req.query.movieTitle || 'Movie';
    const movieSlug = req.query.movieSlug;
    const role = req.query.role || 'Unknown Role';

    const pageData = createSuccessPage(
        'Actor Updated in Movie',
        `"${actorName}" has been updated in "${movieTitle}" with role "${role}".`,
        movieSlug ? `/movie/${movieSlug}` : '/',
        'bi-eye',
        movieSlug ? 'Back to Movie' : 'Go to Home'
    );

    res.render('statusPage', pageData);
});

// Generic error page
router.get('/error', (req, res) => {
    const errorType = req.query.type || 'unknown';
    const entity = req.query.entity || 'item';
    const details = req.query.details ? JSON.parse(req.query.details) : {};

    const pageData = createErrorPage(errorType, entity, details);
    res.status(pageData.statusCode || 500).render('statusPage', pageData);
});

export default router;