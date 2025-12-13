document.addEventListener('DOMContentLoaded', () => {
    const actorSearch = document.getElementById('actor-search');
    const actorDropdown = document.getElementById('actorDropdown');
    const selectedActorsList = document.getElementById('selectedActorsList');

    let searchTimeout;
    // Use a Set to keep track of selected actor IDs quickly and avoid duplicates.
    // Storing IDs as strings ensures consistent comparisons with dataset values.
    const selectedActors = new Set();

    // Load existing actors from the DOM (e.g. when editing a movie that already has actors).
    // The DOM may already contain .actor-item elements with data-actor-id set.
    document.querySelectorAll('.actor-item').forEach(item => {
        selectedActors.add(item.dataset.actorId);
    });

    // Autocomplete search input: wait 300ms after the last keystroke
    // to avoid too many network requests while the user types.
    actorSearch.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        // Minimal query length to reduce noise and unnecessary requests.
        if (query.length < 2) {
            hideDropdown();
            return;
        }
        searchTimeout = setTimeout(() => searchActors(query), 300);
    });

    // Query the server for matching actors. Uses encodeURIComponent to safely include
    // the query in the URL. Network errors are caught and handled.
    async function searchActors(query) {
        try {
            const res = await fetch(`/api/actors/search?q=${encodeURIComponent(query)}`);
            const actors = await res.json();
            showDropdown(actors);
        } catch (err) {
            console.error('Search error:', err);
            // On error show an empty dropdown (or a "No actors found" message).
            showDropdown([]);
        }
    }

    function showDropdown(actors) {
        actorDropdown.innerHTML = '';
        if (actors.length === 0) {
            actorDropdown.innerHTML = '<div class="actor-dropdown-item">No actors found</div>';
            actorDropdown.classList.add('show');
            return;
        }

        actors.forEach(actor => {
            // Skip actors already selected to avoid duplicates in the UI.
            if (selectedActors.has(actor._id.toString())) return;

            const item = document.createElement('div');
            item.className = 'actor-dropdown-item';
            item.textContent = actor.name;
            // Store id and name as dataset attributes for later use when the user clicks.
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
        // Protect against race conditions / double clicks by checking the Set again.
        if (selectedActors.has(actorId)) return;

        selectedActors.add(actorId);

        const actorItem = document.createElement('div');
        actorItem.className = 'actor-item';
        actorItem.dataset.actorId = actorId;
        // Construct the innerHTML for the selected actor entry.
        actorItem.innerHTML = `
            <div class="actor-header">
                <a href="/person/${actor.slug || ''}">
                    <img class="actorIconSmall" 
                         src="${actor.portrait ? '/actor/portraits/' + actor.portrait : '/img/actorPortraits/placeholder.jpg'}" 
                         alt="${actor.name}">
                </a>
                <a href="/person/${actor.slug || ''}" class="actor-name">${actor.name}</a>
                <button type="button" class="btn actor-remove-btn"><i class="bi bi-trash3-fill"></i></button>
            </div>
            <div class="actor-role-row">
                <span class="actor-role-label">as</span>
                <input type="text" class="actor-role-input" placeholder="Role" name="actorRole[]" required>
                <input type="hidden" name="actorId[]" value="${actorId}">
            </div>
        `;

        // Remove button removes the item from both the DOM and the selectedActors Set.
        actorItem.querySelector('.actor-remove-btn').addEventListener('click', () => {
            selectedActors.delete(actorId);
            actorItem.remove();
        });

        selectedActorsList.appendChild(actorItem);
    }

    // Close the dropdown when clicking outside the search input or dropdown.
    // Using contains() allows clicks inside child elements to be ignored.
    document.addEventListener('click', (e) => {
        if (!actorSearch.contains(e.target) && !actorDropdown.contains(e.target)) {
            hideDropdown();
        }
    });

    // Attach remove handlers to any pre-existing actor items (e.g. loaded server-side).
    // Uses event.target.closest to handle clicks on the icon within the button.
    document.querySelectorAll('.actor-item .actor-remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const actorItem = e.target.closest('.actor-item');
            selectedActors.delete(actorItem.dataset.actorId);
            actorItem.remove();
        });
    });
});