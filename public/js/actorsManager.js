document.addEventListener('DOMContentLoaded', () => {
    const actorSearch = document.getElementById('actor-search');
    const actorDropdown = document.getElementById('actorDropdown');
    const selectedActorsList = document.getElementById('selectedActorsList');

    let searchTimeout;
    const selectedActors = new Set();

    //load existing actors
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
        searchTimeout = setTimeout(() => searchActors(query), 300);
    });

    async function searchActors(query) {
        try {
            const res = await fetch(`/api/actors/search?q=${encodeURIComponent(query)}`);
            const actors = await res.json();
            showDropdown(actors);
        } catch (err) {
            console.error('Search error:', err);
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
            <div class="actor-header">
                <a href="/person/${actor.slug || ''}">
                    <img class="personIconSmall" 
                         src="${actor.portrait ? '/img/persons/' + actor.portrait : '/img/persons/placeholder.jpg'}" 
                         alt="${actor.name}">
                </a>
                <a href="/person/${actor.slug || ''}" class="actor-name">${actor.name}</a>
                <button type="button" class="btn actor-remove-btn"><i class="bi bi-trash"></i></button>
            </div>
            <div class="actor-role-row">
                <span class="actor-role-label">as</span>
                <input type="text" class="actor-role-input" placeholder="Role" name="actorRole[]" required>
                <input type="hidden" name="actorId[]" value="${actorId}">
            </div>
        `;

        actorItem.querySelector('.actor-remove-btn').addEventListener('click', () => {
            selectedActors.delete(actorId);
            actorItem.remove();
        });

        selectedActorsList.appendChild(actorItem);
    }

    document.addEventListener('click', (e) => {
        if (!actorSearch.contains(e.target) && !actorDropdown.contains(e.target)) {
            hideDropdown();
        }
    });

    document.querySelectorAll('.actor-item .actor-remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const actorItem = e.target.closest('.actor-item');
            selectedActors.delete(actorItem.dataset.actorId);
            actorItem.remove();
        });
    });
});