import { getErrorDetails } from '../utils/errorHandler.js';
import { createErrorPage } from '../utils/statusPageHelper.js';

export function renderErrorPage(res, errorType, entity, details = {}) {
    const pageData = createErrorPage(errorType, entity, details);
    res.status(pageData.statusCode || 500).render('statusPage', pageData);
}

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

export function sendJsonValidationError(res, errorType, entity, details = {}) {
    res.status(400).json({
        valid: false,
        message: getErrorDetails(errorType, entity, details).message,
        errors: details
    });
}

export function sendJsonDuplicateError(res, entity, field, value) {
    res.status(400).json({
        valid: false,
        message: `A${entity === 'actor' ? 'n' : ''} ${entity} with the ${field} "${value}" already exists.`,
        errors: [
            {
                field: field,
                message: `A${entity === 'actor' ? 'n' : ''} ${entity} with the ${field} "${value}" already exists.`
            }
        ]
    });
}

export function sendJsonNotFoundError(res, entity) {
    const entityCapitalized = entity.charAt(0).toUpperCase() + entity.slice(1);
    res.status(404).json({
        success: false,
        title: `${entityCapitalized} Not Found`,
        message: `This ${entity} has already been deleted or does not exist.`
    });
}

export function sendJsonServerError(res, operation = 'process your request') {
    res.status(500).json({
        success: false,
        title: 'Server Error',
        message: `Failed to ${operation}. Please try again.`
    });
}