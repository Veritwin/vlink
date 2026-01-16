import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Zap, Twitter, Linkedin, Github } from "lucide-react";

// Map chain IDs to their file extensions
const chainExtensions: Record<string, string> = {
  ethereum: "svg",
  solana: "svg",
  base: "png",
  polygon: "svg",
  arbitrum: "svg",
  optimism: "svg",
  avalanche: "svg",
  bnb: "svg",
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="font-display text-2xl font-bold">VLink</span>
            </Link>
            <p className="text-white/70 mb-2 max-w-sm">
              {siteConfig.description}
            </p>
            <p className="text-white/50 text-sm mb-6">
              A product of{" "}
              <a
                href={siteConfig.parent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-400 hover:text-accent-300 transition-colors"
              >
                {siteConfig.parent.name}
              </a>
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href={siteConfig.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href={siteConfig.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href={siteConfig.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-display font-bold mb-4">Product</h3>
            <ul className="space-y-3">
              {siteConfig.nav.main.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-display font-bold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/developers"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/developers#api"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  API Reference
                </Link>
              </li>
              <li>
                <Link
                  href="/developers#sdk"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  SDKs
                </Link>
              </li>
              <li>
                <a
                  href={siteConfig.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-bold mb-4">Contact</h3>
            <ul className="space-y-3 text-white/70">
              <li>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="hover:text-white transition-colors"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.contact.support}`}
                  className="hover:text-white transition-colors"
                >
                  {siteConfig.contact.support}
                </a>
              </li>
              <li>{siteConfig.contact.location}</li>
            </ul>
          </div>
        </div>

        {/* Supported Chains */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <p className="text-white/50 text-sm mb-4 text-center">
            Supported Networks
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {siteConfig.chains.map((chain) => (
              <div
                key={chain.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg"
              >
                <Image
                  src={`/icons/chains/${chain.id}.${chainExtensions[chain.id] || 'svg'}`}
                  alt={chain.name}
                  width={16}
                  height={16}
                  className="object-contain"
                />
                <span className="text-white/70 text-sm">{chain.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-white/50 text-sm">
            &copy; {currentYear} {siteConfig.parent.name}, Inc. All rights
            reserved.
          </div>

          <div className="flex gap-6 text-sm">
            {siteConfig.nav.footer.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white/50 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
