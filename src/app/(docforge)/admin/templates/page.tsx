"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { RefreshCw, Plus, ChevronDown, ChevronRight } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

type TemplateRow = {
    id: number;
    templateKey: string;
    title?: string;
    locale?: string;
    latestVersion?: number | null;
    publishedVersion?: number | null;
    status?: string | null;      // "ARCHIVED" коли в архіві (за потреби)
    archived?: boolean | null;   // або просто true/false
};

type VersionRow = {
    id: number;
    version: number;
    status: "PUBLISHED" | "DRAFT" | "ARCHIVED" | string;
    publishedAt?: string | null;
};

export default function TemplatesIndexPage() {
    const [items, setItems] = useState<TemplateRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [note, setNote] = useState("");

    // версії по шаблону
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [versionsByTemplate, setVersionsByTemplate] = useState<Record<number, VersionRow[]>>({});
    const [loadingVersions, setLoadingVersions] = useState<Record<number, boolean>>({});

    const load = async () => {
        setLoading(true);
        setNote("");
        try {
            const res = await fetch(`${API_BASE}/api/admin/templates`, { cache: "no-store" });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (e: any) {
            setNote(`Помилка завантаження: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    async function archiveTemplate(id: number) {
        if (!confirm("Перемістити шаблон у архів?")) return;
        setLoading(true);
        setNote("");
        try {
            const res = await fetch(`${API_BASE}/api/admin/templates/${id}/archive`, { method: "POST" });
            if (!res.ok) throw new Error(await res.text());
            setNote("✅ Шаблон заархівовано");
            await load();
        } catch (e: any) {
            setNote(`Помилка архівації: ${e.message}`);
            setLoading(false);
        }
    }

    async function unarchiveTemplate(id: number) {
        if (!confirm("Повернути шаблон з архіву?")) return;
        setLoading(true);
        setNote("");
        try {
            const res = await fetch(`${API_BASE}/api/admin/templates/${id}/unarchive`, { method: "POST" });
            if (!res.ok) throw new Error(await res.text());
            setNote("✅ Шаблон повернено з архіву");
            await load();
        } catch (e: any) {
            setNote(`Помилка розархівації: ${e.message}`);
            setLoading(false);
        }
    }

    async function toggleVersions(templateId: number) {
        // згорнути
        if (expandedId === templateId) {
            setExpandedId(null);
            return;
        }
        setExpandedId(templateId);
        // якщо вже завантажені — не тягнемо вдруге
        if (versionsByTemplate[templateId]?.length) return;
        setLoadingVersions(prev => ({ ...prev, [templateId]: true }));
        try {
            const res = await fetch(`${API_BASE}/api/admin/templates/${templateId}/versions`, { cache: "no-store" });
            if (!res.ok) throw new Error(await res.text());
            const data: VersionRow[] = await res.json();
            setVersionsByTemplate(prev => ({ ...prev, [templateId]: Array.isArray(data) ? data : [] }));
        } catch (e: any) {
            setNote(`Помилка завантаження версій: ${e.message}`);
        } finally {
            setLoadingVersions(prev => ({ ...prev, [templateId]: false }));
        }
    }

    async function archiveVersion(templateId: number, versionId: number) {
        if (!confirm("Архівувати цю версію?")) return;
        setLoadingVersions(prev => ({ ...prev, [templateId]: true }));
        setNote("");
        try {
            const res = await fetch(`${API_BASE}/api/admin/templates/versions/${versionId}/archive`, { method: "POST" });
            if (!res.ok) throw new Error(await res.text());
            // оновити список версій
            await reloadVersions(templateId);
            setNote("✅ Версію заархівовано");
        } catch (e: any) {
            setNote(`Помилка архівації версії: ${e.message}`);
        } finally {
            setLoadingVersions(prev => ({ ...prev, [templateId]: false }));
        }
    }

    async function unarchiveVersion(templateId: number, versionId: number) {
        if (!confirm("Повернути версію з архіву?")) return;
        setLoadingVersions(prev => ({ ...prev, [templateId]: true }));
        setNote("");
        try {
            const res = await fetch(`${API_BASE}/api/admin/templates/versions/${versionId}/unarchive`, { method: "POST" });
            if (!res.ok) throw new Error(await res.text());
            // оновити список версій
            await reloadVersions(templateId);
            setNote("✅ Версію повернено з архіву");
        } catch (e: any) {
            setNote(`Помилка розархівації версії: ${e.message}`);
        } finally {
            setLoadingVersions(prev => ({ ...prev, [templateId]: false }));
        }
    }

    async function reloadVersions(templateId: number) {
        try {
            const res = await fetch(`${API_BASE}/api/admin/templates/${templateId}/versions`, { cache: "no-store" });
            if (!res.ok) throw new Error(await res.text());
            const data: VersionRow[] = await res.json();
            setVersionsByTemplate(prev => ({ ...prev, [templateId]: Array.isArray(data) ? data : [] }));
        } catch (e) {
            // помилку вже покажемо у setNote із місця виклику
        }
    }

    return (
        <div className="p-6 space-y-4">
            {/* header */}
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl font-semibold">Docforge • Шаблони</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={load}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm bg-white hover:bg-slate-50 disabled:opacity-50"
                        title="Оновити"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Оновити
                    </button>

                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-emerald-600 text-white hover:bg-emerald-700"
                        title="Створити новий шаблон"
                    >
                        <Plus className="h-4 w-4" />
                        Додати шаблон
                    </Link>
                </div>
            </div>

            {note && <div className="p-3 border rounded-xl bg-white text-sm">{note}</div>}

            <div className="border rounded-xl bg-white overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                    <tr className="text-left">
                        <th className="p-3 w-12"></th>
                        <th className="p-3">ID</th>
                        <th className="p-3">Template key</th>
                        <th className="p-3">Title</th>
                        <th className="p-3">Locale</th>
                        <th className="p-3">Latest</th>
                        <th className="p-3">Published</th>
                        <th className="p-3">Статус</th>
                        <th className="p-3">Дія</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items.map((t) => {
                        const isArchived = (t.archived ?? false) || (t.status === "ARCHIVED");
                        const isExpanded = expandedId === t.id;
                        const isLoadingVersions = !!loadingVersions[t.id];

                        return (
                            <React.Fragment key={t.id}>
                                <tr className={isArchived ? "border-t bg-slate-50 opacity-80" : "border-t"}>
                                    <td className="p-3">
                                        <button
                                            className="rounded border px-2 py-1 bg-white hover:bg-slate-50"
                                            onClick={() => toggleVersions(t.id)}
                                            title={isExpanded ? "Згорнути версії" : "Показати версії"}
                                        >
                                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        </button>
                                    </td>
                                    <td className="p-3">{t.id}</td>
                                    <td className="p-3 font-mono">{t.templateKey}</td>
                                    <td className="p-3">{t.title ?? "—"}</td>
                                    <td className="p-3">{t.locale ?? "—"}</td>
                                    <td className="p-3">{t.latestVersion ?? "—"}</td>
                                    <td className="p-3">{t.publishedVersion ?? "—"}</td>
                                    <td className="p-3">
                                        {isArchived ? (
                                            <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-xs">
                          Archived
                        </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 text-xs">
                          Active
                        </span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex flex-wrap gap-2">
                                            <Link
                                                href={`/admin/templates/${t.id}`}
                                                className="rounded-lg px-3 py-1 border bg-gray-50 hover:bg-gray-100"
                                            >
                                                Відкрити версії →
                                            </Link>

                                            {isArchived ? (
                                                <button
                                                    onClick={() => unarchiveTemplate(t.id)}
                                                    disabled={loading}
                                                    className="rounded-lg px-3 py-1 border bg-white hover:bg-slate-50"
                                                    title="Повернути з архіву"
                                                >
                                                    Повернути
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => archiveTemplate(t.id)}
                                                    disabled={loading}
                                                    className="rounded-lg px-3 py-1 border bg-white hover:bg-slate-50 text-red-600 border-red-200"
                                                    title="Архівувати"
                                                >
                                                    Архівувати
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>

                                {/* expanded row with versions */}
                                {isExpanded && (
                                    <tr className="border-t bg-slate-50/60">
                                        <td className="p-0" colSpan={9}>
                                            <div className="p-3">
                                                {isLoadingVersions ? (
                                                    <div className="text-sm text-slate-500">Завантаження версій…</div>
                                                ) : (versionsByTemplate[t.id]?.length ?? 0) === 0 ? (
                                                    <div className="text-sm text-slate-500">Версій поки немає.</div>
                                                ) : (
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-sm bg-white border rounded-lg overflow-hidden">
                                                            <thead className="bg-slate-100">
                                                            <tr className="text-left">
                                                                <th className="p-2">Version</th>
                                                                <th className="p-2">Status</th>
                                                                <th className="p-2">Published at</th>
                                                                <th className="p-2">Дія</th>
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            {versionsByTemplate[t.id]!.map(v => {
                                                                const vArchived = v.status === "ARCHIVED";
                                                                return (
                                                                    <tr key={`v-${v.id}`} className="border-t">
                                                                        <td className="p-2">#{v.version}</td>
                                                                        <td className="p-2">
                                          <span
                                              className={
                                                  v.status === "PUBLISHED"
                                                      ? "inline-flex items-center rounded-full bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 text-xs"
                                                      : v.status === "DRAFT"
                                                          ? "inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 text-xs"
                                                          : v.status === "ARCHIVED"
                                                              ? "inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-xs"
                                                              : "inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-xs"
                                              }
                                          >
                                            {v.status}
                                          </span>
                                                                        </td>
                                                                        <td className="p-2">{v.publishedAt ?? "—"}</td>
                                                                        <td className="p-2">
                                                                            <div className="flex flex-wrap gap-2">
                                                                                <Link
                                                                                    href={`/admin/templates/${t.id}?version=${v.version}`}
                                                                                    className="rounded px-2 py-1 border bg-gray-50 hover:bg-gray-100"
                                                                                >
                                                                                    Відкрити
                                                                                </Link>
                                                                                {vArchived ? (
                                                                                    <button
                                                                                        onClick={() => unarchiveVersion(t.id, v.id)}
                                                                                        disabled={!!loadingVersions[t.id]}
                                                                                        className="rounded px-2 py-1 border bg-white hover:bg-slate-50"
                                                                                    >
                                                                                        Повернути
                                                                                    </button>
                                                                                ) : (
                                                                                    <button
                                                                                        onClick={() => archiveVersion(t.id, v.id)}
                                                                                        disabled={!!loadingVersions[t.id]}
                                                                                        className="rounded px-2 py-1 border bg-white hover:bg-slate-50 text-red-600 border-red-200"
                                                                                    >
                                                                                        Архівувати
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                    {!loading && items.length === 0 && (
                        <tr>
                            <td className="p-6 text-center text-gray-500" colSpan={9}>
                                Немає шаблонів
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
