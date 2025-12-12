addCharacterCounter();
addDragAndDropSupport();

// Character counter with visual feedback (green/red based on min/max constraints)
function addCharacterCounter() {
    const descriptionTextarea = document.getElementById('actorDescription');
    const charCountDisplay = document.getElementById('charCount');

    if (!(descriptionTextarea && charCountDisplay)) { return; }

    descriptionTextarea.addEventListener('input', () => {
        const length = descriptionTextarea.value.length;
        const max = 1000;
        const min = 50;

        charCountDisplay.textContent = `${length} / ${max} characters`;

        // Apply success/danger styling based on length
        charCountDisplay.classList.remove('text-muted');
        if (length >= min && length <= max) {
            charCountDisplay.classList.remove('text-danger');
            charCountDisplay.classList.add('text-success');
        } else {
            charCountDisplay.classList.remove('text-success');
            charCountDisplay.classList.add('text-danger');
        }
    });
    // Trigger initial count
    descriptionTextarea.dispatchEvent(new Event('input'));
}

// Image upload with drag & drop support
function addDragAndDropSupport() {
    const fileInput = document.getElementById('actorPortrait');
    const uploadBox = document.getElementById('uploadBox');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const removeBtn = document.getElementById('removeImage');

    let selectedFile = null;
    let hasExistingPortrait = false;

    // Initialize preview with existing portrait if present (edit mode)
    const existingPortraitImg = uploadBox.querySelector('img');
    if (existingPortraitImg) {
        hasExistingPortrait = true;
        previewImg.src = existingPortraitImg.src;
        existingPortraitImg.remove();
        uploadBox.querySelector('i')?.remove();
        uploadBox.style.display = 'none';
        imagePreview.style.display = 'block';
    }

    // Handle file selection from file picker
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    });

    removeBtn.addEventListener('click', () => {
        clearImage();
    });

    // Drag & drop: visual feedback and prevent browser default behavior
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.add('drag-over');
    });

    uploadBox.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.remove('drag-over');
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.match('image.*')) {
                handleFileSelect(file);
                // Sync dropped file with file input for form submission
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files;
            } else {
                alert('Please drop an image file');
            }
        }
    });

    // Display preview using FileReader (no server upload until form submit)
    function handleFileSelect(file) {
        selectedFile = file;
        hasExistingPortrait = false;

        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            uploadBox.style.display = 'none';
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    // Clear preview and reset to initial state
    function clearImage() {
        selectedFile = null;
        fileInput.value = '';
        previewImg.src = '';
        imagePreview.style.display = 'none';
        uploadBox.style.display = 'flex';

        // Restore upload icon if there was an existing portrait
        if (hasExistingPortrait) {
            if (!uploadBox.querySelector('i')) {
                const icon = document.createElement('i');
                icon.className = 'bi bi-upload';
                uploadBox.appendChild(icon);
            }
            hasExistingPortrait = false;
        }
    }
}

//TODO create universal sumitAJAXForm mehtod to reduce code duplicate
async function submitActorForm(event){
    event.preventDefault();
    const form = event.target;

    // Client-side validation
    if (!displayClientErrors(form)) {
        return; // Stop if client validation fails
    }

    const actionURL = form.getAttribute('action');
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const loadingSpinner = document.getElementById('loadingSpinner');

    const setLoading = (show) => {
        submitButton.style.display = show ? 'none' : 'block';
        loadingSpinner.style.display = show ? 'block' : 'none';
    };

    setLoading(true);

    try {
        const response = await fetch(actionURL, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        setLoading(false);

        if (result.valid) {
            showStatusModal(
                'success',
                'Success!',
                result.message,
                result.redirect,
                'bi-eye-fill',
                `View ${result.title}`
            );
        } else {
            if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
                displayServerErrors(result.errors);
                return;
            }
            showStatusModal('error', 'Error', result.message);
        }
    } catch (error) {
        setLoading(false);
        showStatusModal('error', 'Network Error', 'Failed to connect.');
    }
}

