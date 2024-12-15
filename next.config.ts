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
        ignoreBuildErrors: true
      }
};

export default nextConfig;
