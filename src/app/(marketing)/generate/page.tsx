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
        <div className="max-w-2xl mx-auto space-y-6 py-10 px-4">
            <h1 className="text-3xl font-bold mb-2">Почнемо з кількох питань</h1>
            <p className="text-sm text-dark-4 dark:text-dark-6">
                Вкажіть базову інформацію про ваш бізнес — це допоможе зробити план
                більш точним.
            </p>

            <div className="grid gap-4">
                <input
                    className="w-full rounded-lg border px-4 py-2 text-sm bg-white dark:bg-gray-dark dark:border-stroke-dark"
                    placeholder="Сфера бізнесу (наприклад, кавʼярня, салон краси, онлайн-курси)"
                    value={answers.industry}
                    onChange={e =>
                        setAnswers(a => ({ ...a, industry: e.target.value }))
                    }
                />
                <input
                    className="w-full rounded-lg border px-4 py-2 text-sm bg-white dark:bg-gray-dark dark:border-stroke-dark"
                    placeholder="Країна/місто (наприклад, Україна, Львів)"
                    value={answers.country}
                    onChange={e =>
                        setAnswers(a => ({ ...a, country: e.target.value }))
                    }
                />
            </div>

            <button
                onClick={start}
                className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white dark:bg-white dark:text-black"
            >
                Продовжити до майстра
            </button>

            <p className="text-xs text-dark-4 dark:text-dark-6">
                Ви зможете змінити ці дані на наступних кроках. Відповіді допоможуть
                краще адаптувати бізнес-план під ваш випадок.
            </p>
        </div>
    );
}
