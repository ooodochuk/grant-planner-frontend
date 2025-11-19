"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { WIZARD_CONTEXT_KEY } from "./wizardConstants";

type StartAnswers = {
    industry: string;
    country: string;
};

export default function GenerateWizardStart() {
    const router = useRouter();
    const [answers, setAnswers] = useState<StartAnswers>({
        industry: "",
        country: "",
    });

    const start = () => {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(
                WIZARD_CONTEXT_KEY,
                JSON.stringify(answers)
            );
        }

        router.push("/generate/step-1");
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
            {/* Заголовок */}
            <div className="mb-5 space-y-2 text-center sm:text-left">
                <h1 className="text-2xl font-semibold sm:text-3xl">
                    Почнемо з кількох питань
                </h1>
                <p className="text-sm text-dark-4 dark:text-dark-6">
                    Вкажіть базову інформацію про ваш бізнес — це допоможе зробити план
                    більш точним.
                </p>
            </div>

            {/* Картка з формою */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-stroke-dark dark:bg-gray-dark sm:p-6 space-y-5">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium">
                            Сфера бізнесу
                        </label>
                        <input
                            className="w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-gray-dark dark:border-stroke-dark"
                            placeholder="Наприклад: кавʼярня, салон краси, онлайн-курси"
                            value={answers.industry}
                            onChange={e =>
                                setAnswers(a => ({ ...a, industry: e.target.value }))
                            }
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium">
                            Країна / місто
                        </label>
                        <input
                            className="w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-gray-dark dark:border-stroke-dark"
                            placeholder="Наприклад: Україна, Львів"
                            value={answers.country}
                            onChange={e =>
                                setAnswers(a => ({ ...a, country: e.target.value }))
                            }
                        />
                    </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-stroke-dark">
                    <button
                        onClick={start}
                        className="w-full rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                    >
                        Продовжити до майстра
                    </button>
                </div>
            </div>

            <p className="mt-4 text-xs text-dark-4 dark:text-dark-6">
                Ви зможете змінити ці дані на наступних кроках. Відповіді допоможуть
                краще адаптувати бізнес-план під ваш випадок.
            </p>
        </div>
    );
}
