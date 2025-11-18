"use client";

import Script from "next/script";

const faqs = [
  {
    q: "Що я отримаю на виході?",
    a: "Структурований бізнес-план з основними розділами, фінансовими показниками та можливістю експорту в PDF або DOCX.",
  },
  {
    q: "Як працює аналіз існуючого проєкту?",
    a: "Завантажуєш свій документ або короткий опис — система оцінює структуру, визначає сильні/слабкі сторони та пропонує покращення.",
  },
  {
    q: "Скільки часу займає створення плану?",
    a: "Зазвичай від 5 до 15 хвилин: відповідаєш на запитання майстра, після чого формується готовий документ.",
  },
  {
    q: "Чи можу я редагувати результат?",
    a: "Так, ти можеш змінювати розділи онлайн, а також експортувати й редагувати у своїх інструментах.",
  },
  {
    q: "Які галузі підтримуються?",
    a: "IT-стартапи, сфера послуг, HoReCa, e-commerce, NGO та інші — шаблони гнучкі й адаптуються під нішу.",
  },
];

export function FAQSection() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(({ q, a }) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": { "@type": "Answer", "text": a },
    })),
  };

  return (
    <section id="faq" className="mx-auto max-w-3xl space-y-6 px-4">
      <h2 className="text-center text-3xl font-bold">Питання та відповіді</h2>

      <div className="space-y-3">
        {faqs.map(({ q, a }, i) => (
          <details
            key={i}
            className="group rounded-xl border bg-white p-4 shadow-sm open:shadow-md dark:border-stroke-dark dark:bg-gray-dark"
          >
            <summary className="cursor-pointer list-none text-left font-semibold text-dark outline-none transition hover:opacity-90 dark:text-white">
              <span className="mr-2 inline-block rounded-md border px-2 py-0.5 text-xs text-dark-4 dark:border-dark-3 dark:text-dark-6">
                FAQ
              </span>
              {q}
            </summary>
            <div className="mt-3 text-sm leading-6 text-dark-4 dark:text-dark-6">{a}</div>
          </details>
        ))}
      </div>

      {/* SEO: FAQ Schema */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
