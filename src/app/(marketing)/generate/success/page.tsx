"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

type VerifyResponse = {
    draftId: string;
    title: string;
    downloadUrl: string; // очікуємо щось типу "/api/projects/{id}/download"
};

function PaymentSuccessInner() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");

    const [data, setData] = useState<VerifyResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) {
            setError("Відсутній ідентифікатор платежу.");
            setLoading(false);
            return;
        }

        const run = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(
                    `${API_BASE}/api/payments/verify?sessionId=${encodeURIComponent(
                        sessionId
                    )}`
                );

                const json = await res.json().catch(() => null);

                if (!res.ok) {
                    throw new Error(
                        json?.error || `Помилка перевірки оплати: ${res.status}`
                    );
                }

                setData(json as VerifyResponse);
            } catch (e: any) {
                setError(e.message || "Сталася помилка при перевірці оплати.");
            } finally {
                setLoading(false);
            }
        };

        run();
    }, [sessionId]);

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto py-10">
                <p className="text-sm text-dark-4 dark:text-dark-6">
                    Перевіряємо оплату…
                </p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="max-w-3xl mx-auto py-10 space-y-4">
                <p className="text-sm text-red-500">
                    {error || "Не вдалося підтвердити оплату."}
                </p>
            </div>
        );
    }

    const handleDownload = () => {
        if (!data) return;

        const url = data.downloadUrl.startsWith("http")
            ? data.downloadUrl
            : `${API_BASE}${data.downloadUrl}`;

        window.location.href = url;
    };

    return (
        <section className="max-w-3xl mx-auto text-center space-y-6 py-10 px-4">
            <h1 className="text-3xl font-bold">Оплата успішна 🎉</h1>
            <p className="text-sm text-dark-4 dark:text-dark-6 max-w-xl mx-auto">
                Ваш бізнес-план <strong>{data.title}</strong> готовий до завантаження.
                Збережіть документ у себе, щоб не загубити.
            </p>

            <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center rounded-xl bg-black px-6 py-3 text-white text-sm font-medium justify-center dark:bg-white dark:text-black"
            >
                Скачати бізнес-план (PDF / DOCX)
            </button>

            <p className="text-xs text-dark-4 dark:text-dark-6 max-w-sm mx-auto">
                Якщо ви випадково закриєте сторінку, документ можна буде згенерувати ще
                раз за цим самим проєктом (пізніше це привʼяжемо до акаунта).
            </p>
        </section>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="max-w-3xl mx-auto py-10">
                    <p className="text-sm text-dark-4 dark:text-dark-6">
                        Перевіряємо оплату…
                    </p>
                </div>
            }
        >
            <PaymentSuccessInner />
        </Suspense>
    );
}
