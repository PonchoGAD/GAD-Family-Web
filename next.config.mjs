// next.config.mjs
import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // где искать зависимости при серверном трейсинге
  outputFileTracingRoot: path.join(process.cwd()),

  // временно рендерим <Image> как <img>, чтобы не спотыкаться на оптимизации
  images: { unoptimized: true },

  // не роняем prod-сборку из-за ESLint-ошибок (any и т.п.)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // (опционально) если на время нужно игнорить TS-ошибки в прод-сборке
  // ⚠️ включай только если очень надо и потом верни обратно
  // typescript: {
  //   ignoreBuildErrors: true,
  // },

  // заглушки под web3-зависимости
  webpack: (config) => {
    // MetaMask SDK (через web3modal) иногда пытается резолвить RN-async-storage
    config.resolve.alias["@react-native-async-storage/async-storage"] = false;
    // Пара пакетов могут просить pino-pretty — заглушим
    config.resolve.alias["pino-pretty"] = false;
    return config;
  },
};

export default nextConfig;
