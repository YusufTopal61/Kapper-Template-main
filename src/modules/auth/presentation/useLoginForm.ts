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
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, startTransition] = useTransition();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const verstuur = form.handleSubmit((waarden) => {
    setFout(null);
    startTransition(async () => {
      try {
        const resultaat = await signInAction(waarden);
        if (!resultaat.ok) {
          setFout(resultaat.error);
          return;
        }
        // Verse server-render, zodat de beheer-layout de nieuwe sessie ziet.
        router.replace("/admin");
        router.refresh();
      } catch {
        setFout("Inloggen mislukte. Probeer het zo nog eens.");
      }
    });
  });

  return { form, fout, bezig, verstuur, wisFout: () => setFout(null) };
}
