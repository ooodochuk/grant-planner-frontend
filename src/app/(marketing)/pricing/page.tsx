export default function PricingPage() {
  return (
    <section className="max-w-3xl mx-auto text-center space-y-6">
      <h2 className="text-3xl font-bold">Лише 5 € за готовий бізнес-план</h2>
      <p className="text-gray-600">
        Пройди короткий майстер, оплати — і одразу отримай файл для скачування.
      </p>
      <a
        href="/auth/sign-in"
        className="inline-flex items-center rounded-xl bg-black px-5 py-3 text-white"
      >
        Зареєструватися
      </a>
    </section>
  );
}
