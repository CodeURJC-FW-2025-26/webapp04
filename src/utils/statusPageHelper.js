import { getErrorDetails } from './errorHandler.js';

// Create a success status page with custom message and redirect
export function createSuccessPage(title, message, redirectUrl, redirectIcon, redirectText) {
    return {
        pageTitle: title,
        iconClass: 'bi-check-circle-fill',
        iconColor: 'text-success',
        title,
        message,
        redirectUrl,
        redirectIcon,
        redirectText,
        statusCode: 200
    };
}

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
        duplicateTitle: 400,
        titleCapitalization: 400,
        emptyFields: 400,
        invalidDate: 400,
        invalidAgeRating: 400,
        descriptionLength: 400,
        missingPoster: 400,
        deleteError: 500,
        network: 503,
        unknown: 500
    };

    return statusCodes[errorType] || 500;
}