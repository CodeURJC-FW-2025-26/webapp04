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

// Initialize delete button functionality
window.utils.setupDeleteButton('deleteMovieButton', 'movie');
attachActorDeleteListeners();