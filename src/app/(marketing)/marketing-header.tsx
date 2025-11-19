"use client";

import Image from "next/image";
import Link from "next/link";
import { ThemeToggleSwitch } from "@/components/Layouts/header/theme-toggle";

export function MarketingHeader() {
    return (
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stroke bg-white px-4 py-3 shadow-sm dark:border-stroke-dark dark:bg-gray-dark md:px-5 2xl:px-10">
            <Link href="/" className="flex items-center gap-2">
                <Image
                    src={"/images/logo/logo-icon.svg"}
                    width={28}
                    height={28}
                    alt="Бізнес Гайд"
                    priority
                />
                <span className="font-semibold text-sm md:text-base max-sm:hidden">
          Бізнес Гайд
        </span>
            </Link>

            <nav className="flex flex-1 items-center justify-end gap-3">
                <Link
                    href="/pricing"
                    className="text-sm md:text-base hidden sm:inline-block hover:underline"
                >
                    Ціни
                </Link>

                <ThemeToggleSwitch />
            </nav>
        </header>
    );
}
