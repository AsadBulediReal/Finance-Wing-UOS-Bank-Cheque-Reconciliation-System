import axios from 'axios';

// Create an Axios instance. The base URL defaults to /api which will be proxied by Vite.
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Cheques
  getCheques: (params?: { status?: string; search?: string; page?: number; limit?: number; [key: string]: any }) => 
    apiClient.get('/cheques', { params }).then(res => res.data),
  exportCheques: (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    window.location.href = `/api/cheques/export?${queryString}`;
  },
  getChequeById: (id: string) => apiClient.get(`/cheques/${id}`).then(res => res.data),
  addCheque: (data: any) => apiClient.post('/cheques', data).then(res => res.data),
  uploadCheques: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/cheques/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data);
  },

  // Statements
  getBankStatements: () => apiClient.get('/statements').then(res => res.data),
  uploadStatement: (file: File, metadata: any) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(metadata).forEach(key => formData.append(key, metadata[key]));
    return apiClient.post('/statements/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data);
  },
  getStatementTransactions: (id: string) => apiClient.get(`/statements/${id}/transactions`).then(res => res.data),
  getAllTransactions: (params?: { search?: string; dateFrom?: string; dateTo?: string; page?: number; limit?: number; [key: string]: any }) => 
    apiClient.get('/statements/transactions', { params }).then(res => res.data),

  // Reconciliation
  autoReconcile: () => apiClient.post('/reconciliation/auto').then(res => res.data),
  manualReconcile: (chequeId: string, transactionId: string) => apiClient.post('/reconciliation/manual', { chequeId, transactionId }).then(res => res.data),
  markUnchased: (chequeId: string) => apiClient.post('/reconciliation/mark-unchased', { chequeId }).then(res => res.data),
  getReconciliationDetails: (chequeId: string) => apiClient.get(`/reconciliation/details/${chequeId}`).then(res => res.data),
  getPotentialMatches: (chequeId: string) => apiClient.get(`/reconciliation/potential-matches/${chequeId}`).then(res => res.data),

  // Dashboard
  getDashboardSummary: () => apiClient.get('/dashboard/summary').then(res => res.data),

  // System
  checkHealth: () => apiClient.get('/health').then(res => res.data),
};