function displayClientErrors(form) {
    let hasErrors = false;

    // Clear all previous validation states and error messages
    form.querySelectorAll('.form-control, .form-select').forEach(field => {
        field.classList.remove('is-valid', 'is-invalid');
    });

    // Clear all error messages
    form.querySelectorAll('.invalid-feedback').forEach(feedback => {
        feedback.textContent = '';
    });

    // Validate Name
    const name = form.querySelector('#actorName');
    if (!name.value.trim()) {
        showFieldError(name, 'Please provide the actor\'s name');
        hasErrors = true;
    } else if (!/^[A-Z]/.test(name.value)) {
        showFieldError(name, 'Name must start with a capital letter.');
        hasErrors = true;
    } else if (name.value.length > 200) {
        showFieldError(name, 'Name cannot exceed 200 characters.');
        hasErrors = true;
    } else {
        name.classList.add('is-valid');
    }

    // Validate Birthday
    const birthday = form.querySelector('#actorBirthDate');
    if (!birthday.value) {
        showFieldError(birthday, 'Please provide a birthday.');
        hasErrors = true;
    } else {
        const date = new Date(birthday.value);
        const minDate = new Date('1900-01-01');
        const maxDate = new Date('2026-12-31');
        if (date < minDate || date > maxDate) {
            showFieldError(birthday, 'Birthday must be between 1900 and 2026.');
            hasErrors = true;
        } else {
            birthday.classList.add('is-valid');
        }
    }

    // Validate Place of Birth
    const placeOfBirth = form.querySelector('#actorBirthPlace');
    if (!placeOfBirth.value.trim()) {
        showFieldError(placeOfBirth, 'Please provide a place of birth');
        hasErrors = true;
    } else if (placeOfBirth.value.length > 200) {
        showFieldError(placeOfBirth, 'Place of birth cannot exceed 200 characters.');
        hasErrors = true;
    } else {
        placeOfBirth.classList.add('is-valid');
    }

    // Validate Description
    const description = form.querySelector('#actorDescription');
    const descLength = description.value.trim().length;
    if (!description.value.trim()) {
        showFieldError(description, 'Please provide a description.');
        hasErrors = true;
    } else if (descLength < 50) {
        showFieldError(description, `Description must be at least 50 characters (currently ${descLength}).`);
        hasErrors = true;
    } else if (descLength > 1000) {
        showFieldError(description, `Description cannot exceed 1000 characters (currently ${descLength}).`);
        hasErrors = true;
    } else {
        description.classList.add('is-valid');
    }

    // Validate Role
    const role = form.querySelector('#actorRole');
    if (role) {
        if (!role.value.trim()) {
            showFieldError(role, 'Please provide a role.');
            hasErrors = true;
        } else {
            role.classList.add('is-valid');
        }
    }

    return !hasErrors;
}

function showFieldError(field, message) {
    field.classList.add('is-invalid');

    // Find the next .invalid-feedback sibling, skipping other elements like <small>
    let feedbackElement = field.nextElementSibling;
    while (feedbackElement) {
        if (feedbackElement.classList && feedbackElement.classList.contains('invalid-feedback')) {
            feedbackElement.textContent = message;
            return;
        }
        feedbackElement = feedbackElement.nextElementSibling;
    }

    console.warn('Invalid feedback element not found for field:', field.id);
}

function displayServerErrors(errors) {
// Remove was-validated to prevent showing all HTML errors
    const form = document.querySelector('form');
    form.classList.remove('was-validated');

    // Clear previous server errors and valid states
    document.querySelectorAll('.is-invalid, .is-valid').forEach((formElement) => {
        formElement.classList.remove('is-invalid', 'is-valid');
    });

    // Get all form fields
    const allFields = form.querySelectorAll('.form-control, .form-select');
    const errorFields = new Set(errors.map(e => `actor${capitalizeFirstLetter(e.field)}`));

    // Mark all fields as valid first, then mark error fields as invalid
    allFields.forEach(field => {
        if (errorFields.has(field.id)) {
            field.classList.add('is-invalid');
        } else {
            field.classList.add('is-valid');
        }
    });

    // Update error messages
    errors.forEach((error) => {
        const field = document.getElementById(`actor${capitalizeFirstLetter(error.field)}`);
        if (!field) { return; }

        let feedbackElement = field.nextElementSibling;
        while (feedbackElement && !feedbackElement.classList.contains('invalid-feedback')) {
            feedbackElement = feedbackElement.nextElementSibling;
        }

        if (feedbackElement) {
            feedbackElement.textContent = error.message;
        }
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}