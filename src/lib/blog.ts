import api from './api';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  author: string;
  isPublished: boolean;
  publishedAt?: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export type BlogCategory = 'general' | 'iphone' | 'samsung' | 'ipad' | 'huawei' | 'sony-xperia' | 'google-pixel' | 'tips' | 'guides';

export const BLOG_CATEGORIES: { value: BlogCategory; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'iphone', label: 'iPhone' },
  { value: 'samsung', label: 'Samsung' },
  { value: 'ipad', label: 'iPad' },
  { value: 'huawei', label: 'Huawei' },
  { value: 'sony-xperia', label: 'Sony Xperia' },
  { value: 'google-pixel', label: 'Google Pixel' },
  { value: 'tips', label: 'Tips & Tricks' },
  { value: 'guides', label: 'Guides' },
];

const map = (d: any): BlogPost => ({ ...d, id: d._id || d.id });

export async function getBlogs(params?: Record<string, string>): Promise<{ data: BlogPost[]; meta: any }> {
  const res = await api.get('/blog', { params });
  return { data: (res.data.data ?? []).map(map), meta: res.data.meta };
}

export async function getBlog(id: string): Promise<BlogPost | null> {
  try {
    const res = await api.get(`/blog/${id}`);
    return map(res.data.data);
  } catch { return null; }
}

export async function createBlog(data: Partial<BlogPost>): Promise<BlogPost> {
  const res = await api.post('/blog', data);
  return map(res.data.data);
}

export async function updateBlog(id: string, data: Partial<BlogPost>): Promise<BlogPost> {
  const res = await api.put(`/blog/${id}`, data);
  return map(res.data.data);
}

export async function deleteBlog(id: string): Promise<void> {
  await api.delete(`/blog/${id}`);
}
