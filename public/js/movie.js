const deleteMovieButton = document.getElementById('deleteMovieButton');

deleteMovieButton.addEventListener('click', async (e) => {
    const slug = e.currentTarget.dataset.slug;

    try {
        const response = await fetch(`/api/movie/${slug}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            window.location.href = '/'; // TODO: Instead redirect to intermediate page
        } else {
            alert('Failed to delete movie: ' + data.error);
        }
    } catch (error) {
        console.error('Error deleting movie:', error);
    }
});