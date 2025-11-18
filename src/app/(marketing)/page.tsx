import Link from "next/link";
import Image from "next/image";
import { FAQSection } from "@/app/(marketing)/_components/faq";
import { StatsDivider } from "@/app/(marketing)/_components/stats-divider";

export default function LandingPage() {
  return (
    <div className="space-y-24">
      {/* Hero */}
      <section className="relative isolate grid items-center gap-10 md:grid-cols-2">
        {/* Ліва колонка: заголовок + CTA */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Твій онлайн-помічник для бізнесу
          </h1>
          <p className="text-lg text-dark-4 dark:text-dark-6">
            Завантаж готовий проєкт — отримай аналіз. Або створи бізнес-план з нуля за кілька хвилин за допомогою майстра запитань.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/analyze"
              className="inline-flex items-center rounded-xl bg-black px-5 py-3 text-white dark:bg-white dark:text-black"
            >
              Завантажити проєкт для аналізу
            </Link>
            <Link
              href="/generate"
              className="inline-flex items-center rounded-xl border px-5 py-3 dark:border-stroke-dark dark:bg-[#020D1A] hover:dark:bg-[#FFFFFF1A]"
            >
              Створити бізнес-план
            </Link>
          </div>
        </div>

        {/* Права колонка: картинка + список з іконками + маленька “праворуч згори” іконка */}
        <div className="relative rounded-2xl border p-6 dark:border-stroke-dark dark:bg-gray-dark">
          {/* велика фото-ілюстрація (праворуч у hero) */}
          <div className="mb-5 overflow-hidden rounded-xl border dark:border-stroke-dark">
            <Image
              src="/images/marketing/biznes_plan.jpg"            // 👉 твоє фото
              alt="Ілюстрація бізнес-плану"
              width={720}
              height={480}
              className="h-auto w-full object-cover"
              priority
            />
          </div>

          {/* список з маленькими іконками */}
          <ul className="space-y-3 text-sm text-dark-4 dark:text-dark-6">
            <li className="flex items-center gap-2">
              <Image src="/images/icon/questions-and-answers-svgrepo-com.svg" alt="" width={18} height={18} className="opacity-80" />
              <span>Майстер запитань з підказками</span>
            </li>
            <li className="flex items-center gap-2">
              <Image src="/images/icon/export-content-svgrepo-com.svg" alt="" width={18} height={18} className="opacity-80" />
              <span>Експорт PDF / DOCX</span>
            </li>
            <li className="flex items-center gap-2">
              <Image src="/images/icon/fast-forward-button-svgrepo-com.svg" alt="" width={18} height={18} className="opacity-80" />
              <span>Миттєвий результат</span>
            </li>
          </ul>
        </div>
      </section>

      <StatsDivider
        stats={[
          { label: "Користувачів", value: 134 },
          { label: "Згенеровано проєктів", value: 300 },
          { label: "клієнтів — повертаються вдруге", value: 76, suffix: "%" },
        ]}
      />

      {/* Аналітика */}
      <section className="mx-auto max-w-6xl space-y-10 px-4">
        <h2 className="text-3xl font-bold text-center">Чому це працює?</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-gray-dark">
            <div className="mb-3 h-12 w-12 rounded-lg bg-gray-100 dark:bg-dark-2 flex items-center justify-center">
              <Image src="/images/icon/analysis.svg" alt="Аналіз" width={28} height={28} />
            </div>
            <h3 className="mb-2 font-semibold text-dark dark:text-white">Аналіз даних</h3>
            <p className="text-sm text-dark-4 dark:text-dark-6">
              Система підказує сильні та слабкі сторони вашого проєкту.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-gray-dark">
            <div className="mb-3 h-12 w-12 rounded-lg bg-gray-100 dark:bg-dark-2 flex items-center justify-center">
              <Image src="/images/icon/recommendation.svg" alt="Рекомендації" width={28} height={28} />
            </div>
            <h3 className="mb-2 font-semibold text-dark dark:text-white">Рекомендації</h3>
            <p className="text-sm text-dark-4 dark:text-dark-6">
              Отримайте поради, як покращити фінансову модель чи структуру бізнес-плану.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-gray-dark">
            <div className="mb-3 h-12 w-12 rounded-lg bg-gray-100 dark:bg-dark-2 flex items-center justify-center">
              <Image src="/images/icon/visualization.svg" alt="Візуалізація" width={28} height={28} />
            </div>
            <h3 className="mb-2 font-semibold text-dark dark:text-white">Візуалізація</h3>
            <p className="text-sm text-dark-4 dark:text-dark-6">
              Графіки та таблиці для чіткого розуміння результатів.
            </p>
          </div>
        </div>
      </section>

      {/* Степи успіху */}
      <section className="mx-auto max-w-4xl space-y-10 px-4 text-center">
        <h2 className="text-3xl font-bold">3 кроки до готового бізнес-проєкту</h2>
        <ol className="grid gap-6 md:grid-cols-3">
          <li className="flex flex-col items-center rounded-xl border bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-gray-dark">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Image src="/images/icon/question-svgrepo-com.svg" alt="Крок 1" width={28} height={28} />
            </span>
            <h3 className="mb-2 font-semibold">Відповіді на запитання</h3>
            <p className="text-sm text-dark-4 dark:text-dark-6">Заповніть простий онлайн-майстер.</p>
          </li>

          <li className="flex flex-col items-center rounded-xl border bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-gray-dark">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Image src="/images/icon/studying-exam-svgrepo-com.svg" alt="Крок 2" width={28} height={28} />
            </span>
            <h3 className="mb-2 font-semibold">Аналіз і підготовка</h3>
            <p className="text-sm text-dark-4 dark:text-dark-6">Система формує фінансові показники та структуру плану.</p>
          </li>

          <li className="flex flex-col items-center rounded-xl border bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-gray-dark">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Image src="/images/icon/export-content-svgrepo-com.svg" alt="Крок 3" width={28} height={28} />
            </span>
            <h3 className="mb-2 font-semibold">Готовий документ</h3>
            <p className="text-sm text-dark-4 dark:text-dark-6">Завантажте бізнес-план у PDF чи DOCX для презентацій та інвесторів.</p>
          </li>
        </ol>
      </section>
      {/* Відгуки */}
      <section id="testimonials" className="mx-auto max-w-4xl space-y-10 px-4 text-center">
        <h2 className="text-3xl font-bold">Відгуки користувачів</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              name: "Олена, власниця кавʼярні",
              text: "За пів години отримала бізнес-план, з яким легко пішла в банк. Дуже зручно!",
              avatar: "/images/people/olena.jpeg",
            },
            {
              name: "Андрій, IT-стартап",
              text: "Онлайн-майстер допоміг чітко структурувати ідею. PDF з фінмоделлю був готовий миттєво.",
              avatar: "/images/people/andriy.jpeg",
            },
          ].map((t, i) => (
            <figure
              key={i}
              className="rounded-xl border bg-white p-6 text-left shadow-sm dark:border-stroke-dark dark:bg-gray-dark"
            >
              <div className="mb-3 flex items-center gap-3">
                <Image
                  src={t.avatar}
                  alt={t.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <figcaption className="font-semibold text-dark dark:text-white">{t.name}</figcaption>
              </div>
              <blockquote className="text-dark-4 dark:text-dark-6">“{t.text}”</blockquote>
            </figure>
          ))}
        </div>

        {/* FAQ */}
        <div className="space-y-24">
          <FAQSection />
        </div>
      </section>
    </div>
  );
}
