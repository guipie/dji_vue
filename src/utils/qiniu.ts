export function $qnImage(url: string, width: number = 120, height: number = 120) {
  if (!url) return;
  if (url.startsWith(import.meta.env.VITE_OSS_ENDPOINT))
    return url + `?imageView2/1/w/${width}/h/${height}`;
  else if (url.startsWith("Upload/"))
    return import.meta.env.VITE_OSS_ENDPOINT + url + `?imageView2/1/w/${width}/h/${height}`;
  return url;
}