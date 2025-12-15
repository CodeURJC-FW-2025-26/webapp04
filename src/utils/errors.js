export class ValidationError extends Error {
    constructor(type, details = {}) {
        super(`Validation failed: ${type}`);
        this.name = 'ValidationError';
        this.type = type;
        this.details = details;
    }
}

export class NotFoundError extends Error {
    constructor(entity) {
        super(`${entity} not found`);
        this.name = 'NotFoundError';
        this.entity = entity;
    }
}

export class DuplicateError extends Error {
    constructor(entity, field, value) {
        super(`${entity} already exists with ${field}: ${value}`);
        this.name = 'DuplicateError';
        this.entity = entity;
        this.field = field;
        this.value = value;
    }
}