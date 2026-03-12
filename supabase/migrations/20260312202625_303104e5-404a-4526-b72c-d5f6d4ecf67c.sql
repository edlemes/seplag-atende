
-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to avatars
CREATE POLICY "public_read_avatars" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');

-- Allow anyone to upload avatars
CREATE POLICY "public_insert_avatars" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'avatars');

-- Allow anyone to update avatars
CREATE POLICY "public_update_avatars" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'avatars');

-- Allow anyone to delete avatars
CREATE POLICY "public_delete_avatars" ON storage.objects FOR DELETE TO public USING (bucket_id = 'avatars');
