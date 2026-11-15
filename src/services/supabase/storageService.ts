import { isSupabaseConfigured, supabase } from './client';

const IMAGE_BUCKET = 'catalog-images';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

export async function uploadCatalogImage(
  file: File,
  category: 'players' | 'teams',
  itemId: string
): Promise<string> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  const extension = IMAGE_EXTENSIONS[file.type];
  if (!extension) throw new Error('Choose a JPG, PNG, WebP, GIF, or SVG image.');
  if (file.size > MAX_IMAGE_SIZE) throw new Error('Image files must be 5 MB or smaller.');

  const safeId = itemId.toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
  if (!safeId) throw new Error('Add a name or short code before uploading an image.');
  const path = `${category}/${safeId}.${extension}`;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: true,
  });
  if (error) throw error;

  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}
