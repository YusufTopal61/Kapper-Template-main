"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginInput } from "../domain/auth.schema";
import { signInAction } from "./auth.actions";

/** View model van het inlogscherm: formulierstaat, versturen en doorsturen naar het beheer. */
export function useLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const submit = form.handleSubmit((values) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await signInAction(values);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        // Verse server-render, zodat de beheer-layout de nieuwe sessie ziet.
        router.replace("/admin");
        router.refresh();
      } catch {
        setError("Inloggen mislukte. Probeer het zo nog eens.");
      }
    });
  });

  return { form, error, isPending, submit, clearError: () => setError(null) };
}
