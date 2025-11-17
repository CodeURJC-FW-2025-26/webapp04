import { PAGINATION } from '../constants.js';

// Pagination middleware and helpers
const MOVIES_PER_PAGE = PAGINATION.MOVIES_PER_PAGE;
const MAX_PAGINATION_BUTTONS = PAGINATION.MAX_PAGINATION_BUTTONS;

export function getPaginationParams(req) {
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * MOVIES_PER_PAGE;
    return { page, skip, limit: MOVIES_PER_PAGE };
}

export function calculatePagination(currentPage, totalPages) {
    const pages = [];
    const { startPage, endPage } = getPaginationRange(currentPage, totalPages);

    for (let i = startPage; i <= endPage; i++) {
        pages.push({
            number: i,
            isCurrent: i === currentPage
        });
    }

    return {
        pages,
        hasPrev: currentPage > 1,
        hasNext: currentPage < totalPages,
        prevPage: currentPage - 1,
        nextPage: currentPage + 1
    };
}

function getPaginationRange(currentPage, totalPages) {
    if (totalPages <= MAX_PAGINATION_BUTTONS) {
        return { startPage: 1, endPage: totalPages };
    }

    if (currentPage <= 2) {
        return { startPage: 1, endPage: MAX_PAGINATION_BUTTONS };
    }

    if (currentPage >= totalPages - 1) {
        return {
            startPage: totalPages - (MAX_PAGINATION_BUTTONS - 1),
            endPage: totalPages
        };
    }

    return {
        startPage: currentPage - 1,
        endPage: currentPage + 1
    };
}