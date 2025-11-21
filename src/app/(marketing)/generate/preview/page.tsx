"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

type ProjectPreview = {
    id: string;
    title: string;
    resultJson?: string | null;
    downloadUrl?: string | null;
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

                // 👇 вирівнюємо ключ з wizard-сторінкою
                if (!id && typeof window !== "undefined") {
                    const last = window.localStorage.getItem("bizplan:lastDraftId");

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
                    downloadUrl: body.downloadUrl ?? body.previewUrl ?? null,
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

    // Парсимо summary + previewText з resultJson
    let summary: string | null = null;
    let previewText: string | null = null;

    try {
        if (project.resultJson) {
            const parsed = JSON.parse(project.resultJson as string);
            summary = parsed.summary ?? null;
            previewText = parsed.previewText ?? null;
        }
    } catch {
        // якщо JSON кривий — тихо ігноруємо
    }

    return (
        <section className="max-w-3xl mx-auto space-y-6 py-10 px-4">
            <h1 className="text-3xl font-bold mb-2">Попередній перегляд бізнес-плану</h1>
            <p className="text-sm text-dark-4 dark:text-dark-6 max-w-xl">
                Ось як виглядатиме ваш бізнес-план. Після оплати ви отримаєте повний документ
                у форматі PDF / DOCX з усіма розділами та деталями.
            </p>

            {/* Картка з назвою та коротким описом */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-gray-dark space-y-4 text-left">
                <h2 className="text-xl font-semibold">{project.title}</h2>
                {summary ? (
                    <p className="text-sm text-dark-4 dark:text-dark-6">
                        {summary}
                    </p>
                ) : (
                    <p className="text-sm text-dark-4 dark:text-dark-6">
                        Ми сформуємо короткий опис вашого бізнесу, ринок, фінансові показники
                        та ключові кроки розвитку на основі ваших відповідей.
                    </p>
                )}
            </div>

            {/* Детальніший превʼю-текст від ШІ */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-gray-dark space-y-3">
                <h3 className="text-lg font-semibold">Що ви отримаєте</h3>
                {previewText ? (
                    <div className="text-sm text-dark-4 dark:text-dark-6 whitespace-pre-line leading-relaxed">
                        {previewText}
                    </div>
                ) : (
                    <p className="text-sm text-dark-4 dark:text-dark-6">
                        На основі ваших відповідей ми сформуємо структуру бізнес-плану з
                        розділами: продукт/послуга, цільова аудиторія, конкуренти, маркетинг,
                        операційна частина та фінансова логіка. Ви побачите це тут як превʼю
                        перед оплатою.
                    </p>
                )}

                <div className="pt-4 space-y-3">
                    <div className="rounded-xl border overflow-hidden bg-white dark:bg-black">
                        <iframe
                            src={`${API_BASE}/api/projects/${project.id}/draft-download`}
                            className="w-full h-[600px]"
                            title="PDF preview"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href={`${API_BASE}/api/projects/${project.id}/draft-download`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm underline"
                        >
                            Переглянути PDF-чернетку
                        </a>
                    </div>

                    <p className="text-[11px] text-dark-4 dark:text-dark-6">
                        Це попередній PDF із водяним знаком «Чернетка». Після оплати ви отримаєте
                        фінальний документ без водяних знаків.
                    </p>
                </div>

            </div>

            {/* Блок оплати */}
            <div className="space-y-2">
                <button
                    type="button"
                    onClick={handlePay}
                    disabled={isPaying}
                    className="inline-flex items-center rounded-xl bg-black px-6 py-3 text-sm font-medium text-white shadow-sm dark:bg:white dark:text-black disabled:opacity-60"
                >
                    {isPaying ? "Переходимо до оплати…" : "Отримати повний бізнес-план за 5 €"}
                </button>
                {payError && (
                    <p className="text-xs text-red-500">{payError}</p>
                )}
                <p className="text-xs text-dark-4 dark:text-dark-6">
                    Оплата відбувається через Stripe. Після успіху ви одразу зможете скачати
                    повний документ.
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
