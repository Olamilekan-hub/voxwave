"use client";

import React from "react";
import Link from "next/link";
import { Volume2, Github, Twitter, Mail, Heart } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const Footer = () => {
  const { theme, mounted } = useTheme();

  const footerLinks = {
    product: [
      { name: "Text to Speech", href: "/text-to-speech" },
      { name: "Speech to Speech", href: "/speech-to-speech" },
      { name: "Speech to Text", href: "/speech-to-text" },
      { name: "API Documentation", href: "/docs" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" },
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Community", href: "/community" },
      { name: "Status", href: "/status" },
      { name: "Report Bug", href: "/bug-report" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR", href: "/gdpr" },
    ],
  };

  return (
    <footer
      className={`border-t ${
        theme === "dark"
          ? "bg-gray-900/50 border-gray-800"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                  VoxWave
                </h3>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  AI Voice Platform
                </p>
              </div>
            </div>
            <p
              className={`text-sm mb-6 max-w-md ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Transform your voice with cutting-edge AI technology. Create
              stunning voices, clone any voice, and transform speech with
              VoxWave.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="https://twitter.com/voxwave"
                className={`p-2 rounded-lg transition-colors ${
                  theme === "dark"
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/voxwave"
                className={`p-2 rounded-lg transition-colors ${
                  theme === "dark"
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello@voxwave.ai"
                className={`p-2 rounded-lg transition-colors ${
                  theme === "dark"
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4
              className={`font-semibold mb-4 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Product
            </h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`text-sm transition-colors ${
                      theme === "dark"
                        ? "text-gray-400 hover:text-green-400"
                        : "text-gray-600 hover:text-green-600"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4
              className={`font-semibold mb-4 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Company
            </h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`text-sm transition-colors ${
                      theme === "dark"
                        ? "text-gray-400 hover:text-green-400"
                        : "text-gray-600 hover:text-green-600"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4
              className={`font-semibold mb-4 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Support
            </h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`text-sm transition-colors ${
                      theme === "dark"
                        ? "text-gray-400 hover:text-green-400"
                        : "text-gray-600 hover:text-green-600"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4
              className={`font-semibold mb-4 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Legal
            </h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`text-sm transition-colors ${
                      theme === "dark"
                        ? "text-gray-400 hover:text-green-400"
                        : "text-gray-600 hover:text-green-600"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div
          className={`pt-8 border-t flex flex-col md:flex-row justify-between items-center ${
            theme === "dark" ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <div
            className={`flex items-center space-x-1 text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <span>© 2025 VoxWave. Made with</span>
            <Heart className="w-4 h-4 text-red-500" />
            <span>by the VoxWave team.</span>
          </div>

          <div
            className={`flex items-center space-x-4 mt-4 md:mt-0 text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <span>Powered by ElevenLabs</span>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <span>v2.1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
