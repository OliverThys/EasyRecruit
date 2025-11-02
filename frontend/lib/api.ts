const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
  };
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('token') 
    : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: { message: 'Une erreur est survenue' },
    }));
    throw new Error(error.error?.message || 'Erreur API');
  }

  return response.json();
}

export const api = {
  // Auth
  register: (email: string, password: string, organizationName: string) =>
    fetchApi('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, organizationName }),
    }),

  login: (email: string, password: string) =>
    fetchApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => fetchApi('/api/auth/me'),

  forgotPassword: (email: string) =>
    fetchApi('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    fetchApi('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),

  // Jobs
  getJobs: () => fetchApi('/api/jobs'),
  
  getJob: (id: string) => fetchApi(`/api/jobs/${id}`),
  
  createJob: (data: any) =>
    fetchApi('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateJob: (id: string, data: any) =>
    fetchApi(`/api/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteJob: (id: string) =>
    fetchApi(`/api/jobs/${id}`, {
      method: 'DELETE',
    }),

  generateWhatsAppLink: (id: string) =>
    fetchApi(`/api/jobs/${id}/generate-whatsapp`, {
      method: 'POST',
    }),

  // Candidates
  getCandidates: (jobId: string) =>
    fetchApi(`/api/candidates/job/${jobId}`),

  getCandidate: (id: string) => fetchApi(`/api/candidates/${id}`),

  updateCandidateStatus: (id: string, status: string) =>
    fetchApi(`/api/candidates/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  getCandidateConversation: (id: string) =>
    fetchApi(`/api/candidates/${id}/conversation`),

  deleteCandidate: (id: string) =>
    fetchApi(`/api/candidates/${id}`, {
      method: 'DELETE',
    }),

  // Stats
  getJobStats: (id: string) => fetchApi(`/api/stats/jobs/${id}`),

  // Settings
  getApiConfig: () => fetchApi('/api/settings/api-config'),
  
  updateApiConfig: (config: any) =>
    fetchApi('/api/settings/api-config', {
      method: 'PUT',
      body: JSON.stringify(config),
    }),

  getSettingsStatus: () => fetchApi('/api/settings/status'),
};

