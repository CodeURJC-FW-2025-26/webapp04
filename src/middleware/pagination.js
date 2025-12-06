import { PAGINATION } from '../constants.js';

// Pagination helper for infinite scroll
const MOVIES_PER_PAGE = PAGINATION.MOVIES_PER_PAGE;

export function getPaginationParams(req) {
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * MOVIES_PER_PAGE;
    return { page, skip, limit: MOVIES_PER_PAGE };
}