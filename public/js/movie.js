const movieSlug = window.location.pathname.split('/')[2];

// Setup actor delete buttons (deletion from movie context)
async function handleActorDelete(e) {
	const actorName = e.currentTarget.dataset.actor;
    const movieTitle = document.getElementById('movieTitle').innerText;
    const actorSlug = e.currentTarget.dataset.slug;

	if (!actorSlug) {
		console.error('No actor slug found for delete operation');
		return;
	}

	showConfirmationModal(
		'Are you sure?',
		`You are about to delete ${actorName} from ${movieTitle}. This action cannot be undone.`,
		async () => {
			// The following function is only called if the user confirms deletion
			try {
				const response = await fetch(`/api/movie/${movieSlug}/actor/${actorSlug}`, {
					method: 'DELETE',
					headers: { 'Content-Type': 'application/json' }
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const data = await response.json();

				if (data.success) {
					await reloadActorsSection();
					showStatusModal('success', data.title, data.message);
				}
			} catch (error) {
				showStatusModal('error', 'Error', 'Failed to remove actor.');
			}
		}
	);
}

function attachActorDeleteListeners() {
	document.querySelectorAll('.delete-actor-button').forEach((button) => {
		button.addEventListener('click', handleActorDelete);
	});
}

async function reloadActorsSection() {
	try {
		const response = await fetch(`/movie/${movieSlug}/actors`);
		const html = await response.text();

		const actorSection = document.getElementById('actorSection');
		actorSection.innerHTML = html;

		attachActorDeleteListeners();
	} catch (error) {
		console.error('Failed to reload actors:', error);
	}
}

async function toggleActorForm(movieSlug) {
    const container = document.getElementById('actorFormContainer');

    if (container.style.display === 'block') {
        container.style.opacity = '0';
        container.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            container.style.display = 'none';
            container.innerHTML = '';
        }, 300);
        return;
    }

    // Load form via AJAX
    try {
        const response = await fetch(`/actor/add/from-movie/${movieSlug}`);
        if (!response.ok) throw new Error('No se pudo cargar el formulario');

        const html = await response.text();

        // Extract form from returned HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const form = doc.querySelector('form');

        if (!form) throw new Error('Formulario no encontrado');

        const title = document.createElement('h3');
        title.textContent = 'Add New Actor';
        title.className = 'mt-3 mb-4 text-center';

        container.innerHTML = '';
		container.appendChild(title);
        container.appendChild(form);
		form.classList.add('inline-mode');
        container.style.display = 'block';

        // Animation
        container.style.opacity = '0';
        container.style.transform = 'translateY(-20px)';
        container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

        setTimeout(() => {
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 10);

        // Reinitialize form functionalities
        utils.createCharacterCounter('actorDescription', 'charCount', 50, 1000);

        utils.createImageUploader({
            fileInputId: 'actorPortrait',
            uploadBoxId: 'uploadBox',
            imagePreviewId: 'imagePreview',
            previewImgId: 'previewImg',
            removeBtnId: 'removeImage'
        });

        form.addEventListener('submit', submitActorForm);

    } catch (error) {
        console.error('Error al cargar el formulario:', error);
        alert('No se pudo cargar el formulario de actor');
    }
}

async function toggleEditActorForm(actorSlug, movieSlug) {
    const container = document.getElementById('editActorFormContainer');

    // Cerrar si ya está abierto
    if (container.style.display === 'block') {
        container.style.opacity = '0';
        container.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            container.style.display = 'none';
            container.innerHTML = '';
        }, 300);
        return;
    }

    try {
        const response = await fetch(`/actor/${actorSlug}/edit/from-movie/${movieSlug}`);
        if (!response.ok) throw new Error('No se pudo cargar el formulario de edición');

        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const form = doc.querySelector('form');

        if (!form) throw new Error('Formulario no encontrado');

        const nameInput = form.querySelector('#actorName');
        const actorName = nameInput ? nameInput.value.trim() : 'Actor';

        const title = document.createElement('h3');
        title.textContent = `Edit ${actorName}`;
        title.className = 'mt-3 mb-4 text-center';

        container.innerHTML = '';
        container.appendChild(title);
        container.appendChild(form);
        form.classList.add('inline-mode');

        container.style.display = 'block';

        container.style.opacity = '0';
        container.style.transform = 'translateY(-20px)';
        container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

        setTimeout(() => {
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 10);

        utils.createCharacterCounter('actorDescription', 'charCount', 50, 1000);

        utils.createImageUploader({
            fileInputId: 'actorPortrait',
            uploadBoxId: 'uploadBox',
            imagePreviewId: 'imagePreview',
            previewImgId: 'previewImg',
            removeBtnId: 'removeImage'
        });

		 // If there's an existing image, set up the preview correctly
        const existingImg = form.querySelector('#uploadBox img');
        if (existingImg) {
            const previewImg = form.querySelector('#previewImg');
            const imagePreview = form.querySelector('#imagePreview');
            const uploadBox = form.querySelector('#uploadBox');
            if (previewImg && imagePreview && uploadBox) {
                previewImg.src = existingImg.src;
                imagePreview.style.display = 'block';
                uploadBox.style.display = 'none';
            }
        }

        form.addEventListener('submit', submitActorForm);

    } catch (error) {
        console.error('Error al cargar formulario de edición:', error);
        alert('No se pudo cargar el formulario');
    }
}

async function submitActorForm(event) {
    event.preventDefault();
    const form = event.target;

    // Clear previous validation states
    utils.clearValidationState(form);

    // Client-side validation
    const fields = {
        name: form.querySelector('#actorName'),
        birthDate: form.querySelector('#actorBirthDate'),
        placeOfBirth: form.querySelector('#actorBirthPlace'),
        description: form.querySelector('#actorDescription'),
        role: form.querySelector('#actorRole')
    };

    let isValid = true;

    isValid &= utils.validateCapitalizedString(fields.name, 'Name', 200);
    isValid &= utils.validateDateRange(fields.birthDate, 'Please provide a birthday.', '1900-01-01', '2026-12-31', 'Birthday must be between 1900 and 2026.');
    isValid &= utils.validateTextLength(fields.placeOfBirth, 'Please provide a place of birth.', 1, 200);
    isValid &= utils.validateTextLength(fields.description, 'Please provide a description.', 50, 1000);

    if (fields.role && !fields.role.value.trim()) {
        isValid &= utils.showFieldError(fields.role, 'Please provide a role.');
    } else if (fields.role) {
        utils.markFieldValid(fields.role);
    }

    if (!isValid) {
        return; 
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const spinner = form.querySelector('#loadingSpinner');

    submitButton.disabled = true;
    if (spinner) spinner.style.display = 'block';

    try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.valid) {
            showStatusModal('success', 'Success!', result.message || 'Actor created successfully');
            await reloadActorsSection();
            toggleActorForm(movieSlug);
        } else {
            showStatusModal('error', 'Error', 'Please correct the errors below.');

            // Show errors below input fields
            utils.clearValidationState(form);
            if (result.errors && Array.isArray(result.errors)) {
                result.errors.forEach(error => {
                    const fieldId = 'actor' + utils.capitalizeFirstLetter(error.field);
                    const field = form.querySelector('#' + fieldId);
                    if (field) {
                        utils.showFieldError(field, error.message);
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error:', error);
        showStatusModal('error', 'Error', 'No se pudo conectar con el servidor.');
    } finally {
        submitButton.disabled = false;
        if (spinner) spinner.style.display = 'none';
    }
}

// Initialize delete button functionality
window.utils.setupDeleteButton('deleteMovieButton', 'movie');
attachActorDeleteListeners();