"use client";

import React, {useCallback, useEffect, useMemo, useState} from "react";
import {useSearchParams} from "next/navigation";
import Link from "next/link";
import {format} from "date-fns";
import {Calendar as CalendarIcon, ArrowLeft} from "lucide-react";
import {cn} from "@/lib/utils";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export type FieldDef = {
    name: string;
    label?: string;
    type?: "string" | "number" | "boolean" | "date" | "array" | "enum";
    required?: boolean;
    pattern?: string;
    enumValues?: string;
};

export type FieldDefsResponse = {
    templateKey: string;
    version: number;
    fieldDefs: { fields: FieldDef[] };
    uiHints?: any;
};

const TYPE_LABELS: Record<string, string> = {
    string: "рядок",
    number: "число",
    boolean: "булеве",
    date: "дата",
    array: "масив",
    enum: "перелік",
};

function parseEnum(raw?: string): string[] {
    if (!raw) return [];
    try {
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr.map(String) : [];
    } catch {
        return [];
    }
}
function shouldTreatAsArray(f: FieldDef) {
    if (f.type === "array") return true;
    const n = (f.name || "").toLowerCase();
    return n === "attachments" || n.endsWith("attachments");
}
function isDateField(f: FieldDef) {
    if (f.type === "date") return true;
    const n = (f.name || "").toLowerCase();
    return n.includes("date");
}
function toISOFullDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
function parseToDate(v: any): Date | null {
    if (!v) return null;
    if (v instanceof Date && !isNaN(v.getTime())) return v;
    const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
        const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
        return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
}
function buildInitialValues(fields: FieldDef[]) {
    const init: Record<string, any> = {};
    for (const f of fields) {
        switch (f.type) {
            case "boolean": init[f.name] = false; break;
            case "array": init[f.name] = []; break;
            case "date": init[f.name] = null; break;
            default: init[f.name] = ""; break;
        }
    }
    return init;
}
function validateValues(fields: FieldDef[], values: Record<string, any>) {
    const errs: Record<string, string> = {};
    for (const f of fields) {
        const v = values[f.name];
        const type = f.type || "string";
        const isArr = shouldTreatAsArray(f);
        if (f.required) {
            const empty = isArr ? !v || v.length === 0 : type === "boolean" ? false : v === undefined || v === null || String(v).trim() === "";
            if (empty) errs[f.name] = "Обов'язкове поле";
        }
    }
    return errs;
}
function toPayload(fields: FieldDef[], values: Record<string, any>) {
    const data: Record<string, any> = {};
    for (const f of fields) {
        const type = f.type || "string";
        const isArr = shouldTreatAsArray(f);
        let v = values[f.name];
        if (type === "number" && v !== "" && v !== null) v = Number(v);
        if (isDateField(f)) {
            const d = parseToDate(v);
            v = d ? toISOFullDate(d) : "";
        }
        if (isArr) {
            if (Array.isArray(v)) v = v.map(String);
            else if (typeof v === "string") v = v.split(",").map((s) => s.trim()).filter(Boolean);
            else if (v == null || v === "") v = [];
            else v = [String(v)];
        }
        data[f.name] = v;
    }
    return data;
}
async function downloadBlobAsFile(res: Response, fallbackName: string) {
    const cd = res.headers.get("content-disposition");
    const filename = (() => {
        if (!cd) return fallbackName;
        const star = cd.match(/filename\*=UTF-8''([^;]+)$/i);
        if (star) return decodeURIComponent(star[1]);
        const simple = cd.match(/filename=\"?([^\";]+)\"?/i);
        return simple?.[1] || fallbackName;
    })();
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function useFieldSchema(templateKey?: string | null) {
    const [schema, setSchema] = useState<FieldDefsResponse | null>(null);
    const [values, setValues] = useState<Record<string, any>>({});
    const [note, setNote] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let ignore = false;
        (async () => {
            setNote("");
            setSchema(null);
            setValues({});
            if (!templateKey) {
                setNote("Не передано ?key у URL");
                return;
            }
            setLoading(true);
            try {
                const url = `${API_BASE}/api/templates/${encodeURIComponent(templateKey)}/field-defs`;
                const res = await fetch(url, {cache: "no-store"});
                if (!res.ok) {
                    setNote(`Не знайдено опубліковану версію для ${templateKey}`);
                    return;
                }
                const data: FieldDefsResponse = await res.json();
                if (!ignore) {
                    setSchema(data);
                    setValues(buildInitialValues(data.fieldDefs?.fields || []));
                }
            } catch (e: any) {
                setNote(`Помилка завантаження схеми: ${e.message}`);
            } finally {
                !ignore && setLoading(false);
            }
        })();
        return () => {
            ignore = true;
        };
    }, [templateKey]);

    return {schema, values, setValues, note, setNote, loading};
}

const LabelWithType: React.FC<{text: string; type?: string; required?: boolean}> = ({text, type, required}) => (
    <div className="text-sm text-gray-600 mb-1">
        {text}
        {required && " *"} {type && <span className="text-gray-400">({TYPE_LABELS[type] || type})</span>}
    </div>
);

