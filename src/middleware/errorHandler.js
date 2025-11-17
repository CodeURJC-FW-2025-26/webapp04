import { createErrorPage } from '../utils/statusPageHelper.js';

// Error Rendering
export function renderErrorPage(res, errorType, entity, details = {}) {
    const pageData = createErrorPage(errorType, entity, details);
    res.status(pageData.statusCode || 500).render('statusPage', pageData);
}

export function renderValidationError(res, errorType, entity, details = {}) {
    const pageData = createErrorPage(errorType, entity, details);
    res.status(400).render('statusPage', pageData);
}