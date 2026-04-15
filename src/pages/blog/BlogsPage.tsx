import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Pencil, Trash2, Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';
import { getBlogs, deleteBlog, BLOG_CATEGORIES } from '../../lib/blog';
import type { BlogPost } from '../../lib/blog';

type FilterTab = 'all' | 'published' | 'drafts';

export default function BlogsPage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [meta, setMeta] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<FilterTab>('all');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (search.trim()) params.search = search.trim();
      if (tab === 'published') params.isPublished = 'true';
      if (tab === 'drafts') params.isPublished = 'false';
      const res = await getBlogs(params);
      setPosts(res.data);
      setMeta(res.meta ?? {});
    } catch {
      toastError('Failed to load blog posts.');
    } finally {
      setLoading(false);
    }
  }, [page, search, tab, toastError]);

  useEffect(() => { load(); }, [load]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, tab]);

  const publishedCount = posts.filter(p => p.isPublished).length;

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Delete "${post.title}"?`)) return;
    try {
      await deleteBlog(post.id);
      success('Blog post deleted');
      load();
    } catch {
      toastError('Failed to delete.');
    }
  };

  const getCategoryLabel = (cat: string) => {
    return BLOG_CATEGORIES.find(c => c.value === cat)?.label ?? cat;
  };

  const totalPages = meta.totalPages ?? 1;

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'published', label: 'Published' },
    { key: 'drafts', label: 'Drafts' },
  ];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md shadow-blue-200">
            <FileText size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-[20px] font-black text-[#202124] tracking-tight">Blog Posts</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold text-[#5f6368]">
                {meta.total ?? posts.length} posts
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold text-green-700">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />{publishedCount} published
              </span>
            </div>
          </div>
        </div>
        <button onClick={() => navigate('/blog/new')}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 text-[13px] font-bold text-white shadow-sm hover:from-blue-600 hover:to-indigo-600 transition-all">
          <Plus size={15} /> New Post
        </button>
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`rounded-lg px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
                tab === t.key
                  ? 'bg-white text-[#202124] shadow-sm'
                  : 'text-[#5f6368] hover:text-[#202124]'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative max-w-sm flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search blog posts..."
            className="w-full rounded-xl border border-[#e8eaed] bg-white pl-9 pr-3 py-2.5 text-[13px] placeholder:text-[#9aa0a6] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 bg-white rounded-2xl border border-[#e8eaed]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
            <FileText size={24} className="text-blue-300" />
          </div>
          <p className="text-[14px] font-semibold text-[#5f6368]">No blog posts found</p>
          <button onClick={() => navigate('/blog/new')}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-[12px] font-bold text-white hover:from-blue-600 hover:to-indigo-600 transition-all">
            <Plus size={13} /> New Post
          </button>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#f1f3f4] bg-[#f8fafc]">
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-[#5f6368]">Title</th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-[#5f6368]">Category</th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-[#5f6368]">Status</th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-[#5f6368]">Views</th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-[#5f6368]">Date</th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-[#5f6368]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(post => (
                    <tr key={post.id} className="border-b border-[#f8fafc] hover:bg-[#f8fafc] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {post.imageUrl ? (
                            <img src={post.imageUrl} alt="" className="h-9 w-9 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 flex-shrink-0">
                              <FileText size={14} className="text-blue-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-[#202124] truncate max-w-[280px]">{post.title}</p>
                            <p className="text-[10px] text-[#9aa0a6] font-mono truncate max-w-[280px]">/{post.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                          {getCategoryLabel(post.category)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          post.isPublished
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${post.isPublished ? 'bg-green-500' : 'bg-amber-500'}`} />
                          {post.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 text-[12px] text-[#5f6368]">
                          <Eye size={12} className="text-[#9aa0a6]" />
                          {post.views.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-[12px] text-[#5f6368]">
                          {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => navigate(`/blog/${post.id}/edit`)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8eaed] text-[#5f6368] hover:bg-gray-50 hover:text-[#202124] transition-all">
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => handleDelete(post)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 transition-all">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-[12px] text-[#9aa0a6]">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8eaed] text-[#5f6368] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8eaed] text-[#5f6368] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
