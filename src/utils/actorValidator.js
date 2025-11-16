export function validateActor(actorData, file) {
    const errors = [];
    const DESCRIPTION_MIN = 50;
    const DESCRIPTION_MAX = 1000;
    const CURRENT_YEAR = new Date().getFullYear();
    const MIN_YEAR = 1900; // reasonable min for actor birth year
    const MAX_YEAR = CURRENT_YEAR + 1; // allow up to next year

    // Required fields - Name
    if (!actorData.name?.trim()) {
        errors.push({
            type: 'emptyFields',
            details: { fields: 'name' }
        });
    }

    // Name Capitalization (if available)
    if (actorData.name && !startsWithCapital(actorData.name)) {
        errors.push({ type: 'nameCapitalization' });
    }

    // Required fields - Description
    if (!actorData.description?.trim()) {
        errors.push({
            type: 'emptyFields',
            details: { fields: 'description' }
        });
    }

    // Description Length (if available)
    if (actorData.description) {
        const descriptionLength = actorData.description.trim().length;
        if (descriptionLength < DESCRIPTION_MIN || descriptionLength > DESCRIPTION_MAX) {
            errors.push({
                type: 'descriptionLength',
                details: {
                    min: DESCRIPTION_MIN,
                    max: DESCRIPTION_MAX,
                    current: descriptionLength
                }
            });
        }
    }

    // Required fields - Date of Birth
    if (!actorData.dateOfBirth) {
        errors.push({
            type: 'emptyFields',
            details: { fields: 'date of birth' }
        });
    }

    // Valid Date (if available)
    if (actorData.dateOfBirth) {
        const birthDate = new Date(actorData.dateOfBirth);
        const birthYear = birthDate.getFullYear();

        if (isNaN(birthDate.getTime())) {
            errors.push({ type: 'invalidDate' });
        } else if (birthYear < MIN_YEAR || birthYear > MAX_YEAR) {
            errors.push({
                type: 'invalidDate',
                details: {
                    min: MIN_YEAR,
                    max: MAX_YEAR
                }
            });
        }
    }

    // Required fields - Place of Birth
    if (!actorData.placeOfBirth?.trim()) {
        errors.push({
            type: 'emptyFields',
            details: { fields: 'place of birth' }
        });
    }

    // Portrait is optional, no error if missing

    return {
        isValid: errors.length === 0,
        errors
    };
}

function startsWithCapital(str) {
    if (!str || str.length === 0) return false;
    return /^[A-Z]/.test(str.trim());
}

export const VALIDATION_CONSTANTS = {
    DESCRIPTION_MIN: 50,
    DESCRIPTION_MAX: 1000,
    MIN_YEAR: 1900,
    MAX_YEAR: new Date().getFullYear() + 1
};