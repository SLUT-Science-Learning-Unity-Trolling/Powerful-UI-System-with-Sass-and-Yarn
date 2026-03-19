export function getAuthErrorMessage(error: unknown, fallback: string) {
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
            'detail' in responseData &&
            typeof responseData.detail === 'string'
        ) {
            return responseData.detail;
        }

        if (
            typeof responseData === 'object' &&
            responseData !== null &&
            'title' in responseData &&
            typeof responseData.title === 'string'
        ) {
            return responseData.title;
        }

        if (
            typeof responseData === 'object' &&
            responseData !== null &&
            'message' in responseData &&
            typeof responseData.message === 'string'
        ) {
            return responseData.message;
        }
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
}