// app/(marketing)/generate/step-1/page.tsx
"use client";

import { useEffect, useState } from "react";
import { WIZARD_STEPS, WizardAnswers, QuestionConfig } from "../wizardSchema";
import { useRouter } from "next/navigation";
import { WIZARD_CONTEXT_KEY } from "@/app/(marketing)/generate/wizardConstants";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

interface WizardContext {
    industry: string;
    country: string;
}

interface GenerateDraftResponse {
    draftId: string;
}

export default function GenerateWizardPage() {
    const [stepIndex, setStepIndex] = useState(0);
    const [answers, setAnswers] = useState<WizardAnswers>({});
    const [context, setContext] = useState<WizardContext | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    const step = WIZARD_STEPS[stepIndex];
    const isLastStep = stepIndex === WIZARD_STEPS.length - 1;

    // зчитуємо industry/country зі стартового кроку
    useEffect(() => {
        if (typeof window === "undefined") return;

        const raw = window.localStorage.getItem(WIZARD_CONTEXT_KEY);
        if (raw) {
            try {
                const parsed = JSON.parse(raw) as WizardContext;
                setContext(parsed);
            } catch {
                // якщо щось пішло не так — контекст буде null
            }
        }
    }, []);

    const handleChange = (id: QuestionConfig["id"], value: string | string[]) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    const handleNext = async () => {
        setError(null);

        if (!isLastStep) {
            setStepIndex(i => i + 1);
            return;
        }

        // останній крок → виклик бекенду
        const effectiveContext: WizardContext = context ?? {
            industry: "",
            country: "",
        };

        setIsSubmitting(true);
        try {
            const payload = {
                industry: effectiveContext.industry,
                country: effectiveContext.country,
                answers,
            };

            const res = await fetch(`${API_BASE}/api/business-plan/draft`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error(
                    `Помилка при генерації бізнес-плану (код ${res.status})`
                );
            }

            const data = (await res.json()) as GenerateDraftResponse;

            if (typeof window !== "undefined") {
                window.localStorage.setItem("bizplan:lastDraftId", data.draftId);
            }

            router.push(`/generate/preview?draftId=${data.draftId}`);
        } catch (e: any) {
            setError(e.message || "Сталася помилка при генерації бізнес-плану.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        if (stepIndex > 0) setStepIndex(i => i - 1);
    };

    const progress = Math.round(((stepIndex + 1) / WIZARD_STEPS.length) * 100);

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
            {/* Прогрес + заголовок в окремому блоці, центровані на мобілці */}
            <div className="mb-5 space-y-3 text-center sm:text-left">
                <p className="text-xs font-medium uppercase tracking-wide text-dark-4 dark:text-dark-6">
                    Крок {stepIndex + 1} з {WIZARD_STEPS.length}
                </p>
                <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-dark-2">
                    <div
                        className="h-1.5 rounded-full bg-black dark:bg-white transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="space-y-1 pt-1">
                    <h1 className="text-2xl font-semibold sm:text-3xl">
                        {step.title}
                    </h1>
                    {step.description && (
                        <p className="text-sm text-dark-4 dark:text-dark-6">
                            {step.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Картка з питаннями */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-stroke-dark dark:bg-gray-dark sm:p-6 space-y-6">
                {/* Питання */}
                <div className="space-y-5">
                    {step.questions.map(q => {
                        const currentValue =
                            answers[q.id] ?? (q.type === "multi-select" ? [] : "");

                        return (
                            <div key={q.id} className="space-y-2">
                                <label className="block text-sm font-medium">
                                    {q.label}
                                    {q.required && <span className="text-red-500"> *</span>}
                                </label>

                                {renderField(q, currentValue, value =>
                                    handleChange(q.id, value)
                                )}

                                {q.helperText && (
                                    <p className="text-xs text-dark-4 dark:text-dark-6">
                                        {q.helperText}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Помилка */}
                {error && (
                    <p className="text-sm text-red-500">
                        {error}
                    </p>
                )}

                {/* Кнопки навігації — краще для мобілки */}
                <div className="pt-4 border-t border-gray-100 dark:border-stroke-dark">
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <button
                            type="button"
                            onClick={handleBack}
                            disabled={stepIndex === 0 || isSubmitting}
                            className="w-full sm:w-auto rounded-xl border border-transparent px-4 py-2.5 text-sm font-medium text-dark-4 hover:bg-gray-50 disabled:opacity-40 dark:text-dark-6 dark:hover:bg-dark-2"
                        >
                            Назад
                        </button>

                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-black/90 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                        >
                            {isLastStep
                                ? isSubmitting
                                    ? "Генеруємо план..."
                                    : "Завершити та згенерувати план"
                                : "Продовжити"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function renderField(
    q: QuestionConfig,
    value: string | string[],
    onChange: (value: string | string[]) => void
) {
    const commonClasses =
        "w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-gray-dark dark:border-stroke-dark";

    // multi-select з чекбоксами
    if (q.type === "multi-select" && q.options) {
        const selected = Array.isArray(value) ? value : [];

        const toggle = (opt: string) => {
            if (selected.includes(opt)) {
                onChange(selected.filter(o => o !== opt));
            } else {
                onChange([...selected, opt]);
            }
        };

        const otherValue =
            selected.find(v => v.startsWith("Інше: "))?.replace("Інше: ", "") ?? "";

        const onOtherChange = (text: string) => {
            const withoutOther = selected.filter(v => !v.startsWith("Інше: "));
            if (!text) {
                onChange(withoutOther);
            } else {
                onChange([...withoutOther, `Інше: ${text}`]);
            }
        };

        return (
            <div className="space-y-2">
                <div className="grid gap-2 sm:grid-cols-2">
                    {q.options.map(opt => (
                        <label
                            key={opt}
                            className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm hover:bg-gray-50 dark:border-stroke-dark dark:hover:bg-dark-2"
                        >
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300"
                                checked={selected.includes(opt)}
                                onChange={() => toggle(opt)}
                            />
                            <span className="leading-snug">{opt}</span>
                        </label>
                    ))}
                </div>

                {q.allowOther && (
                    <div className="mt-2">
                        <label className="mb-1 block text-xs text-dark-4 dark:text-dark-6">
                            Інше (за бажанням)
                        </label>
                        <input
                            type="text"
                            className={commonClasses}
                            placeholder="Наприклад: оренда авто, франшиза, страхування..."
                            value={otherValue}
                            onChange={e => onOtherChange(e.target.value)}
                        />
                    </div>
                )}
            </div>
        );
    }

    // textarea
    if (q.type === "textarea") {
        return (
            <textarea
                className={commonClasses + " min-h-[100px] resize-y"}
                placeholder={q.placeholder}
                value={(value as string) ?? ""}
                onChange={e => onChange(e.target.value)}
            />
        );
    }

    // select
    if (q.type === "select" && q.options) {
        return (
            <select
                className={commonClasses}
                value={(value as string) ?? ""}
                onChange={e => onChange(e.target.value)}
            >
                <option value="">{q.placeholder || "Оберіть варіант"}</option>
                {q.options.map(opt => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        );
    }

    // number
    if (q.type === "number") {
        return (
            <input
                type="number"
                className={commonClasses}
                placeholder={q.placeholder}
                value={(value as string) ?? ""}
                onChange={e => onChange(e.target.value)}
            />
        );
    }

    // text by default
    return (
        <input
            type="text"
            className={commonClasses}
            placeholder={q.placeholder}
            value={(value as string) ?? ""}
            onChange={e => onChange(e.target.value)}
        />
    );
}
