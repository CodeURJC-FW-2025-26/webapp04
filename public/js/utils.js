(function() {
    // API request for DELETE operations
    async function performDelete(endpoint, errorEntity) {
        try {
            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Delete error:', error);
            window.location.href = `/error?type=deleteError&entity=${errorEntity}`;
            throw error;
        }
    }

    // Setup delete button functionality
    function setupDeleteButton(buttonId, entityType) {
        const deleteButton = document.getElementById(buttonId);
        
        if (!deleteButton) {
            console.warn(`Delete button with ID '${buttonId}' not found`);
            return;
        }

        deleteButton.addEventListener('click', async (e) => {
            const slug = e.currentTarget.dataset.slug;
            
            if (!slug) {
                console.error('No slug found for delete operation');
                return;
            }

            const endpoint = `/api/${entityType}/${slug}`;
            
            try {
                const data = await performDelete(endpoint, entityType);

                if (data.redirectUrl) {
                    window.location.href = data.redirectUrl;
                } else {
                    window.location.href = '/';
                }
            } catch (error) {
                console.error('Delete operation failed:', error);
            }
        });
    }

    window.utils = {
        setupDeleteButton: setupDeleteButton
    };

})();