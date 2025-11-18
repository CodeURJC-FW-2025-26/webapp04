// Initialize delete button functionality
window.utils.setupDeleteButton('deleteMovieButton', 'movie');

// Setup actor delete buttons (deletion from movie context)
const movieSlug = window.location.pathname.split('/')[2];
document.querySelectorAll('.delete-actor-button').forEach((button) => {
    button.addEventListener('click', async (e) => {
        const actorSlug = e.currentTarget.dataset.slug;
        
        if (!actorSlug) {
            console.error('No actor slug found for delete operation');
            return;
        }

        try {
            const response = await fetch(`/api/movie/${movieSlug}/actor/${actorSlug}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            window.location.href = data.redirectUrl || `/movie/${movieSlug}`;
        } catch (error) {
            console.error('Delete actor error:', error);
            window.location.href = `/error?type=deleteError&entity=actor`;
        }
    });
});