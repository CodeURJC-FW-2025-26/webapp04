import express from 'express';

import { getPaginationParams, calculatePagination } from './middleware/pagination.js';
import { renderErrorPage } from './middleware/errorHandler.js';
import { SearchService } from './services/SearchService.js';

// Import route modules
import movieRoutes from './routes/movieRoutes.js';
import actorRoutes from './routes/actorRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import statusRoutes from './routes/statusRoutes.js';

const router = express.Router();
const searchService = new SearchService();

// Home page route
router.get('/', async (req, res) => {
    try {
        const { page, skip, limit } = getPaginationParams(req);
        const homeData = await searchService.getHomePageData(skip, limit);

        const totalPages = Math.ceil(homeData.totalMovies / limit);
        const pagination = calculatePagination(page, totalPages);

        res.render('home', {
            ...homeData,
            page,
            totalPages,
            ...pagination
        });
    } catch (error) {
        console.error('Error loading home page:', error);
        renderErrorPage(res, 'unknown', 'page');
    }
});

// Mount route modules
router.use('/movie', movieRoutes);
router.use('/actor', actorRoutes);
router.use('/api', apiRoutes);
router.use('/status', statusRoutes);

export default router;