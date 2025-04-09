"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();

  return (
    <div className="container mx-auto">
      {/* Hero Section */}
      <section className="py-16 md:py-24 flex flex-col md:flex-row items-center justify-between gap-8">
        <motion.div
          className="flex-1 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-primary">
            Welcome to BeOne Shop
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover premium products at affordable prices. Your one-stop
            destination for quality shopping.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => router.push("/products")}
              className="text-lg"
            >
              Browse Products
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/login")}
              className="text-lg"
            >
              Join Now
            </Button>
          </div>
        </motion.div>
        <motion.div
          className="flex-1 relative h-[300px] md:h-[400px] w-full rounded-lg overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Image
            src="https://image.pollinations.ai/prompt/premium%20online%20store%20shopping%20products%20display%20colorful?width=1200&height=800&nologo=true"
            alt="BeOne Shop Products"
            fill
            className="object-cover rounded-lg"
            priority
          />
        </motion.div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 md:py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Popular Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              className="relative rounded-lg overflow-hidden cursor-pointer group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              onClick={() => router.push(`/products?category=${category.slug}`)}
            >
              <div className="h-[180px] relative">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-xl font-bold">
                    {category.name}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 md:py-16 bg-primary/5 rounded-lg my-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Why Choose BeOne Shop?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the difference with our commitment to quality and
            customer satisfaction.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              className="flex flex-col items-center text-center p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-24 text-center">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to discover amazing products?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of satisfied customers and experience shopping like
            never before.
          </p>
          <Button
            size="lg"
            onClick={() => router.push("/products")}
            className="text-lg"
          >
            Shop Now
          </Button>
        </motion.div>
      </section>
    </div>
  );
}

// Sample data
const categories = [
  {
    name: "Electronics",
    slug: "electronics",
    image:
      "https://image.pollinations.ai/prompt/modern%20electronics%20gadgets%20display?width=500&height=500&nologo=true",
  },
  {
    name: "Fashion",
    slug: "fashion",
    image:
      "https://image.pollinations.ai/prompt/stylish%20fashion%20clothing%20minimal?width=500&height=500&nologo=true",
  },
  {
    name: "Home & Living",
    slug: "home-living",
    image:
      "https://image.pollinations.ai/prompt/modern%20home%20decor%20interior%20minimal?width=500&height=500&nologo=true",
  },
  {
    name: "Beauty",
    slug: "beauty",
    image:
      "https://image.pollinations.ai/prompt/beauty%20products%20cosmetics%20elegant%20display?width=500&height=500&nologo=true",
  },
];

const benefits = [
  {
    title: "Free Shipping",
    description:
      "Enjoy free shipping on all orders over $50. Fast delivery to your doorstep.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      >
        <path d="M5 9h14M5 15h14" />
        <path d="M12 3v18" />
        <path d="M19 9v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />
      </svg>
    ),
  },
  {
    title: "Loyalty Rewards",
    description:
      "Earn points with every purchase and redeem them for exclusive discounts.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    title: "24/7 Support",
    description:
      "Our customer service team is always ready to assist you with any questions.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
];
