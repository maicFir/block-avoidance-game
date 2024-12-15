import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    webpack: (config, { dev, isServer }) => {
        config.module.rules.push({
          test: /\.(mp3)$/,
          use: {
            loader: "file-loader"
          }
        });
     
        return config;
      },
      typescript: {
        ignoreBuildErrors: true, // 忽略类型检查错误
    },
    eslint: {
        ignoreDuringBuilds: true,
    }
};

export default nextConfig;
