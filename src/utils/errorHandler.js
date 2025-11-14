export function getErrorDetails(errorType, entity, details = {}) {
    const errorDetails = {
        duplicateTitle: {
            title: 'Duplicate Title',
            message: `A ${entity} with the title "${details.title}" already exists. Please choose a different title.`,
            redirectUrl: `/addNew${capitalize(entity)}`,
            redirectIcon: 'bi-arrow-left',
            redirectText: 'Back to Form'
        },
        titleCapitalization: {
            title: 'Invalid Title Format',
            message: `The ${entity} title must begin with a capital letter.`,
            redirectUrl: `/addNew${capitalize(entity)}`,
            redirectIcon: 'bi-arrow-left',
            redirectText: 'Back to Form'
        },
        emptyFields: {
            title: 'Required Fields Missing',
            message: `Please fill in the following required field: ${details.fields || 'unknown field'}.`,
            redirectUrl: `/addNew${capitalize(entity)}`,
            redirectIcon: 'bi-arrow-left',
            redirectText: 'Back to Form'
        },
        invalidDate: {
            title: 'Invalid Date',
            message: details.min && details.max
                ? `Please provide a valid release date between ${details.min} and ${details.max}.`
                : 'Please provide a valid release date.',
            redirectUrl: `/addNew${capitalize(entity)}`,
            redirectIcon: 'bi-arrow-left',
            redirectText: 'Back to Form'
        },
        invalidAgeRating: {
            title: 'Invalid Age Rating',
            message: `Age rating must be one of: ${details.validValues || 'A, 7, 12, 16, 18'}.`,
            redirectUrl: `/addNew${capitalize(entity)}`,
            redirectIcon: 'bi-arrow-left',
            redirectText: 'Back to Form'
        },
        descriptionLength: {
            title: 'Invalid Description Length',
            message: `Description must be between ${details.min} and ${details.max} characters. Current length: ${details.current}.`,
            redirectUrl: `/addNew${capitalize(entity)}`,
            redirectIcon: 'bi-arrow-left',
            redirectText: 'Back to Form'
        },
        missingPoster: {
            title: 'Missing Poster Image',
            message: 'Please upload a poster image for the movie.',
            redirectUrl: `/addNew${capitalize(entity)}`,
            redirectIcon: 'bi-arrow-left',
            redirectText: 'Back to Form'
        },
        notFound: {
            title: `${capitalize(entity)} Not Found`,
            message: `The ${entity} you're looking for doesn't exist or has been removed.`,
            redirectUrl: '/',
            redirectIcon: 'bi-house-fill',
            redirectText: 'Go to Home'
        },
        deleteError: {
            title: 'Delete Failed',
            message: `Unable to delete the ${entity}. Please try again later.`,
            redirectUrl: 'javascript:history.back()',
            redirectIcon: 'bi-arrow-left',
            redirectText: 'Go Back'
        },
        network: {
            title: 'Network Error',
            message: 'Unable to connect to the server. Please check your connection and try again.',
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