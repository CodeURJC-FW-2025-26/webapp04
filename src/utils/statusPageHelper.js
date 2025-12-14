import { getErrorDetails } from './errorHandler.js';

// Create an error status page based on error type and entity
export function createErrorPage(errorType, entity, details = {}) {
    const errorDetails = getErrorDetails(errorType, entity, details);

    return {
        pageTitle: 'Error',
        iconClass: 'bi-exclamation-triangle-fill',
        iconColor: 'text-danger',
        title: errorDetails.title,
        message: errorDetails.message,
        redirectUrl: errorDetails.redirectUrl,
        redirectIcon: errorDetails.redirectIcon,
        redirectText: errorDetails.redirectText,
        statusCode: getStatusCode(errorType)
    };
}

// Map error types to HTTP status codes
function getStatusCode(errorType) {
    const statusCodes = {
        notFound: 404,
        unknown: 500
    };

    return statusCodes[errorType] || 500;
}