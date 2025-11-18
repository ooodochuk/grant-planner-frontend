"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
    Loader2,
    UploadCloud,
    Save,
    ChevronUp,
    ChevronDown,
    Trash2,
} from "lucide-react";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

// ===== types =====
type VersionRow = {
    id: number; // може й далі приходити, але не використовуємо в ендпоінтах
    version: number;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | string;
    publishedAt?: string | null;
};

type FieldDef = {
    name: string;
    label?: string;
    type?: "string" | "number" | "boolean" | "date" | "array" | "enum";
    required?: boolean;
    pattern?: string;
    enumValues?: string;
};

// ===== helpers & validators =====
const EMPTY_FIELD = (): FieldDef => ({
    name: "",
    label: "",
    type: "string",
    required: false,
    pattern: "",
    enumValues: "[]",
});
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

function validateField(f: FieldDef): Record<string, string> {
    const e: Record<string, string> = {};
    if (!f.name?.trim()) e.name = "Обов'язково";
    if (f.type === "enum") {
        try {
            const v = JSON.parse(f.enumValues || "[]");
            if (!Array.isArray(v)) throw new Error("not array");
        } catch {
            e.enumValues = "JSON-масив рядків";
        }
    }
    if (f.pattern) {
        try {
            new RegExp(f.pattern);
        } catch {
            e.pattern = "Некоректний RegExp";
        }
    }
    return e;
}

// ===== small UI atoms =====
const Btn: React.FC<
    React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "default" | "danger" | "subtle" }
> = ({ className = "", tone = "default", ...props }) => {
    const toneCls =
        tone === "danger"
            ? "border-red-200 text-red-700 hover:bg-red-50"
            : tone === "subtle"
                ? "bg-white hover:bg-slate-50"
                : "bg-white hover:bg-slate-50";
    return (
        <button
            {...props}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${toneCls} ${className}`}
        />
    );
};

const Badge: React.FC<{ color: "gray" | "green" | "yellow" | "red"; children: React.ReactNode }> = ({
                                                                                                        color,
                                                                                                        children,
                                                                                                    }) => {
    const map: Record<string, string> = {
        gray: "bg-slate-100 text-slate-700 border-slate-200",
        green: "bg-green-50 text-green-700 border-green-200",
        yellow: "bg-amber-50 text-amber-800 border-amber-200",
        red: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return (
        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs ${map[color]}`}>
      {children}
    </span>
    );
};

const Toggle: React.FC<{
    id: string;
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}> = ({ id, label, checked, onChange }) => (
    <label htmlFor={id} className="inline-flex items-center gap-2 cursor-pointer">
        <input id={id} type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-5 w-9 rounded-full bg-slate-200 peer-checked:bg-slate-900 relative transition">
      <span className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-4" />
    </span>
        <span className="text-sm">{label}</span>
    </label>
);

const Hint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="mt-1 text-xs text-slate-400">{children}</div>
);

// chips editor for enum
const EnumChips: React.FC<{
    value: string;
    onChange: (json: string) => void;
    disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
    let items: string[] = [];
    try {
        const v = JSON.parse(value || "[]");
        if (Array.isArray(v)) items = v.map(String);
    } catch {
        // ignore invalid json here; UI still works on add/remove
    }
    const [input, setInput] = useState("");

    const add = () => {
        const v = input.trim();
        if (!v) return;
        const next = Array.from(new Set([...items, v]));
        onChange(JSON.stringify(next));
        setInput("");
    };
    const remove = (i: number) => {
        const next = items.filter((_, idx) => idx !== i);
        onChange(JSON.stringify(next));
    };

    return (
        <div className={`rounded-lg border p-2 ${disabled ? "pointer-events-none opacity-60" : ""}`}>
            <div className="flex flex-wrap gap-2">
                {items.map((x, i) => (
                    <span key={`${x}-${i}`} className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs bg-slate-50">
            {x}
                        <button type="button" onClick={() => remove(i)} className="text-slate-400 hover:text-slate-700">
              ×
            </button>
          </span>
                ))}
            </div>
            <div className="mt-2 flex gap-2">
                <input
                    className="flex-1 rounded-lg border px-3 py-2 text-sm"
                    placeholder="нове значення…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            add();
                        }
                    }}
                />
                <Btn onClick={add}>Додати</Btn>
            </div>
            <Hint>Значення зберігаються як JSON-масив рядків.</Hint>
        </div>
    );
};

