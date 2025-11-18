// Create a URL-friendly slug from a movie title and year
// Example: "The Matrix" (1999) -> "the-matrix_1999"
export function createMovieSlug(title, year) {
    const slug = title
        .toLowerCase()                  // convert to lowercase
        .replace(/[^a-z0-9\s-]/g, '')   // remove special characters
        .replace(/\s+/g, '-')           // replace spaces with hyphens
        .replace(/-+/g, '-')            // collapse multiple hyphens
        .trim();

    return `${slug}_${year}`;
}

// Create a URL-friendly slug from an actor name
// Example: "Leonardo DiCaprio" -> "leonardo-dicaprio"
export function createActorSlug(name) {    
    const slug = name
        .toLowerCase()                  // convert to lowercase
        .replace(/[^a-z0-9\s-]/g, '')   // remove special characters
        .replace(/\s+/g, '-')           // replace spaces with hyphens
        .replace(/-+/g, '-')            // collapse multiple hyphens
        .trim();

    return slug;
}

// Parse a movie slug back into its components
// Example: "the-matrix_1999" → { title: "the-matrix", year: "1999" }
// Returns null if slug format is invalid
export function parseMovieSlug(slug) {
    const lastUnderscoreIndex = slug.lastIndexOf('_');
    if (lastUnderscoreIndex === -1) {
        return null;
    }

    const title = slug.substring(0, lastUnderscoreIndex);
    const year = slug.substring(lastUnderscoreIndex + 1);

    return { title, year };
}