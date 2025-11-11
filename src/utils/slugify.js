export function createMovieSlug(title, year) {
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

    return `${slug}_${year}`;
}

export function createActorSlug(name) {
    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

    return slug;
}

export function parseMovieSlug(slug) {
    const lastUnderscoreIndex = slug.lastIndexOf('_');
    if (lastUnderscoreIndex === -1) {
        return null;
    }

    const title = slug.substring(0, lastUnderscoreIndex);
    const year = slug.substring(lastUnderscoreIndex + 1);

    return { title, year };
}