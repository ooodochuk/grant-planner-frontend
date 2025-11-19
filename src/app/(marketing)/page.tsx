import Link from "next/link";
import Image from "next/image";
import { FAQSection } from "@/app/(marketing)/_components/faq";
import { StatsDivider } from "@/app/(marketing)/_components/stats-divider";

export default function LandingPage() {
    return (
        <div className="space-y-20 md:space-y-24">
            {/* Hero */}
            <section className="relative isolate grid items-center gap-10 md:grid-cols-2">
                {/* Ліва колонка: заголовок + CTA */}
                <div className="space-y-5">
                    <p className="text-sm font-medium uppercase tracking-wide text-primary">
                        Бізнес-план без зайвої бюрократії
                    </p>

                    <h1 className="text-3xl font-bold leading-tight md:text-4xl">
                        Готовий бізнес-план за кілька хвилин
                    </h1>

                    <p className="text-base md:text-lg text-dark-4 dark:text-dark-6">
                        Відповідаєте на прості запитання — отримуєте структурований бізнес-план у PDF чи DOCX.
                        Підходить для банку, грантових програм та інвесторів.
                    </p>

                    <div className="space-y-3">
                        <Link
                            href="/generate"
                            className="inline-flex items-center rounded-xl bg-black px-6 py-3 text-sm md:text-base font-medium text-white shadow-sm transition hover:opacity-90 dark:bg-white dark:text-black"
                        >
                            Отримати бізнес-план
                        </Link>
                        <p className="text-xs md:text-sm text-dark-4 dark:text-dark-6">
                            Без складних формул. Сервіс сам рахує показники та збирає текст.
                        </p>
                    </div>

                    {/* Міні-соціальний довірчий блок */}
                    <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-dark-4 dark:text-dark-6">
                        <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-primary/10 text-xs flex items-center justify-center">
                ⭐
              </span>
                            <span>Користувачі повертаються по нові проєкти</span>
                        </div>
                    </div>
                </div>

                {/* Права колонка: картинка + список з іконками */}
                <div className="relative rounded-2xl border p-6 dark:border-stroke-dark dark:bg-gray-dark">
                    {/* велика фото-ілюстрація (праворуч у hero) */}
                    <div className="mb-5 overflow-hidden rounded-xl border dark:border-stroke-dark">
                        <Image
                            src="/images/marketing/biznes_plan.jpg"
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
                            <Image
                                src="/images/icon/questions-and-answers-svgrepo-com.svg"
                                alt=""
                                width={18}
                                height={18}
                                className="opacity-80"
                            />
                            <span>Майстер запитань веде крок за кроком</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Image
                                src="/images/icon/analysis.svg"
                                alt=""
                                width={18}
                                height={18}
                                className="opacity-80"
                            />
                            <span>Система підказує, що додати до бізнес-моделі</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Image
                                src="/images/icon/export-content-svgrepo-com.svg"
                                alt=""
                                width={18}
                                height={18}
                                className="opacity-80"
                            />
                            <span>Експорт у PDF / DOCX для подачі в банк чи на грант</span>
                        </li>
                    </ul>
                </div>
            </section>

            <StatsDivider
                stats={[
                    { label: "Підприємців скористались сервісом", value: 134 },
                    { label: "Готових бізнес-планів згенеровано", value: 300 },
                    { label: "клієнтів повертаються вдруге", value: 76, suffix: "%" },
                ]}
            />

            {/* Аналітика / переваги */}
            <section className="mx-auto max-w-6xl space-y-10 px-4">
                <h2 className="text-2xl md:text-3xl font-bold text-center">
                    Чому цей бізнес-план приймають серйозно?
                </h2>
                <p className="mx-auto max-w-3xl text-center text-sm md:text-base text-dark-4 dark:text-dark-6">
                    Ви відповідаєте на запитання про свій проєкт, а система перетворює це в логічну структуру:
                    резюме, опис продукту, ринок, фінанси. Без «води» та зайвих сторінок.
                </p>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-gray-dark">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-dark-2">
                            <Image src="/images/icon/analysis.svg" alt="Аналіз" width={28} height={28} />
                        </div>
                        <h3 className="mb-2 font-semibold text-dark dark:text-white">Логічна структура</h3>
                        <p className="text-sm text-dark-4 dark:text-dark-6">
                            Сервіс збирає ваші відповіді в зрозумілий документ, який легко читати банку чи інвестору.
                        </p>
                    </div>

                    <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-gray-dark">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-dark-2">
                            <Image
                                src="/images/icon/recommendation.svg"
                                alt="Рекомендації"
                                width={28}
                                height={28}
                            />
                        </div>
                        <h3 className="mb-2 font-semibold text-dark dark:text-white">Фінансові показники</h3>
                        <p className="text-sm text-dark-4 dark:text-dark-6">
                            Автоматичні розрахунки виручки, витрат та прибутку на основі ваших даних.
                        </p>
                    </div>

                    <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-gray-dark">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-dark-2">
                            <Image
                                src="/images/icon/visualization.svg"
                                alt="Візуалізація"
                                width={28}
                                height={28}
                            />
                        </div>
                        <h3 className="mb-2 font-semibold text-dark dark:text-white">Готовий до відправки</h3>
                        <p className="text-sm text-dark-4 dark:text-dark-6">
                            Завантажуєте документ у PDF / DOCX і одразу можете відправляти його в банк, на грант чи партнеру.
                        </p>
                    </div>
                </div>
            </section>

            {/* Степи успіху */}
            <section className="mx-auto max-w-4xl space-y-10 px-4 text-center">
                <h2 className="text-2xl md:text-3xl font-bold">
                    3 кроки до вашого бізнес-плану
                </h2>
                <ol className="grid gap-6 md:grid-cols-3">
                    <li className="flex flex-col items-center rounded-xl border bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-gray-dark">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Image
                  src="/images/icon/question-svgrepo-com.svg"
                  alt="Крок 1"
                  width={28}
                  height={28}
              />
            </span>
                        <h3 className="mb-2 font-semibold">Запускаєте майстер</h3>
                        <p className="text-sm text-dark-4 dark:text-dark-6">
                            Відповідаєте на запитання про свій бізнес, ринок і цілі.
                        </p>
                    </li>

                    <li className="flex flex-col items-center rounded-xl border bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-gray-dark">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Image
                  src="/images/icon/studying-exam-svgrepo-com.svg"
                  alt="Крок 2"
                  width={28}
                  height={28}
              />
            </span>
                        <h3 className="mb-2 font-semibold">Сервіс рахує та збирає</h3>
                        <p className="text-sm text-dark-4 dark:text-dark-6">
                            Автоматично формуються фінансові показники та текст бізнес-плану.
                        </p>
                    </li>

                    <li className="flex flex-col items-center rounded-xl border bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-gray-dark">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Image
                  src="/images/icon/export-content-svgrepo-com.svg"
                  alt="Крок 3"
                  width={28}
                  height={28}
              />
            </span>
                        <h3 className="mb-2 font-semibold">Завантажуєте документ</h3>
                        <p className="text-sm text-dark-4 dark:text-dark-6">
                            Отримуєте готовий файл та можете одразу подавати його туди, де потрібен бізнес-план.
                        </p>
                    </li>
                </ol>
            </section>

            {/* Відгуки + FAQ + фінальний CTA */}
            <section
                id="testimonials"
                className="mx-auto max-w-4xl space-y-16 px-4 text-center"
            >
                <div className="space-y-10">
                    <h2 className="text-2xl md:text-3xl font-bold">Відгуки користувачів</h2>
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
                                    <figcaption className="font-semibold text-dark dark:text-white">
                                        {t.name}
                                    </figcaption>
                                </div>
                                <blockquote className="text-dark-4 dark:text-dark-6">
                                    “{t.text}”
                                </blockquote>
                            </figure>
                        ))}
                    </div>
                </div>

                {/* FAQ */}
                <div className="space-y-12">
                    <FAQSection />

                    {/* Фінальний блок з CTA */}
                    <div className="rounded-2xl border bg-white p-6 md:p-8 shadow-sm dark:border-stroke-dark dark:bg-gray-dark">
                        <h3 className="text-xl md:text-2xl font-semibold mb-3">
                            Готові показати свій проєкт банку чи на грант?
                        </h3>
                        <p className="mb-5 text-sm md:text-base text-dark-4 dark:text-dark-6">
                            Запустіть майстер запитань, опишіть свій бізнес — і вже за кілька хвилин у вас буде
                            бізнес-план, який не соромно відправити.
                        </p>
                        <Link
                            href="/generate"
                            className="inline-flex items-center rounded-xl bg-black px-6 py-3 text-sm md:text-base font-medium text-white shadow-sm transition hover:opacity-90 dark:bg-white dark:text-black"
                        >
                            Отримати бізнес-план
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
