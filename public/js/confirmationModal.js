function showConfirmationModal(title, message, onConfirm, onCancel = null) {
    const modalElement = document.getElementById('confirmationModal');

    if (!modalElement) {
        console.error('Modal element not found');
        return;
    }

    const modalTitle = modalElement.querySelector('.modal-title-text');
    const modalMessage = modalElement.querySelector('.modal-message');
    const modalCancelButton = modalElement.querySelector('#modal-cancel-btn');
    const modalConfirmButton = modalElement.querySelector('#modal-confirm-btn');

    // Set title and message text
    modalTitle.textContent = title;
    modalMessage.textContent = message;

    // Set button actions
    modalConfirmButton.addEventListener('click', () => {
        if (onConfirm) { onConfirm(); }
        let modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
    }, { once: true });

    modalCancelButton.addEventListener('click', () => {
        if (onCancel) { onCancel(); }
        let modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
    }, { once: true });

    // Get or create Bootstrap Modal instance
    let modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (!modalInstance) {
        modalInstance = new bootstrap.Modal(modalElement);
    }
    
    modalInstance.show();
}