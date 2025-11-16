const descriptionTextarea = document.getElementById('movieDescription');
const charCountDisplay = document.getElementById('charCount');

if (descriptionTextarea && charCountDisplay) {
    descriptionTextarea.addEventListener('input', () => {
        const length = descriptionTextarea.value.length;
        const max = 1000;
        const min = 50;

        charCountDisplay.textContent = `${length} / ${max} characters`;

        charCountDisplay.classList.remove('text-muted');
        if (length >= min && length <= max) {
            charCountDisplay.classList.remove('text-danger');
            charCountDisplay.classList.add('text-success');
        } else {
            charCountDisplay.classList.remove('text-success');
            charCountDisplay.classList.add('text-danger');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('moviePoster');
    const uploadBox = document.getElementById('uploadBox');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const removeBtn = document.getElementById('removeImage');

    let selectedFile = null;
    let hasExistingPoster = false;

    // Check if there's already an existing poster (edit mode)
    const existingPosterImg = uploadBox.querySelector('img');
    if (existingPosterImg) {
        hasExistingPoster = true;
        // Move existing poster to preview area
        previewImg.src = existingPosterImg.src;
        existingPosterImg.remove(); // Remove from uploadBox
        uploadBox.querySelector('i')?.remove(); // Remove upload icon
        uploadBox.style.display = 'none';
        imagePreview.style.display = 'block';
    }

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    });

    removeBtn.addEventListener('click', () => {
        clearImage();
    });

    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.add('drag-over');
    });

    uploadBox.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.remove('drag-over');
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];

            if (file.type.match('image.*')) {
                handleFileSelect(file);

                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files;
            } else {
                alert('Please drop an image file');
            }
        }
    });

    function handleFileSelect(file) {
        selectedFile = file;
        hasExistingPoster = false; // User is uploading new file

        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            uploadBox.style.display = 'none';
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    function clearImage() {
        selectedFile = null;
        fileInput.value = '';
        previewImg.src = '';
        imagePreview.style.display = 'none';
        uploadBox.style.display = 'flex';

        // If there was an existing poster, show upload icon again
        if (hasExistingPoster) {
            // Re-create upload icon if needed
            if (!uploadBox.querySelector('i')) {
                const icon = document.createElement('i');
                icon.className = 'bi bi-upload';
                uploadBox.appendChild(icon);
            }
            hasExistingPoster = false;
        }
    }
});