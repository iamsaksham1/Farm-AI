const API_BASE = '/api';

export async function predictImage(file, gradcam = true) {
  const formData = new FormData();
  formData.append('file', file);
  
  const url = `${API_BASE}/predict?gradcam=${gradcam}`;
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server error (${response.status})`);
  }

  return await response.json();
}

export async function getScanHistory(limit = 50) {
  const res = await fetch(`${API_BASE}/history?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch scan history');
  return await res.json();
}

export async function deleteScanHistory(id) {
  const res = await fetch(`${API_BASE}/history/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete scan record');
  return await res.json();
}

export async function getStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch statistics');
  return await res.json();
}

export async function getSamples() {
  const res = await fetch(`${API_BASE}/samples`);
  if (!res.ok) throw new Error('Failed to fetch sample leaves');
  return await res.json();
}

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Service offline');
  return await res.json();
}
