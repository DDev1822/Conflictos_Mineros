const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function publicAsset(path: string, basePath = configuredBasePath) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const normalizedBasePath = basePath.replace(/\/$/, "");

  if (!normalizedBasePath || normalizedPath.startsWith(`${normalizedBasePath}/`)) return normalizedPath;
  return `${normalizedBasePath}${normalizedPath}`;
}
