function showConfirmationModal(title, message, onConfirm = null, onCancel = null) {
    const modalElement = document.getElementById('confirmationModal');

    if (!modalElement) {
        console.error('Modal element not found');
        return;
    }

    const modalHeader = modalElement.querySelector('.modal-header');
    const modalFooter = modalElement.querySelector('.modal-footer');
    const modalTitle = modalElement.querySelector('.modal-title-text');
    const modalMessage = modalElement.querySelector('.modal-message');
    const modalCancelButton = modalElement.querySelector('#modal-cancel-btn');
    const modalConfirmButton = modalElement.querySelector('#modal-confirm-btn');
    const modalLoading = modalElement.querySelector('.modal-loading');

    // Reset modal state
    modalHeader.style.display = 'block';
    modalLoading.style.display = 'none';
    modalFooter.style.display = 'block';

    // Set title and message text
    modalTitle.textContent = title;
    modalMessage.textContent = message;

    // Set button actions
    modalConfirmButton.addEventListener('click', async () => {
        // Show loading state
        modalHeader.style.display = 'none';
        modalMessage.textContent = '';
        modalLoading.style.display = 'block';
        modalFooter.style.display = 'none';

        // If function given, execute on click
        if (onConfirm) { await onConfirm(); }

        // Hide the modal
        let modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
    }, { once: true }); // Automatically removed the event listener after the first invocation

    modalCancelButton.addEventListener('click', () => {
        // If function given, execute on click
        if (onCancel) { onCancel(); }

        // Hide the modal
        let modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
    }, { once: true }); // Automatically removed the event listener after the first invocation

    // Get or create Bootstrap Modal instance
    let modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (!modalInstance) {
        modalInstance = new bootstrap.Modal(modalElement);
    }
    
    modalInstance.show();
}