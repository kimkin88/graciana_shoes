-- Allow large originals (signed browser uploads). Global Storage default is often 50MB.
update storage.buckets
set file_size_limit = 1073741824
where id = 'product-images';
