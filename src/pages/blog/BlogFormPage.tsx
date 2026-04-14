import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, X, CheckCircle2 } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';
import { getBlog, createBlog, updateBlog, BLOG_CATEGORIES } from '../../lib/blog';
import { uploadImage } from '../../lib/upload';

function toSlug(title: string) {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export default function BlogFormPage() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const isEdit = !!postId;
  const { success, error: toastError } = useToast();

  const [loading, setLoading]     = useState(isEdit);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle]         = useState('');
  const [slug, setSlug]           = useState('');
  const [excerpt, setExcerpt]     = useState('');
  const [content, setContent]     = useState('');
  const [category, setCategory]   = useState('general');
  const [tagsInput, setTagsInput] = useState('');
  const [imageUrl, setImageUrl]   = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imgDragOver, setImgDragOver]   = useState(false);
  const [isPublished, setIsPublished]   = useState(false);
  const [publishedAt, setPublishedAt]   = useState('');
  const [author, setAuthor]       = useState('Repair My Phone Screen');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    getBlog(postId).then(post => {
      if (post) {
        setTitle(post.title);
        setSlug(post.slug);
        setExcerpt(post.excerpt ?? '');
        setContent(post.content ?? '');
        setCategory(post.category);
        setTagsInput((post.tags ?? []).join(', '));
        setImageUrl(post.imageUrl ?? '');
        setImagePreview(post.imageUrl ?? '');
        setIsPublished(post.isPublished);
        setPublishedAt(post.publishedAt ?? '');
        setAuthor(post.author ?? 'Repair My Phone Screen');
      }
    }).finally(() => setLoading(false));
  }, [postId]);

  useEffect(() => { setImagePreview(imageUrl); }, [imageUrl]);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!isEdit) setSlug(toSlug(v));
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setUploading(true);
    try {
      const { url } = await uploadImage(file, 'blog');
      setImageUrl(url);
    } catch {
      toastError('Failed to upload image. Try again.');
      setImagePreview(imageUrl);
    } finally {
      setUploading(false);
    }
  };

  const tags = tagsInput
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !excerpt.trim()) return;
    setSaving(true);
    try {
      const data = {
        title:       title.trim(),
        slug:        slug.trim(),
        excerpt:     excerpt.trim(),
        content:     content.trim(),
        category,
        tags,
        imageUrl:    imageUrl.trim() || undefined,
        author:      author.trim() || 'Repair My Phone Screen',
        isPublished,
        publishedAt: isPublished && !publishedAt ? new Date().toISOString() : publishedAt || undefined,
      };
      if (isEdit && postId) {
        await updateBlog(postId, data);
        success('Blog post updated');
      } else {
        await createBlog(data);
        success('Blog post created');
      }
      navigate('/blog');
    } catch {
      toastError('Failed to save blog post.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  const ic = "w-full rounded-xl border border-[#e8eaed] bg-white px-4 py-3 text-[13px] text-[#202124] placeholder:text-[#c4c9d0] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const lc = "block text-[11px] font-bold uppercase tracking-wide text-[#5f6368] mb-2";

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/blog')}
          className="flex items-center gap-1.5 rounded-xl border border-[#e8eaed] bg-white px-3 py-2 text-[12px] font-semibold text-[#5f6368] hover:bg-gray-50 transition-colors">
          <ArrowLeft size={13} /> Blog
        </button>
        <span className="text-[#d1d5db]">/</span>
        <span className="text-[12px] font-bold text-[#202124]">{isEdit ? `Edit "${title}"` : 'New Post'}</span>
      </div>

      {/* Hero */}
      <div className="relative rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
        <div className="flex items-center gap-4 px-6 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md shadow-blue-200">
            <FileText size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-[20px] font-black text-[#202124] tracking-tight">
              {isEdit ? 'Edit Post' : 'New Post'}
            </h1>
            <p className="text-[12px] text-[#9aa0a6] mt-0.5">
              {isEdit ? `Editing "${title}"` : 'Create a new blog post'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Post Details */}
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
            <span className="text-[13px] font-bold text-[#202124]">Post Details</span>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={lc}>Title <span className="text-red-500">*</span></label>
                <input
                  value={title} onChange={e => handleTitleChange(e.target.value)}
                  placeholder="e.g. How to Protect Your iPhone Screen" required className={ic}
                />
              </div>
              <div>
                <label className={lc}>Slug <span className="text-red-500">*</span></label>
                <input
                  value={slug} onChange={e => setSlug(e.target.value)}
                  placeholder="e.g. how-to-protect-your-iphone-screen" required className={ic + ' font-mono'}
                />
                <p className="mt-1.5 text-[10px] text-[#9aa0a6]">Auto-generated from title</p>
              </div>
            </div>

            <div>
              <label className={lc}>
                Excerpt <span className="text-red-500">*</span>
                <span className="text-[#9aa0a6] normal-case font-normal text-[10px] ml-1">max 500 characters</span>
              </label>
              <textarea
                value={excerpt} onChange={e => { if (e.target.value.length <= 500) setExcerpt(e.target.value); }}
                placeholder="A short summary of the post..."
                rows={3} required
                className="w-full rounded-xl border border-[#e8eaed] bg-white px-4 py-3 text-[13px] text-[#202124] placeholder:text-[#c4c9d0] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
              />
              <p className={`mt-1 text-[10px] ${excerpt.length >= 480 ? 'text-amber-600' : 'text-[#9aa0a6]'}`}>
                {excerpt.length}/500
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={lc}>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className={ic}>
                  {BLOG_CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lc}>
                  Tags
                  <span className="text-[#9aa0a6] normal-case font-normal text-[10px] ml-1">comma-separated</span>
                </label>
                <input
                  value={tagsInput} onChange={e => setTagsInput(e.target.value)}
                  placeholder="e.g. iphone, screen repair, tips" className={ic}
                />
              </div>
            </div>

            {/* Tags preview */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
            <span className="text-[13px] font-bold text-[#202124]">Content</span>
            <span className="ml-2 text-[11px] text-[#9aa0a6]">HTML</span>
          </div>
          <div className="p-6">
            <textarea
              value={content} onChange={e => setContent(e.target.value)}
              placeholder="<p>Write your blog post content here...</p>"
              required
              style={{ minHeight: '300px' }}
              className="w-full rounded-xl border border-[#e8eaed] bg-white px-4 py-3 text-[13px] text-[#202124] placeholder:text-[#c4c9d0] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y transition-all font-mono"
            />
          </div>
        </div>

        {/* Featured Image */}
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
            <span className="text-[13px] font-bold text-[#202124]">Featured Image</span>
            <span className="ml-2 text-[11px] text-[#9aa0a6]">Optional</span>
          </div>
          <div className="p-6 max-w-xs">
            <input
              ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            {imagePreview ? (
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 flex-shrink-0 rounded-2xl border-2 border-[#e8eaed] bg-gray-50 overflow-hidden shadow-sm">
                  <img src={imagePreview} alt="Featured" className="h-full w-full object-cover" />
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                      <Spinner size="sm" />
                    </div>
                  )}
                  {!uploading && (
                    <button type="button" onClick={() => { setImageUrl(''); setImagePreview(''); }}
                      className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600">
                      <X size={9} />
                    </button>
                  )}
                </div>
                <div>
                  {!uploading && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      <span className="text-[12px] font-semibold text-emerald-700">Uploaded</span>
                    </div>
                  )}
                  {uploading && <p className="text-[12px] text-[#9aa0a6] mb-1">Uploading...</p>}
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700">
                    Replace
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setImgDragOver(true); }}
                onDragLeave={() => setImgDragOver(false)}
                onDrop={e => { e.preventDefault(); setImgDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 cursor-pointer transition-all ${imgDragOver ? 'border-blue-400 bg-blue-50' : 'border-[#e8eaed] hover:border-blue-300 hover:bg-blue-50/40'}`}>
                <Upload size={18} className={imgDragOver ? 'text-blue-500' : 'text-[#9aa0a6]'} />
                <p className="text-[12px] font-semibold text-[#5f6368]">Drop or <span className="text-blue-600">browse</span></p>
                <p className="text-[10px] text-[#9aa0a6]">PNG, JPG, WebP</p>
              </div>
            )}
          </div>
        </div>

        {/* Publishing */}
        <div className="rounded-2xl border border-[#e8eaed] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#f1f3f4] bg-[#f8fafc] px-5 py-3.5">
            <span className="text-[13px] font-bold text-[#202124]">Publishing</span>
          </div>
          <div className="p-6 space-y-5">
            {/* Publish toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-bold text-[#202124]">Status</p>
                <p className="text-[11px] text-[#9aa0a6] mt-0.5">
                  {isPublished ? 'This post is live and visible to readers' : 'This post is saved as a draft'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[12px] font-semibold ${isPublished ? 'text-green-700' : 'text-amber-600'}`}>
                  {isPublished ? 'Published' : 'Draft'}
                </span>
                <div onClick={() => setIsPublished(p => !p)}
                  className={`relative h-6 w-11 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${isPublished ? 'bg-blue-500' : 'bg-gray-200'}`}>
                  <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${isPublished ? 'translate-x-5' : ''}`} />
                </div>
              </div>
            </div>

            {/* Published date */}
            {isPublished && publishedAt && (
              <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-2.5">
                <p className="text-[11px] text-green-700 font-medium">
                  Published on {new Date(publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            )}

            {/* Author */}
            <div>
              <label className={lc}>Author</label>
              <input
                value={author} onChange={e => setAuthor(e.target.value)}
                placeholder="Repair My Phone Screen" className={ic}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={() => navigate('/blog')}
            className="rounded-xl border border-[#e8eaed] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#5f6368] hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving || uploading || !title.trim() || !content.trim() || !excerpt.trim()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-2.5 text-[13px] font-bold text-white shadow-sm hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {saving ? <Spinner size="sm" /> : null}
            {isEdit ? 'Save Changes' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
