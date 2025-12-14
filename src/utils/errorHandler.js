export function getErrorDetails(errorType, entity, details = {}) {
    const errorDetails = {
        notFound: {
            title: `${capitalize(entity)} Not Found`,
            message: `The ${entity} you're looking for doesn't exist or has been removed.`,
            redirectUrl: '/',
            redirectIcon: 'bi-house-fill',
            redirectText: 'Go to Home'
        },
        unknown: {
            title: 'Something Went Wrong',
            message: 'An unexpected error occurred. Please try again later.',
            redirectUrl: '/',
            redirectIcon: 'bi-house-fill',
            redirectText: 'Go to Home'
        }
    };

    return errorDetails[errorType] || errorDetails.unknown;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}