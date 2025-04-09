import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "images.unsplash.com", // Allow images from Unsplash
      "res.cloudinary.com", // Optional: If you plan to use Cloudinary
      "avatars.githubusercontent.com", // Optional: For GitHub avatars
      "lh3.googleusercontent.com", // Optional: For Google profile photos
      "image.pollinations.ai", // Optional: For Pollinations images
    ],
  },
};

export default nextConfig;
