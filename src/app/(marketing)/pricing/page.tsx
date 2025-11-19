"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export default function PricingPage() {
    const [isPaying, setIsPaying] = useState(false);
    const [isPaid, setIsPaid] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const handlePay = async () => {
        setIsPaying(true);
        setError(null);

        try {
            // TODO: тут буде реальна інтеграція з оплатою
            // приклад майбутнього коду:
            //
            // const res = await fetch(`${API_BASE}/api/payments/checkout`, { method: "POST" });
            // const data = await res.json();
            // window.location.href = data.checkoutUrl; // якщо редірект на платіжну сторінку
            //
            // А після повернення з оплати — окремий success-екран / валідація.

            // Тимчасовий стаб: просто вмикаємо "успішно оплачено"
            setIsPaid(true);

            // TODO: коли зʼявиться бекенд для генерації файлу — сюди кладеш реальну URL:
            // setDownloadUrl(data.downloadUrl);
            setDownloadUrl(`${API_BASE}/api/projects/download/latest`); // поки умовний endpoint
        } catch (e: any) {
            setError(e.message || "Сталася помилка під час оплати. Спробуйте ще раз.");
        } finally {
            setIsPaying(false);
        }
    };

    return (
        <section className="max-w-3xl mx-auto text-center space-y-8 py-10 px-4">
            {!isPaid ? (
                <>
                    <h2 className="text-3xl font-bold">Готовий бізнес-план — лише за 5 €</h2>

                    <p className="text-sm text-dark-4 dark:text-dark-6 max-w-xl mx-auto">
                        На основі ваших відповідей ми сформуємо повний бізнес-план у форматі PDF/DOCX.
                        Його можна подавати до банку, на гранти або показувати інвесторам.
                    </p>

                    <div className="rounded-2xl border bg-white p-8 shadow-sm dark:border-stroke-dark dark:bg-gray-dark space-y-6">
                        <div className="text-5xl font-bold">5 €</div>
                        <p className="text-sm text-dark-4 dark:text-dark-6">
                            Одноразова оплата — документ залишається у вас назавжди.
                        </p>

                        <button
                            type="button"
                            onClick={handlePay}
                            disabled={isPaying}
                            className="inline-flex items-center rounded-xl bg-black px-6 py-3 text-white text-sm font-medium w-full justify-center disabled:opacity-60 dark:bg-white dark:text-black"
                        >
                            {isPaying ? "Обробка оплати…" : "Оплатити 5 € та отримати бізнес-план"}
                        </button>

                        {error && (
                            <p className="text-xs text-red-500">
                                {error}
                            </p>
                        )}

                        <p className="text-xs text-dark-4 dark:text-dark-6">
                            Без реєстрації. Після оплати одразу отримаєш кнопку для скачування документа.
                        </p>
                    </div>
                </>
            ) : (
                <>
                    <h2 className="text-3xl font-bold">Оплата успішна 🎉</h2>
                    <p className="text-sm text-dark-4 dark:text-dark-6 max-w-xl mx-auto">
                        Ваш бізнес-план сформовано. Скачайте документ і збережіть у себе.
                    </p>

                    <div className="rounded-2xl border bg-white p-8 shadow-sm dark:border-stroke-dark dark:bg-gray-dark space-y-4">
                        <button
                            type="button"
                            className="inline-flex items-center rounded-xl bg-black px-6 py-3 text-white text-sm font-medium w-full justify-center dark:bg-white dark:text-black"
                            onClick={() => {
                                if (downloadUrl) {
                                    window.location.href = downloadUrl;
                                } else {
                                    // тимчасова заглушка, поки нема реального файлу
                                    alert("Тут буде скачування PDF/DOCX, коли бекенд поверне посилання.");
                                }
                            }}
                        >
                            Скачати бізнес-план (PDF / DOCX)
                        </button>

                        <p className="text-xs text-dark-4 dark:text-dark-6">
                            Якщо загубиш файл — просто збережи його у себе на компʼютері чи в хмарі.
                        </p>
                    </div>
                </>
            )}
        </section>
    );
}
