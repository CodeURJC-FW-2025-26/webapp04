// - - - DELETE OPERATIONS - - -
async function performDelete(endpoint, errorEntity) {
    try {
        const response = await fetch(endpoint, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Delete error:', error);
        showStatusModal('error', 'Error', `Failed to delete ${errorEntity}.`);
        throw error;
    }
}

function setupDeleteButton(buttonId, entityType) {
    const deleteButton = document.getElementById(buttonId);

    if (!deleteButton) return;

    deleteButton.addEventListener('click', async (e) => {
        const slug = e.currentTarget.dataset.slug;

        if (!slug) return;

        showConfirmationModal(
            'Are you sure?',
            `You are about to delete this ${entityType}. This action cannot be undone.`,
            async () => {
                const endpoint = `/api/${entityType}/${slug}`;
                const data = await performDelete(endpoint, entityType);

                if (data.success) {
                    showStatusModal('success', data.title, data.message, '/', data.redirectIcon, data.redirectText);
                }
            }
        );
    });
}

// - - - SHARED FORM UTILITIES - - -

// CSS class constants
const CSS_CLASSES = {
    valid: 'is-valid',
    invalid: 'is-invalid',
    textSuccess: 'text-success',
    textDanger: 'text-danger',
    textMuted: 'text-muted',
    dragOver: 'drag-over',
    invalidFeedback: 'invalid-feedback'
};

// Character counter with visual feedback
function createCharacterCounter(textareaId, displayId, minLength, maxLength) {
    const textarea = document.getElementById(textareaId);
    const display = document.getElementById(displayId);

    if (!textarea || !display) return;

    textarea.addEventListener('input', () => {
        const length = textarea.value.length;
        updateCharacterCount(display, length, minLength, maxLength);

        // Show counter and hide error message on input
        display.style.display = 'block';
        const feedbackElement = findFeedbackElement(textarea);
        if (feedbackElement) {
            feedbackElement.style.display = 'none';
        }
    });

    textarea.dispatchEvent(new Event('input'));
}

function updateCharacterCount(display, length, min, max) {
    display.textContent = `${length} / ${max} characters`;
    display.classList.remove(CSS_CLASSES.textMuted);

    const isValid = length >= min && length <= max;
    display.classList.toggle(CSS_CLASSES.textSuccess, isValid);
    display.classList.toggle(CSS_CLASSES.textDanger, !isValid);
}

// Image upload with drag & drop
function createImageUploader(config) {
    const elements = {
        fileInput: document.getElementById(config.fileInputId),
        uploadBox: document.getElementById(config.uploadBoxId),
        imagePreview: document.getElementById(config.imagePreviewId),
        previewImg: document.getElementById(config.previewImgId),
        removeBtn: document.getElementById(config.removeBtnId)
    };

    let state = {
        selectedFile: null,
        hasExistingImage: false
    };

    initializeExistingImage(elements, state);
    setupFileInputHandlers(elements, state);
    setupDragAndDropHandlers(elements, state);
}

function initializeExistingImage(elements, state) {
    const existingImg = elements.uploadBox.querySelector('img');
    if (!existingImg) { return; }

    state.hasExistingImage = true;
    elements.previewImg.src = existingImg.src;
    existingImg.remove();
    elements.uploadBox.querySelector('i')?.remove();
    toggleImageDisplay(elements, true);
}

function setupFileInputHandlers(elements, state) {
    elements.fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) { displayImagePreview(file, elements, state); }
    });

    elements.removeBtn.addEventListener('click', () => {
        clearImagePreview(elements, state);
    });
}

function setupDragAndDropHandlers(elements, state) {
    const { uploadBox, fileInput } = elements;

    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.add(CSS_CLASSES.dragOver);
    });

    uploadBox.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.remove(CSS_CLASSES.dragOver);
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.remove(CSS_CLASSES.dragOver);

        const file = e.dataTransfer.files[0];
        if (!file) { return; }

        if (file.type.match('image.*')) {
            displayImagePreview(file, elements, state);
            syncFileInput(fileInput, file);
        } else {
            alert('Please drop an image file');
        }
    });
}

function displayImagePreview(file, elements, state) {
    state.selectedFile = file;
    state.hasExistingImage = false;

    const reader = new FileReader();
    reader.onload = (e) => {
        elements.previewImg.src = e.target.result;
        toggleImageDisplay(elements, true);
    };
    reader.readAsDataURL(file);
}

function clearImagePreview(elements, state) {
    state.selectedFile = null;
    elements.fileInput.value = '';
    elements.previewImg.src = '';
    toggleImageDisplay(elements, false);

    if (state.hasExistingImage) {
        restoreUploadIcon(elements.uploadBox);
        state.hasExistingImage = false;
    }
}

function toggleImageDisplay(elements, showPreview) {
    elements.imagePreview.style.display = showPreview ? 'block' : 'none';
    elements.uploadBox.style.display = showPreview ? 'none' : 'flex';
}

function syncFileInput(fileInput, file) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
}

function restoreUploadIcon(uploadBox) {
    if (!uploadBox.querySelector('i')) {
        const icon = document.createElement('i');
        icon.className = 'bi bi-upload';
        uploadBox.appendChild(icon);
    }
}

// Form submission helpers
async function submitForm(event, clientValidationFn, serverErrorDisplayFn) {
    event.preventDefault();
    const form = event.target;

    if (!clientValidationFn(form)) return;

    const formElements = {
        submitButton: form.querySelector('button[type="submit"]'),
        loadingSpinner: document.getElementById('loadingSpinner')
    };

    toggleLoadingState(formElements, true);

    try {
        const result = await submitFormData(form);
        toggleLoadingState(formElements, false);
        handleFormResponse(result, serverErrorDisplayFn);
    } catch (error) {
        toggleLoadingState(formElements, false);
        showStatusModal('error', 'Network Error', 'Failed to connect.');
    }
}