// ===== Field Row (improved) =====
const FieldRow: React.FC<{
    value: FieldDef;
    index: number;
    onChange: (next: FieldDef) => void;
    onRemove: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}> = ({ value, index, onChange, onRemove, onMoveUp, onMoveDown }) => {
    const errs = validateField(value);
    const [adv, setAdv] = useState(false);
    const valid = Object.keys(errs).length === 0;

    const defaultPattern =
        value.type === "number"
            ? "^\\d+(?:[.,]\\d+)?$"
            : value.type === "date"
                ? "^\\d{4}-\\d{2}-\\d{2}$"
                : "^.{1,100}$";

    const handleName = (name: string) => {
        const shouldAuto = !value.label || value.label.trim() === "";

        const autoLabel = name
            .replace(/[_\-]/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

        onChange({
            ...value,
            name,
            label: shouldAuto ? autoLabel : value.label,
        });
    };

    return (
        <div className="rounded-2xl border p-4 bg-white shadow-sm">
            {/* header controls */}
            <div className="flex items-center gap-3 mb-3">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-xs text-slate-600">
          {index + 1}
        </span>

                <input
                    className={`rounded-lg border px-3 py-2 text-sm w-48 ${errs.name ? "border-red-500" : ""}`}
                    placeholder="name"
                    value={value.name}
                    onChange={(e) => handleName(e.target.value)}
                />
                <input
                    className="rounded-lg border px-3 py-2 text-sm w-56"
                    placeholder="label"
                    value={value.label || ""}
                    onChange={(e) => onChange({ ...value, label: e.target.value })}
                />
                <select
                    className="rounded-lg border px-3 py-2 text-sm"
                    value={value.type || "string"}
                    onChange={(e) =>
                        onChange({
                            ...value,
                            type: e.target.value as FieldDef["type"],
                            pattern: "",
                            enumValues: e.target.value === "enum" ? value.enumValues || "[]" : "",
                        })
                    }
                >
                    {(["string", "number", "boolean", "date", "array", "enum"] as const).map((t) => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                    ))}
                </select>
                <Toggle
                    id={`req-${index}`}
                    label="required"
                    checked={!!value.required}
                    onChange={(v) => onChange({ ...value, required: v })}
                />
                <Badge color={valid ? "green" : "yellow"}>{valid ? "OK" : "Є помилки"}</Badge>

                <div className="ml-auto inline-flex gap-1">
                    <Btn onClick={() => setAdv((v) => !v)} title="Advanced" className="px-2 py-1">
                        {adv ? "▴" : "▾"}
                    </Btn>
                    <Btn onClick={onMoveUp} className="px-2 py-1" title="Вгору">
                        <ChevronUp className="h-4 w-4" />
                    </Btn>
                    <Btn onClick={onMoveDown} className="px-2 py-1" title="Вниз">
                        <ChevronDown className="h-4 w-4" />
                    </Btn>
                    <Btn onClick={onRemove} tone="danger" className="px-2 py-1" title="Видалити">
                        <Trash2 className="h-4 w-4" />
                    </Btn>
                </div>
            </div>

            {/* quick context */}
            {value.type === "enum" && (
                <div className="mb-3">
                    <div className="mb-1 text-sm text-slate-600">enum значення</div>
                    <EnumChips
                        value={value.enumValues || "[]"}
                        onChange={(json) => onChange({ ...value, enumValues: json })}
                    />
                    {errs.enumValues && <div className="mt-1 text-xs text-rose-600">JSON-масив рядків</div>}
                </div>
            )}
            {value.type === "date" && (
                <Hint>Очікуваний формат: <code className="font-mono">YYYY-MM-DD</code>. За потреби задай власний pattern у “Advanced”.</Hint>
            )}
            {value.type === "boolean" && <Hint>Булеве поле не потребує pattern/enum.</Hint>}

            {/* advanced */}
            {adv && (
                <div className="mt-4 grid grid-cols-12 gap-3">
                    <div className="col-span-12 md:col-span-6">
                        <div className="mb-1 text-sm text-slate-600">pattern (RegExp)</div>
                        <input
                            className={`w-full rounded-lg border px-3 py-2 ${errs.pattern ? "border-rose-500" : ""}`}
                            placeholder={defaultPattern}
                            value={value.pattern || ""}
                            onChange={(e) => onChange({ ...value, pattern: e.target.value })}
                        />
                        {errs.pattern ? (
                            <div className="mt-1 text-xs text-rose-600">Некоректний RegExp</div>
                        ) : (
                            <Hint>
                                приклад: <code className="font-mono">{defaultPattern}</code>
                            </Hint>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            {[
                                ["Текст ≤100", "^.{1,100}$"],
                                ["Ціле", "^\\d+$"],
                                ["Дійсне", "^\\d+(?:[.,]\\d+)?$"],
                                ["Дата ISO", "^\\d{4}-\\d{2}-\\d{2}$"],
                            ].map(([lbl, pat]) => (
                                <button
                                    key={lbl}
                                    type="button"
                                    className="rounded-full border px-2 py-1 hover:bg-slate-50"
                                    onClick={() => onChange({ ...value, pattern: String(pat) })}
                                >
                                    {lbl}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="col-span-12 md:col-span-6">
                        <div className="mb-1 text-sm text-slate-600">enumValues (JSON)</div>
                        <EnumChips
                            value={value.enumValues || (value.type === "enum" ? "[]" : "")}
                            onChange={(json) => onChange({ ...value, enumValues: json })}
                            disabled={value.type !== "enum"}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// ===== Main Page =====
export default function TemplateVersionsPage() {
    const params = useParams<{ templateId: string }>();
    const templateId = Number(params.templateId);

    const [versions, setVersions] = useState<VersionRow[]>([]);
    const [selected, setSelected] = useState<VersionRow | null>(null);

    const [fields, setFields] = useState<FieldDef[]>([]);
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    const hasErrors = useMemo(
        () => fields.some((f) => Object.keys(validateField(f)).length > 0),
        [fields]
    );

    // load versions list
    useEffect(() => {
        (async () => {
            setLoading(true);
            setNote("");
            try {
                const res = await fetch(
                    `${API_BASE}/api/admin/templates/${templateId}/versions`
                );
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                setVersions(Array.isArray(data) ? data : []);
            } catch (e: any) {
                setNote(`Помилка завантаження версій: ${e.message}`);
            } finally {
                setLoading(false);
            }
        })();
    }, [templateId]);

    async function openVersion(v: VersionRow) {
        setSelected(v);
        setNote("");
        setLoading(true);
        try {
            const res = await fetch(
                `${API_BASE}/api/admin/templates/${templateId}/versions/${v.version}`
            );
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setFields(clone(data.fieldDefs?.fields || []));
        } catch (e: any) {
            setNote(`Помилка завантаження полів: ${e.message}`);
        } finally {
            setLoading(false);
        }
    }

    // reorder
    const moveUp = (i: number) =>
        setFields((prev) => {
            if (i <= 0) return prev;
            const next = clone(prev);
            [next[i - 1], next[i]] = [next[i], next[i - 1]];
            return next;
        });
    const moveDown = (i: number) =>
        setFields((prev) => {
            if (i >= prev.length - 1) return prev;
            const next = clone(prev);
            [next[i + 1], next[i]] = [next[i], next[i + 1]];
            return next;
        });

    const addField = () => setFields((p) => [...p, EMPTY_FIELD()]);
    const removeField = (i: number) =>
        setFields((p) => p.filter((_, idx) => idx !== i));

    async function saveFields() {
        if (!selected) return;
        setLoading(true);
        setNote("");
        try {
            const res = await fetch(
                `${API_BASE}/api/admin/templates/${templateId}/versions/${selected.version}/fields`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ fields }),
                }
            );
            if (!res.ok) throw new Error(await res.text());
            setNote("✅ Поля збережено");
        } catch (e: any) {
            setNote(`Помилка збереження: ${e.message}`);
        } finally {
            setLoading(false);
        }
    }

    async function publish() {
        if (!selected) return;
        setLoading(true);
        setNote("");
        try {
            const res = await fetch(
                `${API_BASE}/api/admin/templates/${templateId}/versions/${selected.version}/publish`,
                { method: "POST" }
            );
            if (!res.ok) throw new Error(await res.text());
            setNote("🚀 Опубліковано");

            // refresh versions list
            const r = await fetch(
                `${API_BASE}/api/admin/templates/${templateId}/versions`
            );
            if (r.ok) {
                const data: VersionRow[] = await r.json();
                setVersions(data);
                const updated = data.find((v) => v.version === selected.version);
                if (updated) setSelected(updated);
            }
        } catch (e: any) {
            setNote(`Помилка публікації: ${e.message}`);
        } finally {
            setLoading(false);
        }
    }

    async function archiveVersion(version: number) {
        if (!confirm("Архівувати цю версію?")) return;
        setLoading(true);
        setNote("");
        try {
            const res = await fetch(
                `${API_BASE}/api/admin/templates/${templateId}/versions/${version}/archive`,
                { method: "POST" }
            );
            if (!res.ok) throw new Error(await res.text());
            setNote("✅ Версію заархівовано");
            const r = await fetch(
                `${API_BASE}/api/admin/templates/${templateId}/versions`
            );
            if (r.ok) {
                const data: VersionRow[] = await r.json();
                setVersions(data);
                if (selected?.version === version) {
                    const upd = data.find((v) => v.version === version);
                    if (upd) setSelected(upd);
                }
            }
            // eslint-disable-next-line no-empty
        } catch (e: any) {
            setNote(`Помилка архівації версії: ${e.message}`);
        } finally {
            setLoading(false);
        }
    }

    async function unarchiveVersion(version: number) {
        if (!confirm("Повернути версію з архіву?")) return;
        setLoading(true);
        setNote("");
        try {
            const res = await fetch(
                `${API_BASE}/api/admin/templates/${templateId}/versions/${version}/unarchive`,
                { method: "POST" }
            );
            if (!res.ok) throw new Error(await res.text());
            setNote("✅ Версію повернено з архіву");
            const r = await fetch(
                `${API_BASE}/api/admin/templates/${templateId}/versions`
            );
            if (r.ok) {
                const data: VersionRow[] = await r.json();
                setVersions(data);
                if (selected?.version === version) {
                    const upd = data.find((v) => v.version === version);
                    if (upd) setSelected(upd);
                }
            }
        } catch (e: any) {
            setNote(`Помилка розархівації версії: ${e.message}`);
        } finally {
            setLoading(false);
        }
    }

    const selectedIsArchived = selected?.status === "ARCHIVED";

    // ===== render =====
    return (
        <div className="p-6 space-y-6">
            <header className="flex items-end justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Шаблон #{templateId}</h1>
                    <p className="text-sm text-slate-500">Керування версіями та полями</p>
                </div>
                {loading && (
                    <span className="inline-flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Обробка…
          </span>
                )}
            </header>

            {note && (
                <div className="rounded-xl border bg-white p-3 text-sm">{note}</div>
            )}

            {/* Секція 1: Версії */}
            <section className="rounded-2xl border bg-white overflow-hidden">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                    <h2 className="text-lg font-medium">Версії</h2>
                    <span className="text-sm text-slate-500">всього: {versions.length}</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                        <tr className="text-left">
                            <th className="p-3 w-24">Version</th>
                            <th className="p-3 w-36">Status</th>
                            <th className="p-3 w-56">Published</th>
                            <th className="p-3">Дія</th>
                        </tr>
                        </thead>
                        <tbody>
                        {versions.map((v) => {
                            const st =
                                v.status === "PUBLISHED"
                                    ? "green"
                                    : v.status === "ARCHIVED"
                                        ? "red"
                                        : "yellow";
                            return (
                                <tr key={v.version} className="border-t">
                                    <td className="p-3">#{v.version}</td>
                                    <td className="p-3">
                                        <Badge color={st as any}>{v.status}</Badge>
                                    </td>
                                    <td className="p-3">{v.publishedAt ?? "—"}</td>
                                    <td className="p-3">
                                        <div className="flex flex-wrap gap-2">
                                            <Btn onClick={() => openVersion(v)}>Редагувати →</Btn>
                                            {v.status === "ARCHIVED" ? (
                                                <Btn onClick={() => unarchiveVersion(v.version)}>
                                                    Повернути
                                                </Btn>
                                            ) : (
                                                <Btn onClick={() => archiveVersion(v.version)} tone="danger">
                                                    Архівувати
                                                </Btn>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {versions.length === 0 && (
                            <tr>
                                <td className="p-6 text-center text-slate-500" colSpan={4}>
                                    Версій немає
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Секція 2: Деталі вибраної версії */}
            {selected && (
                <section className="rounded-2xl border bg-white">
                    <div className="px-4 py-3 border-b flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-medium">
                                Версія #{selected.version}
                            </h2>
                            <Badge
                                color={
                                    selected.status === "PUBLISHED"
                                        ? "green"
                                        : selected.status === "ARCHIVED"
                                            ? "red"
                                            : "yellow"
                                }
                            >
                                {selected.status}
                            </Badge>
                        </div>
                        <div className="flex gap-2">
                            {selectedIsArchived ? (
                                <Btn onClick={() => unarchiveVersion(selected.version)}>
                                    Повернути з архіву
                                </Btn>
                            ) : (
                                <Btn onClick={() => archiveVersion(selected.version)} tone="danger">
                                    Архівувати версію
                                </Btn>
                            )}
                            <Btn onClick={saveFields} disabled={loading || hasErrors}>
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                Зберегти
                            </Btn>
                            <Btn
                                onClick={publish}
                                disabled={loading || hasErrors || selectedIsArchived}
                                title={selectedIsArchived ? "Спершу розархівуй цю версію" : "Опублікувати"}
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <UploadCloud className="h-4 w-4" />
                                )}
                                Опублікувати
                            </Btn>
                        </div>
                    </div>

                    {/* Секція 3: Поля */}
                    <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-600">Полів: {fields.length}</div>
                            <Btn onClick={addField}>Додати поле +</Btn>
                        </div>

                        <div className="space-y-3">
                            {fields.map((f, i) => (
                                <FieldRow
                                    key={`row-${i}-${f.name || "new"}`}
                                    value={f}
                                    index={i}
                                    onChange={(next) =>
                                        setFields((prev) => prev.map((p, idx) => (idx === i ? next : p)))
                                    }
                                    onRemove={() => removeField(i)}
                                    onMoveUp={() => moveUp(i)}
                                    onMoveDown={() => moveDown(i)}
                                />
                            ))}
                        </div>

                        {hasErrors && (
                            <div className="rounded-lg border bg-amber-50 text-amber-900 text-sm p-3">
                                Є помилки у полях — перевір <b>name / enum / pattern</b>.
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
