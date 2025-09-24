export function formatImageName(path) {
  if (!path) return path;

  return `${process.env.NEXT_PUBLIC_API_URL}/public/${path}`;
}
