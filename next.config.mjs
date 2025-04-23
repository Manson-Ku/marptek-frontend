/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // 這個保持正確，不要亂加 enablePostcssPresetEnv
    serverActions: false
  }
};

export default nextConfig;
