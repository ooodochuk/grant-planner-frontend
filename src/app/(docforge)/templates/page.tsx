"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

type TemplateRow = {
    id: number;
    name: string;
    status: string;
    createdAt?: string | null;
};

const Btn: React.FC<
    React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "default" | "primary" }
> = ({ className = "", tone = "default", ...props }) => {
    const toneCls =
        tone === "primary"
            ? "bg-slate-900 text-white hover:bg-slate-800"
            : "bg-white border hover:bg-slate-50";
    return (
        <button
            {...props}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm border ${toneCls} ${className}`}
        />
    );
};

export default function TemplatesListPage() {
    const router = useRouter();
    const [templates, setTemplates] = useState<TemplateRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [note, setNote] = useState("");

    async function loadTemplates() {
        setLoading(true);
        setNote("");
        try {
            const res = await fetch(`${API_BASE}/api/admin/templates`);
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setTemplates(Array.isArray(data) ? data : []);
        } catch (e: any) {
            setNote(`Помилка завантаження шаблонів: ${e.message}`);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadTemplates();
    }, []);

    async function createTemplate() {
        setLoading(true);
        setNote("");
        try {
            const res = await fetch(`${API_BASE}/api/admin/templates`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // ⚠️ тут підлаштуй під свій бекенд, якщо у тебе інший DTO
                body: JSON.stringify({
                    name: "Новий шаблон",
                    description: "Чернетка шаблону",
                }),
            });
            if (!res.ok) throw new Error(await res.text());
            const created: TemplateRow = await res.json();

            setNote("✅ Шаблон створено");
            // оновити список
            setTemplates((prev) => [...prev, created]);

            // одразу перейти до версій цього шаблону
            router.push(`/admin/templates/${created.id}/versions`);
        } catch (e: any) {
            setNote(`Помилка створення шаблону: ${e.message}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-6 space-y-6">
            <header className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Шаблони документів</h1>
                    <p className="text-sm text-slate-500">
                        Обери шаблон або створи новий, щоб налаштувати поля та версії.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {loading && (
                        <span className="inline-flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Обробка…
            </span>
                    )}
                    <Btn tone="primary" onClick={createTemplate} disabled={loading}>
                        <Plus className="h-4 w-4" />
                        Створити шаблон
                    </Btn>
                </div>
            </header>

            {note && (
                <div className="rounded-xl border bg-white p-3 text-sm">{note}</div>
            )}

            <section className="rounded-2xl border bg-white overflow-hidden">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                    <h2 className="text-lg font-medium">Список шаблонів</h2>
                    <span className="text-sm text-slate-500">
            всього: {templates.length}
          </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                        <tr className="text-left">
                            <th className="p-3 w-20">ID</th>
                            <th className="p-3">Назва</th>
                            <th className="p-3 w-36">Статус</th>
                            <th className="p-3 w-56">Створено</th>
                            <th className="p-3 w-40">Дія</th>
                        </tr>
                        </thead>
                        <tbody>
                        {templates.map((t) => (
                            <tr key={t.id} className="border-t">
                                <td className="p-3">#{t.id}</td>
                                <td className="p-3">{t.name}</td>
                                <td className="p-3">{t.status ?? "—"}</td>
                                <td className="p-3">{t.createdAt ?? "—"}</td>
                                <td className="p-3">
                                    <Btn
                                        onClick={() =>
                                            router.push(`/admin/templates/${t.id}/versions`)
                                        }
                                    >
                                        Відкрити →
                                    </Btn>
                                </td>
                            </tr>
                        ))}
                        {templates.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-6 text-center text-slate-500">
                                    Шаблонів поки немає. Натисни{" "}
                                    <b>«Створити шаблон»</b>, щоб додати перший.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
