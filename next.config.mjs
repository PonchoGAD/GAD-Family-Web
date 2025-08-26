import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(process.cwd()),
  images: { unoptimized: true } // временно: <Image> как <img>
};

export default nextConfig;
