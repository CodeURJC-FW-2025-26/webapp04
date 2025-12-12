// Constants
const VALIDATION_RULES = {
    description: { min: 50, max: 1000 },
    title: { max: 200 },
    releaseDate: { min: '1888-01-01', max: '2030-12-31' }
};

const FIELD_IDS = {
    title: 'movieTitle',
    genre: 'movieGenre',
    ageRating: 'movieAgeRating',
    releaseDate: 'movieReleaseDate',
    country: 'movieCountryOfProduction',
    description: 'movieDescription',
    poster: 'moviePoster'
};

// Initialize page functionality
utils.createCharacterCounter(
    FIELD_IDS.description,
    'charCount',
    VALIDATION_RULES.description.min,
    VALIDATION_RULES.description.max
);
utils.createImageUploader({
    fileInputId: FIELD_IDS.poster,
    uploadBoxId: 'uploadBox',
    imagePreviewId: 'imagePreview',
    previewImgId: 'previewImg',
    removeBtnId: 'removeImage'
});

async function submitMovieForm(event) {
    await utils.submitForm(event, displayClientErrors, displayServerErrors);
}

function displayClientErrors(form) {
    utils.clearValidationState(form);

    const fields = {
        title: form.querySelector(`#${FIELD_IDS.title}`),
        genre: form.querySelector(`#${FIELD_IDS.genre}`),
        ageRating: form.querySelector(`#${FIELD_IDS.ageRating}`),
        releaseDate: form.querySelector(`#${FIELD_IDS.releaseDate}`),
        country: form.querySelector(`#${FIELD_IDS.country}`),
        description: form.querySelector(`#${FIELD_IDS.description}`)
    };

    const validations = [
        validateTitle(fields.title),
        validateGenre(fields.genre),
        validateAgeRating(fields.ageRating),
        validateReleaseDate(fields.releaseDate),
        validateCountry(fields.country),
        validateDescription(fields.description)
    ];

    return validations.every(isValid => isValid);
}

function validateTitle(field) {
    return utils.validateCapitalizedString(field, 'Title', VALIDATION_RULES.title.max);
}

function validateGenre(field) {
    return utils.validateMultiSelect(field, 'Please select at least one genre.');
}

function validateAgeRating(field) {
    return utils.validateSelect(field, 'Please select an age rating.');
}

function validateReleaseDate(field) {
    return utils.validateDateRange(
        field,
        'Please provide a release date.',
        VALIDATION_RULES.releaseDate.min,
        VALIDATION_RULES.releaseDate.max,
        'Release date must be between 1888 and 2030.'
    );
}

function validateCountry(field) {
    return utils.validateMultiSelect(field, 'Please select at least one production country.');
}

function validateDescription(field) {
    return utils.validateTextLength(
        field,
        'Please provide a description.',
        VALIDATION_RULES.description.min,
        VALIDATION_RULES.description.max
    );
}

function displayServerErrors(errors) {
    const form = document.querySelector('form');
    form.classList.remove('was-validated');

    utils.clearValidationState(form);

    const allFields = form.querySelectorAll('.form-control, .form-select');
    const errorFieldIds = new Set(errors.map(e => `movie${utils.capitalizeFirstLetter(e.field)}`));

    utils.markFieldsByErrorState(allFields, errorFieldIds);
    utils.displayErrorMessages(errors, 'movie');
}