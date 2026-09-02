import { getStoredToken, apiClient } from './apiClient';

const API_BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL as string) || 'http://localhost:3001';

export interface UploadedImage {
  url: string;
  fileId: string;
}

export type UploadFolderType = 'listings' | 'providers' | 'adverts';

export async function uploadImage(
  file: File,
  folderType: UploadFolderType,
  entityId?: string,
  onProgress?: (percent: number) => void
): Promise<UploadedImage> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folderType', folderType);
  if (entityId) formData.append('entityId', entityId);

  const token = getStoredToken();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}/api/uploads/image`);

    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = body.data || body;
          resolve({ url: data.url, fileId: data.fileId });
        } else {
          reject(new Error(body.message || `Upload failed (${xhr.status})`));
        }
      } catch {
        reject(new Error('Invalid upload response'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });
}

export async function deleteUploadedImage(fileId: string): Promise<boolean> {
  if (!fileId) return true;
  try {
    await apiClient.delete(`/api/uploads/image/${fileId}`);
    return true;
  } catch (err) {
    console.warn(`Failed to delete ImageKit file ${fileId}:`, err);
    return false;
  }
}
