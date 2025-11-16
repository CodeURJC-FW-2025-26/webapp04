document.addEventListener('DOMContentLoaded', () => {
    const actorSearch = document.getElementById('actor-search');
    const actorDropdown = document.getElementById('actorDropdown');
    const selectedActorsList = document.getElementById('selectedActorsList');

    let searchTimeout;
    const selectedActors = new Set();

    // Load existing actors
    document.querySelectorAll('.actor-item').forEach(item => {
        selectedActors.add(item.dataset.actorId);
    });

    // === AUTOCOMPLETE SEARCH ===
    actorSearch.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();

        if (query.length < 2) {
            hideDropdown();
            return;
        }

        // Debounce search
        searchTimeout = setTimeout(() => searchActors(query), 300);
    });

    async function searchActors(query) {
        try {
            const response = await fetch(`/api/actors/search?q=${encodeURIComponent(query)}`);
            const actors = await response.json();
            showDropdown(actors);
        } catch (error) {
            console.error('Search error:', error);
            showDropdown([]);
        }
    }

    function showDropdown(actors) {
        actorDropdown.innerHTML = '';

        if (actors.length === 0) {
            actorDropdown.innerHTML = '<div class="actor-dropdown-empty">No actors found</div>';
            actorDropdown.classList.add('show');
            return;
        }

        actors.forEach(actor => {
            // Skip already selected
            if (selectedActors.has(actor._id.toString())) return;

            const item = document.createElement('div');
            item.className = 'actor-dropdown-item';
            item.textContent = actor.name;
            item.dataset.actorId = actor._id;
            item.dataset.actorName = actor.name;

            item.addEventListener('click', () => {
                addActorToMovie(actor);
                hideDropdown();
                actorSearch.value = '';
            });

            actorDropdown.appendChild(item);
        });

        actorDropdown.classList.add('show');
    }

    function hideDropdown() {
        actorDropdown.classList.remove('show');
        actorDropdown.innerHTML = '';
    }

    function addActorToMovie(actor) {
        const actorId = actor._id.toString();
        if (selectedActors.has(actorId)) return;

        selectedActors.add(actorId);

        const actorItem = document.createElement('div');
        actorItem.className = 'actor-item';
        actorItem.dataset.actorId = actorId;
        actorItem.innerHTML = `
            <span class="actor-name">${actor.name}</span>
            <input type="text" class="actor-role-input" placeholder="Role in this movie" name="actorRole[]" >
            <input type="hidden" name="actorId[]" value="${actorId}">
            <button type="button" class="remove-actor-btn">×</button>
        `;

        // Remove handler
        actorItem.querySelector('.remove-actor-btn').addEventListener('click', () => {
            selectedActors.delete(actorId);
            actorItem.remove();
        });

        selectedActorsList.appendChild(actorItem);
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!actorSearch.contains(e.target) && !actorDropdown.contains(e.target)) {
            hideDropdown();
        }
    });

    // Handle existing remove buttons
    document.querySelectorAll('.remove-actor-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const actorItem = e.target.closest('.actor-item');
            selectedActors.delete(actorItem.dataset.actorId);
            actorItem.remove();
        });
    });
});