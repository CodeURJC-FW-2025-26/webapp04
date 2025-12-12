import { VALIDATION } from '../constants.js';

export function validateActor(actorData, file) {
    const errors = [];
    const DESCRIPTION_MIN = VALIDATION.DESCRIPTION.MIN_LENGTH;
    const DESCRIPTION_MAX = VALIDATION.DESCRIPTION.MAX_LENGTH;
    const MIN_YEAR = VALIDATION.DATES.ACTOR_MIN_YEAR;
    const MAX_YEAR = VALIDATION.DATES.ACTOR_MAX_YEAR;

    // Required fields - Name
    if (!actorData.name?.trim()) {
        errors.push({
            field: 'name',
            type: 'emptyFields',
            message: 'Name is required'
        });
    }

    // Name Capitalization (if available)
    if (actorData.name && !startsWithCapital(actorData.name)) {
        errors.push({
            field: 'name',
            type: 'nameCapitalization',
            message: 'Name must start with a capital letter'
        });
    }

    // Required fields - Description
    if (!actorData.description?.trim()) {
        errors.push({
            field: 'description',
            type: 'emptyFields',
            message: 'Description is required'
        });
    }

    // Description Length (if available)
    if (actorData.description) {
        const descriptionLength = actorData.description.trim().length;
        if (descriptionLength < DESCRIPTION_MIN || descriptionLength > DESCRIPTION_MAX) {
            errors.push({
                field: 'description',
                type: 'descriptionLength',
                message: `Description must be between ${DESCRIPTION_MIN} and ${DESCRIPTION_MAX} characters`
            });
        }
    }

    // Required fields - Date of Birth
    if (!actorData.dateOfBirth) {
        errors.push({
            field: 'dateOfBirth',
            type: 'emptyFields',
            message: 'Date of birth is required'
        });
    }

    // Valid Date (if available)
    if (actorData.dateOfBirth) {
        const birthDate = new Date(actorData.dateOfBirth);
        const birthYear = birthDate.getFullYear();

        if (isNaN(birthDate.getTime())) {
            errors.push({
                field: 'dateOfBirth',
                type: 'invalidDate',
                message: 'Please provide a valid date'
            });
        } else if (birthYear < MIN_YEAR || birthYear > MAX_YEAR) {
            errors.push({
                field: 'dateOfBirth',
                type: 'invalidDate',
                message: `Birth year must be between ${MIN_YEAR} and ${MAX_YEAR}`
            });
        }
    }

    // Required fields - Place of Birth
    if (!actorData.placeOfBirth?.trim()) {
        errors.push({
            field: 'placeOfBirth',
            type: 'emptyFields',
            message: 'Place of birth is required'
        });
    }

    // Portrait is optional, no error if missing

    // Required fields - Role, only if sent from movie context
    if (actorData.movieSlug && !actorData.role.trim()) {
        errors.push({
            field: 'role',
            type: 'emptyFields',
            message: 'Role is required'
        })
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

function startsWithCapital(str) {
    if (!str || str.length === 0) return false;
    return /^[A-Z]/.test(str.trim());
}