import api from '@/lib/axios';

export type UploadFileResponse = {
  filename: string;
  url: string;
  mimeType: string;
  size: number;
};

/**
 * Upload a file to the server and return the file metadata.
 */
export async function uploadFile(formData: FormData, onProgress?: (progress: number) => void): Promise<UploadFileResponse> {
  const response = await api.post<UploadFileResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (event) => {
      if (event.total) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
  return response.data;
}
