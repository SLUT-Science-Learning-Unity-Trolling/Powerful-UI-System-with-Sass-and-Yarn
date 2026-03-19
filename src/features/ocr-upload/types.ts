export type AppStage = 'idle' | 'preview' | 'processing' | 'pdf' | 'error';

export type UploadItem = {
    id: string;
    file: File;
    previewUrl: string;
};
