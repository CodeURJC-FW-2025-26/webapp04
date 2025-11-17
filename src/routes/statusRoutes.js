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

// Person status pages
router.get('/person-created', (req, res) => {
    const actorName = req.query.name || 'Unknown Actor';
    const actorSlug = req.query.slug;

    const pageData = createSuccessPage(
        'Actor Created Successfully',
        `"${actorName}" has been added.`,
        `/person/${actorSlug}`,
        'bi-eye',
        'View Actor Details'
    );

    res.render('statusPage', pageData);
});

router.get('/person-updated', (req, res) => {
    const actorName = req.query.name || 'Unknown Actor';
    const actorSlug = req.query.slug;

    const pageData = createSuccessPage(
        'Actor Updated Successfully',
        `"${actorName}" has been updated.`,
        `/person/${actorSlug}`,
        'bi-eye',
        'View Actor Details'
    );

    res.render('statusPage', pageData);
});

router.get('/person-deleted', (req, res) => {
    const personName = req.query.name || 'Actor';

    const pageData = createSuccessPage(
        'Actor Deleted Successfully',
        `${personName} has been removed.`,
        '/',
        'bi-house-fill',
        'Go to Home'
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