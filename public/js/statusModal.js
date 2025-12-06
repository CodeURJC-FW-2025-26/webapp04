function showModal(type, title, message, redirectUrl = null) {
    const modalElement = document.getElementById('staticBackdrop');

    if (!modalElement) {
        console.error('Modal element not found');
        return;
    }

    const modalTitle = modalElement.querySelector('.modal-title-text');
    const modalIcon = modalElement.querySelector('.modal-title-icon');
    const modalMessage = modalElement.querySelector('.modal-message');
    const modalRedirectButton = modalElement.querySelector('.modal-redirect-btn');
    const modalCloseButton = modalElement.querySelector('.modal-close-btn');
    const modalRedirectText = modalElement.querySelector('.modal-redirect-text');
    const modalRedirectIcon = modalElement.querySelector('.modal-redirect-icon');

    // Set title and message text
    modalTitle.textContent = title;
    modalMessage.textContent = message;

    // Set title icon and title icon color
    if (type === 'success') {
        modalIcon.className = 'modal-title-icon bi bi-check-circle-fill text-success';
    } else if (type === 'error') {
        modalIcon.className = 'modal-title-icon bi bi-x-circle-fill text-danger';
    }

    if (redirectUrl) {
        modalRedirectButton.href = redirectUrl;
        modalRedirectButton.style.display = 'block';
        modalCloseButton.style.display = 'none';
    } else {
        modalCloseButton.style.display = 'block';
        modalRedirectButton.style.display = 'none';
    }

    // Get or create Bootstrap Modal instance
    let modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (!modalInstance) {
        modalInstance = new bootstrap.Modal(modalElement);
    }
    
    modalInstance.show();
}