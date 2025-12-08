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
// JSON-Version
export function sendJsonErrorPage(res, errorType, entity, details = {}, status = 500) {
    const pageData = createErrorPage(errorType, entity, details);
    res.status(status).json({
        type: 'error',
        title: pageData.title,
        message: pageData.message,
        entity: entity,
        details: details
    });
}

// JSON-Version
export function sendJsonValidationError(res, errorType, entity, details = {}) {
    const pageData = createErrorPage(errorType, entity, details);
    res.status(400).json({
        type: 'error',
        title: pageData.title,
        message: pageData.message,
        entity: entity,
        details: details
    });
}
