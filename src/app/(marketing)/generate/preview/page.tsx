"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

type ProjectPreview = {
    id: string;
    title: string;
    resultJson?: string | null;
};

type VerifyError = string | null;

function GeneratePreviewInner() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const draftIdFromUrl = searchParams.get("draftId");

    const [project, setProject] = useState<ProjectPreview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<VerifyError>(null);

    const [isPaying, setIsPaying] = useState(false);
    const [payError, setPayError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);

            try {
                let id = draftIdFromUrl;

                // Якщо draftId не передали в урлі — можна взяти останній з localStorage (якщо ти його там зберігаєш)
                if (!id && typeof window !== "undefined") {
                    const last = window.localStorage.getItem("bizguide:lastDraftId");
                    if (last) id = last;
                }

                if (!id) {
                    throw new Error(
                        "Не вдалося знайти бізнес-проєкт. Спробуйте пройти майстер ще раз."
                    );
                }

                const res = await fetch(`${API_BASE}/api/projects/${id}`);
                if (!res.ok) {
                    throw new Error("Не вдалося завантажити дані про бізнес-проєкт.");
                }

                const body = await res.json();
                setProject({
                    id: body.id,
                    title: body.title,
                    resultJson: body.resultJson,
                });
            } catch (e: any) {
                setError(e.message || "Сталася помилка при завантаженні.");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [draftIdFromUrl]);

    const handlePay = async () => {
        if (!project) return;
        setIsPaying(true);
        setPayError(null);

        try {
            const res = await fetch(`${API_BASE}/api/payments/checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ draftId: project.id }),
            });

            const json = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(json?.error || `Помилка оплати: ${res.status}`);
            }

            const checkoutUrl: string | undefined = json?.checkoutUrl;
            if (!checkoutUrl) {
                throw new Error("Не вдалося отримати посилання на оплату.");
            }

            window.location.href = checkoutUrl;
        } catch (e: any) {
            setPayError(e.message || "Не вдалося ініціювати оплату.");
        } finally {
            setIsPaying(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto py-10">
                <p className="text-sm text-dark-4 dark:text-dark-6">
                    Завантажуємо попередній перегляд…
                </p>
            </div>
        );
    }

    if (error || !project) {
        return (
            <section className="max-w-3xl mx-auto space-y-4 py-10 px-4">
                <h1 className="text-2xl font-semibold">Попередній перегляд</h1>
                <p className="text-sm text-red-500">
                    {error || "Не вдалося завантажити дані про бізнес."}
                </p>
                <button
                    type="button"
                    onClick={() => router.push("/generate")}
                    className="inline-flex items-center rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-black"
                >
                    Почати заново
                </button>
            </section>
        );
    }

    // Трошки дістаємо summary з resultJson, якщо воно є
    let summary: string | null = null;
    try {
        if (project.resultJson) {
            const parsed = JSON.parse(project.resultJson as string);
            summary = parsed.summary ?? null;
        }
    } catch {
        // ігноруємо, якщо кривий JSON
    }

    return (
        <section className="max-w-3xl mx-auto space-y-6 py-10 px-4">
            <h1 className="text-3xl font-bold mb-2">Попередній перегляд бізнес-плану</h1>
            <p className="text-sm text-dark-4 dark:text-dark-6 max-w-xl mx-auto">
                Ось як виглядатиме ваш бізнес-план. Після оплати ви отримаєте повний документ
                у форматі PDF / DOCX.
            </p>

            <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-gray-dark space-y-4 text-left">
                <h2 className="text-xl font-semibold">{project.title}</h2>
                {summary ? (
                    <p className="text-sm text-dark-4 dark:text-dark-6">{summary}</p>
                ) : (
                    <p className="text-sm text-dark-4 dark:text-dark-6">
                        Ми сформуємо короткий опис вашого бізнесу, ринок, фінансові показники
                        та ключові кроки розвитку на основі ваших відповідей.
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <button
                    type="button"
                    onClick={handlePay}
                    disabled={isPaying}
                    className="inline-flex items-center rounded-xl bg-black px-6 py-3 text-sm font-medium text-white shadow-sm dark:bg-white dark:text-black disabled:opacity-60"
                >
                    {isPaying ? "Переходимо до оплати…" : "Отримати повний бізнес-план за 5 €"}
                </button>
                {payError && (
                    <p className="text-xs text-red-500">{payError}</p>
                )}
                <p className="text-xs text-dark-4 dark:text-dark-6">
                    Оплата відбувається через Stripe. Після успіху ви одразу зможете скачати
                    документ.
                </p>
            </div>
        </section>
    );
}

export default function GeneratePreviewPage() {
    return (
        <Suspense
            fallback={
                <div className="max-w-3xl mx-auto py-10">
                    <p className="text-sm text-dark-4 dark:text-dark-6">
                        Завантажуємо попередній перегляд…
                    </p>
                </div>
            }
        >
            <GeneratePreviewInner />
        </Suspense>
    );
}
