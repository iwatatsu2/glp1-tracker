"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "ホーム", icon: "🏠" },
  { href: "/side-effects", label: "副作用", icon: "📋" },
  { href: "/injection-site", label: "部位", icon: "💉" },
  { href: "/weight", label: "体重", icon: "📊" },
  { href: "/settings", label: "設定", icon: "⚙️" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-lg mx-auto flex">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                isActive
                  ? "text-blue-600 font-semibold"
                  : "text-gray-400"
              }`}
            >
              <span className="text-xl mb-0.5">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
