"use client";

import React, {useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {Search, Filter, Globe, CheckCircle2, Clock, AlertCircle, ChevronRight, RefreshCw} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

type TemplateSummary = {
    templateId: number;
    templateKey: string;
    title: string;
    locale: string;
    // бекенд може віддавати latestVersion/status — але юзеру версії не показуємо
    latestVersion?: number | null;
    status: "PUBLISHED" | "DRAFT" | "ARCHIVED" | null;
};

function cx(...cls: (string | false | null | undefined)[]) {
    return cls.filter(Boolean).join(" ");
}
const localesOrder = ["uk", "en", "pl", "ro"];

function StatusBadge({status}: { status: TemplateSummary["status"] }) {
    if (status === "PUBLISHED") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 text-xs">
        <CheckCircle2 className="h-3.5 w-3.5" /> Published
      </span>
        );
    }
    if (status === "DRAFT") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 text-xs">
        <Clock className="h-3.5 w-3.5" /> Draft
      </span>
        );
    }
    if (status === "ARCHIVED") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 text-xs">
        <AlertCircle className="h-3.5 w-3.5" /> Archived
      </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 text-xs">
      <AlertCircle className="h-3.5 w-3.5" /> Unknown
    </span>
    );
}

function SkeletonCard({i}:{i:number}) {
    return (
        <div className="border rounded-2xl p-5 bg-white shadow-sm animate-pulse" key={`sk-${i}`}>
            <div className="h-4 w-32 bg-slate-200 rounded mb-3" />
            <div className="h-3 w-56 bg-slate-200 rounded mb-2" />
            <div className="h-3 w-24 bg-slate-200 rounded mb-4" />
            <div className="flex items-center justify-between">
                <div className="h-6 w-28 bg-slate-200 rounded-full" />
                <div className="h-9 w-28 bg-slate-200 rounded-lg" />
            </div>
        </div>
    );
}

export default function TemplatesCatalogPage() {
    const [items, setItems] = useState<TemplateSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState("");

    const [q, setQ] = useState("");
    const [locale, setLocale] = useState<"all" | string>("all");
    const [status, setStatus] = useState<"all" | "PUBLISHED" | "DRAFT" | "ARCHIVED">("all");

    async function load() {
        setLoading(true);
        setNote("");
        try {
            const res = await fetch(`${API_BASE}/api/templates`, {cache: "no-store"});
            if (!res.ok) throw new Error(await res.text());
            const data: TemplateSummary[] = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (e: any) {
            setNote(`Помилка завантаження: ${e.message}`);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    const filtered = useMemo(() => {
        const text = q.trim().toLowerCase();
        return items
            .filter(t => (locale === "all" ? true : t.locale === locale))
            .filter(t => (status === "all" ? true : t.status === status))
            .filter(t =>
                text === "" ||
                t.title?.toLowerCase().includes(text) ||
                t.templateKey.toLowerCase().includes(text) ||
                t.locale.toLowerCase().includes(text)
            )
            .sort((a, b) => {
                const ai = localesOrder.indexOf(a.locale);
                const bi = localesOrder.indexOf(b.locale);
                const lcmp = (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
                if (lcmp !== 0) return lcmp;
                return (a.title || "").localeCompare(b.title || "", "uk");
            });
    }, [items, q, locale, status]);

    const distinctLocales = useMemo(() => {
        const set = new Set(items.map(i => i.locale));
        return Array.from(set).sort(
            (a, b) => localesOrder.indexOf(a) - localesOrder.indexOf(b)
        );
    }, [items]);

    return (
        <div className="p-6 space-y-6">
            {/* header */}
            <div className="flex flex-wrap items-center gap-3 justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Docforge • Шаблони</h1>

                <div className="flex items-center gap-2">
                    <button
                        onClick={load}
                        className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm bg-white hover:bg-slate-50"
                        title="Оновити"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Оновити
                    </button>
                    <Link
                        href="/admin/templates"
                        className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm bg-white hover:bg-slate-50"
                    >
                        Адмінка
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>

            {/* filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Пошук за назвою, key, мовою…"
                        className="w-full pl-9 pr-3 py-2 rounded-lg border bg-white outline-none focus:ring-2 focus:ring-blue-200"
                    />
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                        <select
                            className="w-full pl-9 pr-3 py-2 rounded-lg border bg-white"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
                        >
                            <option value="all">Статус: всі</option>
                            <option value="PUBLISHED">Опубліковані</option>
                            <option value="DRAFT">Чернетки</option>
                            <option value="ARCHIVED">Архів</option>
                        </select>
                    </div>

                    <div className="relative flex-1">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                        <select
                            className="w-full pl-9 pr-3 py-2 rounded-lg border bg-white"
                            value={locale}
                            onChange={(e) => setLocale(e.target.value)}
                        >
                            <option value="all">Мова: всі</option>
                            {distinctLocales.map(l => (
                                <option key={`loc-${l}`} value={l}>{l}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="hidden md:block" />
            </div>

            {/* notes */}
            {note && (
                <div className="rounded-xl border bg-white p-3 text-sm text-red-700">
                    {note}
                </div>
            )}

            {/* grid */}
            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({length: 6}).map((_, i) => <SkeletonCard i={i} key={`skl-${i}`} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-2xl border bg-white p-10 text-center">
                    <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="text-lg font-medium">Нічого не знайдено</div>
                    <div className="text-sm text-slate-500">Спробуй інший запит або зміни фільтри.</div>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(t => {
                        // для юзера: просто використовуємо останню опубліковану на бекенді
                        const canFill = t.status === "PUBLISHED";
                        return (
                            <div
                                key={`card-${t.templateId}-${t.templateKey}`}
                                className={cx(
                                    "group border rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow",
                                    canFill ? "border-green-100" : "border-slate-200"
                                )}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="text-base font-semibold leading-tight">{t.title || "Без назви"}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">
                                            key: <span className="font-mono">{t.templateKey}</span>
                                        </div>
                                    </div>
                                    <StatusBadge status={t.status}/>
                                </div>

                                <div className="mt-3 flex items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-1 text-slate-600">
                    <Globe className="h-4 w-4" /> {t.locale}
                  </span>
                                </div>

                                <div className="mt-4 flex items-center gap-2">
                                    <Link
                                        className={cx(
                                            "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm border transition-colors",
                                            canFill
                                                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                                : "bg-white text-slate-400 border-slate-200 cursor-not-allowed"
                                        )}
                                        href={canFill ? `/document?key=${encodeURIComponent(t.templateKey)}` : "#"}
                                        aria-disabled={!canFill}
                                        onClick={e => { if (!canFill) e.preventDefault(); }}
                                    >
                                        Заповнити
                                    </Link>

                                    <Link
                                        className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm border bg-white hover:bg-slate-50"
                                        href={`/admin/templates/${t.templateId}`}
                                        title="Керувати версіями (для адміністраторів)"
                                    >
                                        Налаштувати <ChevronRight className="h-4 w-4 ml-1" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
