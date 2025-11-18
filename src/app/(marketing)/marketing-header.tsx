"use client";

import Image from "next/image";
import Link from "next/link";
import { ThemeToggleSwitch } from "@/components/Layouts/header/theme-toggle";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stroke bg-white px-4 py-5 shadow-1 dark:border-stroke-dark dark:bg-gray-dark md:px-5 2xl:px-10">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src={"/images/logo/logo-icon.svg"}
          width={32}
          height={32}
          alt="Grant Planner"
          priority
        />
        <span className="font-semibold max-sm:hidden">Grant Planner</span>
      </Link>

      <nav className="flex flex-1 items-center justify-end gap-2 min-[375px]:gap-4">
        <Link href="/pricing" className="hidden sm:inline-block hover:underline">
          Ціни
        </Link>

        <ThemeToggleSwitch />

        <Link
          href="/auth/sign-in"
          className="inline-flex rounded-lg border px-3 py-1.5 hover:bg-gray-50 dark:border-stroke-dark dark:bg-[#020D1A] hover:dark:bg-[#FFFFFF1A]"
        >
          Увійти
        </Link>
      </nav>
    </header>
  );
}
