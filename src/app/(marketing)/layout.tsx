import type { ReactNode } from "react";
import { MarketingHeader } from "./marketing-header";

// Глобальні стилі вже імпортовані в root app/layout.tsx.
// Тут лише каркас для маркетингу.

export const metadata = {
  title: "Grant Planner — ваш онлайн-помічник",
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    // той самий фон, що і в дашборді
    <div className="min-h-dvh bg-gray-2 text-dark dark:bg-[#020d1a] dark:text-white">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
        {children}
      </main>
    </div>
  );
}
