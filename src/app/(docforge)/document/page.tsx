import { Suspense } from "react";
import GenerateDocForm from "./GenerateDocForm";

export default function Page() {
    return (
        <Suspense fallback={<div>Завантаження…</div>}>
            <GenerateDocForm />
        </Suspense>
    );
}
