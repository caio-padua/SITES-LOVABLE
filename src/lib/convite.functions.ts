import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const conviteSchema = z.object({
  nome: z.string().trim().min(3).max(120),
  email: z.string().trim().email().max(255),
  crm: z.string().trim().regex(/^\d{3,8}$/),
  uf: z.string().trim().regex(/^[A-Za-z]{2}$/),
  especialidade: z.string().trim().min(2).max(120),
  clinica: z.string().trim().max(160).optional().default(""),
  cidade: z.string().trim().min(2).max(120),
  mensagem: z.string().trim().max(1000).optional().default(""),
});

function novoProtocolo() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  const buf = crypto.getRandomValues(new Uint8Array(8));
  for (const b of buf) s += chars[b % chars.length];
  return `PXM-${s.slice(0, 4)}-${s.slice(4)}`;
}

export const solicitarConvite = createServerFn({ method: "POST" })
  .validator((d) => conviteSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const protocolo = novoProtocolo();
    const { error } = await supabaseAdmin.from("convite_solicitacoes").insert({
      protocolo,
      nome: data.nome,
      email: data.email.toLowerCase(),
      crm: data.crm,
      uf: data.uf.toUpperCase(),
      especialidade: data.especialidade,
      clinica: data.clinica || null,
      cidade: data.cidade,
      mensagem: data.mensagem || null,
    });
    if (error) {
      console.error("[convite] insert", error.message);
      return { ok: false as const, error: "Não foi possível enviar agora. Tente novamente." };
    }
    return { ok: true as const, protocolo };
  });

export const consultarConvite = createServerFn({ method: "POST" })
  .validator((d) =>
    z.object({ protocolo: z.string().trim().max(20), email: z.string().trim().email().max(255) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("convite_solicitacoes")
      .select("status, created_at, updated_at")
      .eq("protocolo", data.protocolo.toUpperCase())
      .eq("email", data.email.toLowerCase())
      .maybeSingle();
    if (!row) return { found: false as const };
    return { found: true as const, status: row.status, criadoEm: row.created_at, atualizadoEm: row.updated_at };
  });
