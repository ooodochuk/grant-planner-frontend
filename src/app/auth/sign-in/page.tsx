import type { Metadata } from "next";
import SignInClient from "@/app/auth/sign-in/sign-in-client";

export const metadata: Metadata = { title: "Sign in" };


export default function Page() {
  return <SignInClient />;
}
