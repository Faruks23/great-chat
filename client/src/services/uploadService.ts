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
export async function uploadFile(formData: FormData): Promise<UploadFileResponse> {
  const response = await api.post<UploadFileResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}
