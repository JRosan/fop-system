import { apiClient } from '../client';
import type { Document, DocumentType, VerifyDocumentRequest } from '@fop/types';

export const documentsApi = {
  async upload(
    applicationId: string,
    type: DocumentType,
    file: File,
    expiryDate?: string
  ): Promise<Document> {
    const formData = new FormData();
    formData.append('applicationId', applicationId);
    formData.append('type', type);
    formData.append('file', file);
    if (expiryDate) {
      formData.append('expiryDate', expiryDate);
    }

    const { data } = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  async verify(documentId: string, request: VerifyDocumentRequest): Promise<void> {
    await apiClient.post(`/documents/${documentId}/verify`, request);
  },

  async download(documentId: string): Promise<Blob> {
    const { data } = await apiClient.get(`/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return data;
  },

  getDownloadUrl(documentId: string): string {
    return `${apiClient.defaults.baseURL}/documents/${documentId}/download`;
  },
};
