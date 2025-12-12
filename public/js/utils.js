(function() {
    // API request for DELETE operations
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

    // Setup delete button functionality
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

    window.utils = {
        setupDeleteButton: setupDeleteButton
    };

})();