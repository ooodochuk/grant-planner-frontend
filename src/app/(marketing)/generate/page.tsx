"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GenerateWizardStart() {
  const r = useRouter();
  const [answers, setAnswers] = useState({ industry: "", country: "" });

  const start = () => {
    // збережи answers у state/query/localStorage і переведи на кроки майстра
    r.push("/generate/step-1");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold">Почнемо з кількох питань</h2>
      <div className="grid gap-4">
        <input
          className="w-full rounded-lg border px-4 py-2"
          placeholder="Сфера бізнесу (наприклад, кафе)"
          value={answers.industry}
          onChange={e => setAnswers(a => ({ ...a, industry: e.target.value }))}
        />
        <input
          className="w-full rounded-lg border px-4 py-2"
          placeholder="Країна/місто"
          value={answers.country}
          onChange={e => setAnswers(a => ({ ...a, country: e.target.value }))}
        />
      </div>
      <button onClick={start} className="rounded-xl bg-black px-5 py-3 text-white">
        Продовжити
      </button>
    </div>
  );
}
