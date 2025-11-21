"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export default function PricingPage() {
    const [isPaying, setIsPaying] = useState(false);
    const [isPaid, setIsPaid] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const [projectId, setProjectId] = useState<string | null>(null);

    // ✅ беремо id проєкту з localStorage
    useEffect(() => {
        if (typeof window === "undefined") return;

        const id = window.localStorage.getItem("bizplan:lastDraftId");
        if (id) {
            setProjectId(id);
        }
    }, []);

    const handlePay = async () => {
        setIsPaying(true);
        setError(null);

        try {
            // Тимчасовий стаб оплати
            setIsPaid(true);

            if (!projectId) {
                throw new Error("Не знайдено ID проєкту.");
            }

            // ✅ правильний шлях до файлу
            setDownloadUrl(`${API_BASE}/api/projects/${projectId}/download`);
        } catch (e: any) {
            setError(e.message || "Сталася помилка під час оплати.");
        } finally {
            setIsPaying(false);
        }
    };

    const handleDownload = () => {
        if (!downloadUrl) {
            alert("Файл ще не готовий.");
            return;
        }

        // ✅ пряме скачування
        window.location.href = downloadUrl;
    };

    return (
        <section className="max-w-3xl mx-auto text-center space-y-8 py-10 px-4">
            {!isPaid ? (
                <>
                    <h2 className="text-3xl font-bold">Готовий бізнес-план — лише за 5 €</h2>

                    <div className="rounded-2xl border bg-white p-8 shadow-sm space-y-6">
                        <div className="text-5xl font-bold">5 €</div>

                        <button
                            type="button"
                            onClick={handlePay}
                            disabled={isPaying}
                            className="inline-flex items-center rounded-xl bg-black px-6 py-3 text-white w-full justify-center disabled:opacity-60"
                        >
                            {isPaying ? "Обробка оплати…" : "Оплатити 5 € та отримати бізнес-план"}
                        </button>

                        {error && <p className="text-xs text-red-500">{error}</p>}
                    </div>
                </>
            ) : (
                <>
                    <h2 className="text-3xl font-bold">Оплата успішна 🎉</h2>

                    <div className="rounded-2xl border bg-white p-8 shadow-sm space-y-4">
                        <button
                            type="button"
                            onClick={handleDownload}
                            className="inline-flex items-center rounded-xl bg-black px-6 py-3 text-white w-full justify-center"
                        >
                            Скачати бізнес-план (PDF / DOCX)
                        </button>

                        <p className="text-xs text-dark-4">
                            Якщо не відкривається — перевір, чи бекенд віддає файл правильно.
                        </p>
                    </div>
                </>
            )}
        </section>
    );
}
