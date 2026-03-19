import type { UploadItem } from '../types';

const ACCEPTED_IMAGE_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/heic',
    'image/heif',
];

const MAX_FILE_SIZE_MB = 20;

export function isImageFile(file: File) {
    return ACCEPTED_IMAGE_TYPES.includes(file.type);
}

export function validateFile(file: File) {
    if (!isImageFile(file)) {
        return 'Можно загружать только изображения: PNG, JPG, JPEG, WEBP, HEIC, HEIF.';
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        return `Файл слишком большой. Максимум — ${MAX_FILE_SIZE_MB} MB.`;
    }

    return null;
}

export function createUploadItem(file: File): UploadItem {
    return {
        id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        previewUrl: URL.createObjectURL(file),
    };
}

export function revokeUploadItems(items: UploadItem[]) {
    items.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
    });
}

export function moveItem<T>(items: T[], from: number, to: number) {
    const next = [...items];

    if (
        from < 0 ||
        to < 0 ||
        from >= next.length ||
        to >= next.length ||
        from === to
    ) {
        return next;
    }

    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);

    return next;
}

export function getErrorMessage(error: unknown) {
    if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof error.response === 'object' &&
        error.response !== null &&
        'data' in error.response
    ) {
        const responseData = error.response.data;

        if (
            typeof responseData === 'object' &&
            responseData !== null &&
            'message' in responseData &&
            typeof responseData.message === 'string'
        ) {
            return responseData.message;
        }

        if (
            typeof responseData === 'object' &&
            responseData !== null &&
            'detail' in responseData &&
            typeof responseData.detail === 'string'
        ) {
            return responseData.detail;
        }
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return 'Не удалось обработать файлы. Попробуй ещё раз.';
}

export function formatFileSize(bytes: number) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}