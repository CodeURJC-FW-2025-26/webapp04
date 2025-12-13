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
    const formContainer = document.getElementById('actorFormContainer');
    
    if (formContainer.style.display === 'none' || formContainer.innerHTML === '') {
        try {
            // Load form page via AJAX
            const response = await fetch(`/actor/add/from-movie/${movieSlug}`);
            if (!response.ok) throw new Error('Failed to load form');
            
            const html = await response.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const form = doc.querySelector('form');
            
            if (!form) throw new Error('Form not found in response');
            
            formContainer.innerHTML = '';
            formContainer.appendChild(form);
            
            formContainer.style.display = 'block';
            formContainer.style.opacity = '0';
            formContainer.style.transform = 'translateY(-20px)';
            
            // Animation
            setTimeout(() => {
                formContainer.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                formContainer.style.opacity = '1';
                formContainer.style.transform = 'translateY(0)';
            }, 10);
            
            form.addEventListener('submit', submitActorForm);
            
            utils.createCharacterCounter(
                'actorDescription',
                'charCount',
                50,
                1000
            );
            utils.createImageUploader({
                fileInputId: 'actorPortrait',
                uploadBoxId: 'uploadBox',
                imagePreviewId: 'imagePreview',
                previewImgId: 'previewImg',
                removeBtnId: 'removeImage'
            });
        } catch (error) {
            console.error('Error loading actor form:', error);
            alert('Error al cargar el formulario');
        }
    } else {
        formContainer.style.opacity = '0';
        formContainer.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            formContainer.style.display = 'none';
            formContainer.innerHTML = '';
        }, 300);
    }
}

async function submitActorForm(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const spinner = form.querySelector('#loadingSpinner') || document.getElementById('loadingSpinner');
    
    submitButton.disabled = true;
    if (spinner) spinner.style.display = 'block';

    try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            // If successful, reload actors section and hide form
            await reloadActorsSection();
            toggleActorForm(movieSlug);
        } else {
            const errorData = await response.json();
            alert(errorData.error || 'Error al crear actor');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    } finally {
        submitButton.disabled = false;
        if (spinner) spinner.style.display = 'none';
    }
}

// Initialize delete button functionality
window.utils.setupDeleteButton('deleteMovieButton', 'movie');
attachActorDeleteListeners();