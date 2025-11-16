const deletePersonButton = document.getElementById('deletePersonButton');

deletePersonButton.addEventListener('click', async (e) => {
    const slug = e.currentTarget.dataset.slug;

    try {
        const response = await fetch(`/api/person/${slug}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            window.location.href = data.redirectUrl;
        } else if (data.redirectUrl) {
            window.location.href = data.redirectUrl;
        }
    } catch (error) {
        console.error('Error deleting actor:', error);
        window.location.href = '/error?type=deleteError&entity=person';
    }
});