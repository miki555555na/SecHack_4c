import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Limit Turbopack's workspace root to this project to avoid scanning parent directories that are not readable in this environment.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
