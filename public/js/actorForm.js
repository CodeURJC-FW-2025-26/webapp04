// Constants
const VALIDATION_RULES = {
    description: { min: 50, max: 1000 },
    name: { max: 200 },
    placeOfBirth: { max: 200 },
    birthDate: { min: '1900-01-01', max: '2026-12-31' }
};

const FIELD_IDS = {
    name: 'actorName',
    birthDate: 'actorBirthDate',
    placeOfBirth: 'actorBirthPlace',
    description: 'actorDescription',
    role: 'actorRole',
    portrait: 'actorPortrait'
};

// Initialize page functionality
function initializePageFunctionality() {
    utils.createCharacterCounter(
        FIELD_IDS.description,
        'charCount',
        VALIDATION_RULES.description.min,
        VALIDATION_RULES.description.max
    );

    utils.createImageUploader({
        fileInputId: FIELD_IDS.portrait,
        uploadBoxId: 'uploadBox',
        imagePreviewId: 'imagePreview',
        previewImgId: 'previewImg',
        removeBtnId: 'removeImage'
    });
}

async function submitActorForm(event, onSuccessCallback) {
    await utils.submitForm(event, displayClientErrors, displayServerErrors, onSuccessCallback);
}

function displayClientErrors(form) {
    utils.clearValidationState(form);

    const fields = {
        name: form.querySelector(`#${FIELD_IDS.name}`),
        birthDate: form.querySelector(`#${FIELD_IDS.birthDate}`),
        placeOfBirth: form.querySelector(`#${FIELD_IDS.placeOfBirth}`),
        description: form.querySelector(`#${FIELD_IDS.description}`),
        role: form.querySelector(`#${FIELD_IDS.role}`)
    };

    const validations = [
        validateName(fields.name),
        validateBirthDate(fields.birthDate),
        validatePlaceOfBirth(fields.placeOfBirth),
        validateDescription(fields.description),
        validateRole(fields.role)
    ];

    return validations.every(isValid => isValid);
}

function validateName(field) {
    return utils.validateCapitalizedString(
        field,
        'Name',
        VALIDATION_RULES.name.max
    );
}

function validateBirthDate(field) {
    return utils.validateDateRange(
        field,
        'Please provide a birthday.',
        VALIDATION_RULES.birthDate.min,
        VALIDATION_RULES.birthDate.max,
        'Birthday must be between 1900 and 2026.'
    );
}

function validatePlaceOfBirth(field) {
    return utils.validateTextLength(
        field,
        'Please provide a place of birth.',
        0,
        VALIDATION_RULES.placeOfBirth.max
    );
}

function validateDescription(field) {
    return utils.validateTextLength(
        field,
        'Please provide a description.',
        VALIDATION_RULES.description.min,
        VALIDATION_RULES.description.max
    );
}

function validateRole(field) {
    if (!field) return true;
    
    if (!field.value.trim()) {
        return utils.showFieldError(field, 'Please provide a role.');
    }
    return utils.markFieldValid(field);
}

function displayServerErrors(errors) {
    const form = document.querySelector('form');
    form.classList.remove('was-validated');

    utils.clearValidationState(form);

    const allFields = form.querySelectorAll('.form-control, .form-select');
    const errorFieldIds = new Set(errors.map(e => `actor${utils.capitalizeFirstLetter(e.field)}`));

    utils.markFieldsByErrorState(allFields, errorFieldIds);
    utils.displayErrorMessages(errors, 'actor');
}

window.initializePageFunctionality = initializePageFunctionality;

initializePageFunctionality();