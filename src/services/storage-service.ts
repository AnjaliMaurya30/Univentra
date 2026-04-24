import { supabase } from '@/lib/supabase/client';

export const storageService = {
  async uploadPublicAsset(file: File, bucket: 'avatars' | 'club-assets' | 'event-banners', folder = 'uploads') {
    if (!supabase) {
      return URL.createObjectURL(file);
    }

    const extension = file.name.split('.').pop() ?? 'file';
    const path = `${folder}/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

    if (error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  async uploadPrivateAsset(file: Blob, bucket: 'certificates', pathPrefix: string) {
    if (!supabase) {
      return URL.createObjectURL(file);
    }

    const path = `${pathPrefix}/${crypto.randomUUID()}.pdf`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      contentType: 'application/pdf',
      upsert: false,
    });

    if (error) throw error;
    return path;
  },

  async resolvePrivateAsset(bucket: 'certificates', pathOrUrl: string) {
    if (!supabase || pathOrUrl.startsWith('blob:') || pathOrUrl.startsWith('http')) {
      return pathOrUrl;
    }

    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(pathOrUrl, 60 * 10);
    if (error) throw error;
    return data.signedUrl;
  },
};
