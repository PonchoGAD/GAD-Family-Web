// next.config.mjs
import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Уберём варнинг про "workspace root"
  outputFileTracingRoot: path.resolve(process.cwd()),

  // Упростим обработку изображений
  images: { unoptimized: true },

  // Не валить билд из-за ESLint на CI
  eslint: { ignoreDuringBuilds: true },

  webpack: (config, { isServer }) => {
    // Твои прежние заглушки
    config.resolve.alias["@react-native-async-storage/async-storage"] = false;
    config.resolve.alias["pino-pretty"] = false;

    if (isServer) {
      // Заглушаем любые IndexedDB-обёртки в серверной сборке
      config.resolve.alias["idb"] = false;
      config.resolve.alias["idb-keyval"] = false;
      config.resolve.alias["dexie"] = false;
      config.resolve.alias["localforage"] = false;

      // Подменяем модуль с IndexedDB-хранилищем на серверный no-op
      const stub = path.resolve(process.cwd(), "stubs/storage.server.ts");
      // алиас по твоему @-пути
      config.resolve.alias["@wallet/adapters/storage.web"] = stub;
      // возможный абсолютный путь (если ts-paths разворачивает)
      config.resolve.alias[path.resolve(process.cwd(), "src/wallet/adapters/storage.web.ts")] = stub;
    }

    return config;
  },
};

export default nextConfig;
