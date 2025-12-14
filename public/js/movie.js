const movieSlug = window.location.pathname.split('/')[2];
const addActorButton = document.getElementById('addActor');
const editActors = document.getElementById('editActors');
let formIsOpen = false;

// - - - ACTOR DELETION - - -

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
        () => deleteActor(actorSlug)
	);
}

async function deleteActor(actorSlug) {
    try {
        const response = await fetch(`/api/movie/${movieSlug}/actor/${actorSlug}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            showStatusModal(
                'error',
                data.title || 'Error',
                data.message || 'Failed to remove actor.'
            );
            return;
        }

        await reloadActorsSection();
        showStatusModal('success', data.title, data.message);
    } catch (error) {
        console.error('Delete actor error:', error);
        showStatusModal('error', 'Network Error', 'Unable to connect to the server. Please check your connection.');
    }
}

// - - - LOADING THE ACTOR FORM - - -

async function handleAddActorForm() {
    // if form is already open, close it
    if (formIsOpen) {
        closeForm();
        return;
    }
    
    // Open the form
    try {
        await openForm(`/actor/add/in-movie/${movieSlug}`);
        initializePageFunctionality();
    } catch (error) {
        console.error('Load add actor form error:', error);
        showStatusModal('error', 'Network Error', 'Unable to load the form. Please check your connection.');
    }
}

async function handleActorEdit(button) {
    const actorSlug = button.dataset.slug;

    // Open the form
    try {
        await openForm(`/actor/edit/${actorSlug}/in-movie/${movieSlug}`);
        initializePageFunctionality();
    } catch (error) {
        console.error('Load edit actor form error:', error);
        showStatusModal('error', 'Network Error', 'Unable to load the form. Please check your connection.');
    }
}

// Form helper

async function openForm(url) {
    const response = await fetch(url);

    if (!response.ok) {
        const data = await response.json();
        showStatusModal('error', data.title || 'Error', data.message || data.error || 'Failed to load form.');
        return;
    }

    editActors.innerHTML = await response.text();
    editActors.classList.remove('notEditingActors');
    addActorButton.classList.add('rotated', 'btn-delete');

    formIsOpen = true;
}

function closeForm() {
    editActors.innerHTML = '';
    editActors.classList.add('notEditingActors');
    addActorButton.classList.remove('rotated', 'btn-delete');

    formIsOpen = false;
}

async function handleActorFormSuccess() {
    closeForm();
    await reloadActorsSection();
}

// - - - ATTACHING ACTOR LISTENERS - - -

function attachAddActorListener() {
    const addActorButton = document.getElementById('addActor');
    if (!addActorButton) { return; }
    addActorButton.addEventListener('click', handleAddActorForm);
}

function attachEditActorListener() {
    const editActorButtons = document.querySelectorAll('.edit-actor-button');
    editActorButtons.forEach(button => {
        button.addEventListener('click', () => handleActorEdit(button));
    });
}

function attachActorDeleteListeners() {
    const deleteActorButtons = document.querySelectorAll('.delete-actor-button');
    deleteActorButtons.forEach((button) => {
		button.addEventListener('click', handleActorDelete);
	});
}

// - - - LOADING ACTORS - - -

async function reloadActorsSection() {
	try {
		const response = await fetch(`/movie/${movieSlug}/actors`);
		const html = await response.text();

		const actorSection = document.getElementById('actorSection');
		actorSection.innerHTML = html;

        attachEditActorListener();
		attachActorDeleteListeners();
	} catch (error) {
		console.error('Failed to reload actors:', error);
	}
}

// - - - INITIALIZATION - - -

window.utils.setupDeleteButton('deleteMovieButton', 'movie');
attachAddActorListener();
attachEditActorListener();
attachActorDeleteListeners();