const DateField: React.FC<{label: string; value: any; onChange: (v: any) => void; required?: boolean; error?: string}> = ({
                                                                                                                              label,
                                                                                                                              value,
                                                                                                                              onChange,
                                                                                                                              required,
                                                                                                                              error,
                                                                                                                          }) => {
    const selected: Date | null = parseToDate(value);
    return (
        <div className="flex flex-col gap-1">
            <LabelWithType text={label} type="date" required={required} />
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !selected && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selected ? format(selected, "yyyy-MM-dd") : <span>Оберіть дату</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                    <Calendar mode="single" selected={selected ?? undefined} onSelect={(d: any) => onChange(d ?? null)} initialFocus />
                </PopoverContent>
            </Popover>
            {error && <div className="text-red-600 text-sm">{error}</div>}
        </div>
    );
};

const FieldRenderer: React.FC<{f: FieldDef; value: any; onChange: (v: any) => void; error?: string}> = ({f, value, onChange, error}) => {
    const label = f.label || f.name;
    const isArr = shouldTreatAsArray(f);
    if (f.type === "boolean")
        return (
            <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
                <span>
                    {label}
                    {f.required && " *"} <span className="text-gray-400">(булеве)</span>
                </span>
                {error && <span className="text-red-600 text-sm ml-2">{error}</span>}
            </label>
        );
    if (f.type === "enum")
        return (
            <label className="block">
                <LabelWithType text={label} type="перелік" required={f.required} />
                <select className="border rounded-lg px-3 py-2 w-full" value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
                    <option value="">—</option>
                    {parseEnum(f.enumValues).map((o) => (
                        <option key={o} value={o}>
                            {o}
                        </option>
                    ))}
                </select>
                {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
            </label>
        );
    if (isArr)
        return (
            <label className="block">
                <LabelWithType text={label} type="масив" required={f.required} />
                <input
                    className="border rounded-lg px-3 py-2 w-full"
                    value={(value || []).join(", ")}
                    onChange={(e) => onChange(e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))}
                />
                {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
            </label>
        );
    if (isDateField(f)) return <DateField label={label} value={value} onChange={onChange} required={f.required} error={error} />;
    const isNumber = f.type === "number";
    return (
        <label className="block">
            <LabelWithType text={label} type={isNumber ? "число" : "рядок"} required={f.required} />
            <input
                type={isNumber ? "number" : "text"}
                className="border rounded-lg px-3 py-2 w-full"
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
            />
            {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
        </label>
    );
};

export default function GenerateDocForm() {
    const searchParams = useSearchParams();
    const templateKey = searchParams.get("key") || "";
    const {schema, values, setValues, note, setNote, loading} = useFieldSchema(templateKey || null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const fields = useMemo(() => schema?.fieldDefs?.fields || [], [schema]);
    const setValue = useCallback((n: string, v: any) => setValues((prev) => ({...prev, [n]: v})), [setValues]);

    const handleSubmit = useCallback(async () => {
        setNote("");
        const errs = validateValues(fields, values);
        setErrors(errs);
        if (Object.keys(errs).length > 0) {
            setNote("Перевір поля форми");
            return;
        }
        const data = toPayload(fields, values);
        try {
            const res = await fetch(`${API_BASE}/api/documents/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                },
                body: JSON.stringify({templateKey, data}),
            });
            if (!res.ok) {
                const t = await res.text();
                throw new Error(`${res.status} ${t}`);
            }
            await downloadBlobAsFile(res, `${templateKey}.docx`);
            setNote("✅ Файл завантажено");
        } catch (e: any) {
            setNote(`Помилка: ${e.message}`);
        }
    }, [fields, values, templateKey, setNote]);

    const missingKey = !templateKey;

    return (
        <div className="p-6 space-y-6">
            {/* верхнє меню / breadcrumbs */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Link
                        href="/templates"
                        className="inline-flex items-center rounded-lg border px-3 py-2 text-sm bg-white hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" /> До шаблонів
                    </Link>
                    <span className="text-slate-300">/</span>
                    <span className="text-sm text-slate-600">Генерація документа</span>
                </div>
                <div className="text-sm text-gray-500">
                    key: <code>{templateKey || "—"}</code>
                </div>
            </div>

            <div className="p-4 border rounded-xl bg-white space-y-4">
                {missingKey && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        Не передано параметр <code>?key=…</code>. Повернись до каталогу та обери шаблон.
                    </div>
                )}

                {!schema && !missingKey && <div className="text-sm text-gray-500">Завантаження схеми…</div>}
                {note && <div className="text-sm text-gray-600">{note}</div>}

                {schema && !missingKey && (
                    <div className="space-y-4">
                        {fields.length === 0 && <div className="text-sm text-gray-500">Для шаблону немає полів.</div>}
                        {fields.map((f) => (
                            <FieldRenderer key={f.name} f={f} value={values[f.name]} onChange={(v) => setValue(f.name, v)} error={errors[f.name]} />
                        ))}
                    </div>
                )}

                <button
                    className="px-4 py-2 border rounded-lg bg-blue-600 text-white disabled:opacity-50"
                    onClick={handleSubmit}
                    disabled={loading || !schema || missingKey}
                >
                    {loading ? "Генеруємо…" : "Згенерувати"}
                </button>
            </div>
        </div>
    );
}