function handleFormResponse(result, serverErrorDisplayFn) {
    if (result.valid) {
        showStatusModal(
            'success',
            'Success!',
            result.message,
            result.redirect,
            'bi-eye-fill',
            `View ${result.title}`
        );
    } else if (hasValidationErrors(result)) {
        serverErrorDisplayFn(result.errors);
    } else {
        showStatusModal('error', 'Error', result.message);
    }
}

function toggleLoadingState(elements, isLoading) {
    elements.submitButton.style.display = isLoading ? 'none' : 'block';
    elements.loadingSpinner.style.display = isLoading ? 'block' : 'none';
}

async function submitFormData(form) {
    const response = await fetch(form.getAttribute('action'), {
        method: 'POST',
        body: new FormData(form)
    });
    return response.json();
}

function hasValidationErrors(result) {
    return result.errors && Array.isArray(result.errors) && result.errors.length > 0;
}

// Validation helpers
function clearValidationState(form) {
    form.querySelectorAll('.form-control, .form-select').forEach(field => {
        field.classList.remove(CSS_CLASSES.valid, CSS_CLASSES.invalid);
    });
    form.querySelectorAll(`.${CSS_CLASSES.invalidFeedback}`).forEach(feedback => {
        feedback.textContent = '';
    });
}

function markFieldValid(field) {
    field.classList.add(CSS_CLASSES.valid);

    // Show character counter again if this is a textarea
    if (field.tagName === 'TEXTAREA') {
        const charCounter = document.getElementById('charCount');
        if (charCounter) {
            charCounter.style.display = 'block';
        }
        const feedbackElement = findFeedbackElement(field);
        if (feedbackElement) {
            feedbackElement.style.display = 'none';
        }
    }

    return true;
}

function showFieldError(field, message) {
    field.classList.add(CSS_CLASSES.invalid);
    const feedbackElement = findFeedbackElement(field);

    if (feedbackElement) {
        feedbackElement.textContent = message;
        feedbackElement.style.display = 'block';

        // Hide character counter if this is a textarea
        if (field.tagName === 'TEXTAREA') {
            const charCounter = document.getElementById('charCount');
            if (charCounter) {
                charCounter.style.display = 'none';
            }
        }
    } else {
        console.warn('Invalid feedback element not found for field:', field.id);
    }

    return false;
}

function findFeedbackElement(field) {
    let element = field.nextElementSibling;
    while (element) {
        if (element.classList?.contains(CSS_CLASSES.invalidFeedback)) {
            return element;
        }
        element = element.nextElementSibling;
    }
    return null;
}

function markFieldsByErrorState(fields, errorFieldIds) {
    fields.forEach(field => {
        const cssClass = errorFieldIds.has(field.id) ? CSS_CLASSES.invalid : CSS_CLASSES.valid;
        field.classList.add(cssClass);
    });
}

function displayErrorMessages(errors, fieldPrefix) {
    errors.forEach(error => {
        const field = document.getElementById(`${fieldPrefix}${capitalizeFirstLetter(error.field)}`);
        if (!field) return;

        const feedbackElement = findFeedbackElement(field);
        if (feedbackElement) {
            feedbackElement.textContent = error.message;
        }
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Validation utilities
function validateCapitalizedString(field, fieldName, maxLength) {
    if (!field.value.trim()) {
        return showFieldError(field, `Please provide ${fieldName}.`);
    }
    if (!/^[A-Z]/.test(field.value)) {
        return showFieldError(field, `${fieldName} must start with a capital letter.`);
    }
    if (field.value.length > maxLength) {
        return showFieldError(field, `${fieldName} cannot exceed ${maxLength} characters.`);
    }
    return markFieldValid(field);
}

function validateSelect(field, message) {
    if (!field.value) {
        return showFieldError(field, message);
    }
    return markFieldValid(field);
}

function validateMultiSelect(field, message) {
    if (!field.selectedOptions.length) {
        return showFieldError(field, message);
    }
    return markFieldValid(field);
}

function validateDateRange(field, message, minDate, maxDate, errorMessage) {
    if (!field.value) {
        return showFieldError(field, message);
    }

    const date = new Date(field.value);
    const min = new Date(minDate);
    const max = new Date(maxDate);

    if (date < min || date > max) {
        return showFieldError(field, errorMessage);
    }
    return markFieldValid(field);
}

function validateTextLength(field, message, minLength, maxLength) {
    const length = field.value.trim().length;

    if (!field.value.trim()) {
        return showFieldError(field, message);
    }
    if (length < minLength) {
        return showFieldError(field, `${message.split('.')[0]} must be at least ${minLength} characters (currently ${length}).`);
    }
    if (length > maxLength) {
        return showFieldError(field, `${message.split('.')[0]} cannot exceed ${maxLength} characters (currently ${length}).`);
    }
    return markFieldValid(field);
}

// Export public API
window.utils = {
    // Delete operations
    setupDeleteButton,

    // Character counter
    createCharacterCounter,

    // Image upload
    createImageUploader,

    // Form submission
    submitForm,

    // Validation
    clearValidationState,
    markFieldValid,
    showFieldError,
    markFieldsByErrorState,
    displayErrorMessages,
    capitalizeFirstLetter,

    // Validation utilities
    validateCapitalizedString,
    validateSelect,
    validateMultiSelect,
    validateDateRange,
    validateTextLength,

    // Constants
    CSS_CLASSES
};