"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Stat = { label: string; value: number; suffix?: string };

function useInView<T extends HTMLElement>(rootMargin = "0px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const obs = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { rootMargin, threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.unobserve(el);
  }, [rootMargin]);

  return { ref, inView };
}

function CountUp({ to, duration = 1200 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setVal(Math.round(to * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [to, duration]);

  return <>{val.toLocaleString("uk-UA")}</>;
}

export function StatsDivider({
                               stats,
                               note,
                             }: {
  stats?: Stat[];
  note?: string;
}) {
  const items = useMemo<Stat[]>(
    () =>
      stats ?? [
        { label: "Користувачів", value: 134 },
        { label: "Згенеровано проєктів", value: 300 },
        { label: "клієнтів — повертаються вдруге", value: 76, suffix: "%" },
      ],
    [stats]
  );

  const { ref, inView } = useInView<HTMLDivElement>("0px");

  return (
    <section
      ref={ref}
      className="relative -mx-4 px-4"
      aria-label="Ключова статистика сервісу"
    >
      <div className="mx-auto max-w-6xl rounded-3xl border border-stroke bg-white/70 p-6 shadow-1 backdrop-blur dark:border-stroke-dark dark:bg-[#0b1220]/70 md:p-10">
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((s, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center"
            >
              {/* круг із кільцем */}
              <div className="relative mb-4 grid h-28 w-28 place-items-center rounded-full bg-gradient-to-b from-gray-50 to-gray-100 shadow-sm dark:from-dark-2 dark:to-dark-2/60">
                <div className="absolute inset-0 rounded-full ring-1 ring-black/5 dark:ring-white/10" />
                <div className="absolute -inset-[2px] -z-10 rounded-full bg-[conic-gradient(var(--tw-gradient-stops))] from-[#5750F1] via-[#85b6ff] to-[#5750F1] opacity-20 blur-sm" />
                <div className="text-2xl font-extrabold text-dark dark:text-white tabular-nums">
                  {inView ? <CountUp to={s.value} /> : 0}
                  {s.suffix ?? ""}
                </div>
              </div>

              <div className="text-sm font-medium text-dark-4 dark:text-dark-6">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {note ? (
          <p className="mt-6 text-center text-xs text-dark-4 dark:text-dark-6">
            {note}
          </p>
        ) : null}
      </div>
    </section>
  );
}
