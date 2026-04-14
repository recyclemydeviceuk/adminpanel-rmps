import api from './api';

export async function uploadImage(file: File, folder = 'misc'): Promise<{ url: string; key: string }> {
  const form = new FormData();
  form.append('image', file);
  const res = await api.post<{ data: { url: string; key: string } }>(`/upload?folder=${folder}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function deleteImage(key: string): Promise<void> {
  await api.delete('/upload', { data: { key } });
}
