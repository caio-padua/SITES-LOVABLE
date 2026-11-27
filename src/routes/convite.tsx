import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { solicitarConvite, consultarConvite, conviteSchema } from "@/lib/convite.functions";

export const Route = createFileRoute("/convite")({
  head: () => ({
    meta: [
      { title: "PAXMED · Solicitar convite" },
      { name: "description", content: "Médicos podem solicitar convite à PAXMED e consultar critérios, benefícios e o status da solicitação." },
      { property: "og:title", content: "PAXMED · Solicitar convite" },
      { property: "og:description", content: "Critérios, benefícios e status da solicitação de convite PAXMED." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConvitePage,
});

const criterios = [
  "Registro ativo no CRM (validamos o número e a UF).",
  "Atuação em medicina integrativa ou com protocolos injetáveis.",
  "Clínica ou consultório com responsável técnico identificado.",
  "Concordância com os termos de uso e a LGPD.",
];
const beneficios = [
  "Acesso antecipado às ferramentas durante a fase de testes.",
  "Condição comercial de fundador, informada antes de qualquer cobrança.",
  "Participação nas conversas sobre novas funções.",
  "Suporte direto da equipe na implantação.",
];
const etapas: Record<string, { label: string; desc: string }> = {
  recebida: { label: "Recebida", desc: "Sua solicitação chegou e aguarda análise." },
  em_analise: { label: "Em análise", desc: "Estamos conferindo os dados informados." },
  aprovada: { label: "Aprovada", desc: "Você receberá o convite no e-mail informado." },
  lista_espera: { label: "Lista de espera", desc: "Entraremos em contato quando abrirmos novas vagas na implantação." },
  recusada: { label: "Não aprovada", desc: "No momento não atende aos critérios. Você pode solicitar novamente depois." },
};

const label = "block text-[11px] uppercase tracking-[0.32em] text-[color:var(--gold)] mb-2";

function Field(p: { name: string; label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; max?: number }) {
  return (
    <label className="block">
      <span className={label}>{p.label}{p.required ? " *" : ""}</span>
      <div className="parxis-login-field">
        <input name={p.name} type={p.type ?? "text"} value={p.value} maxLength={p.max ?? 120} required={p.required} onChange={(e) => p.onChange(e.target.value)} />
      </div>
    </label>
  );
}

function ConvitePage() {
  const enviar = useServerFn(solicitarConvite);
  const consultar = useServerFn(consultarConvite);
  const [f, setF] = useState({ nome: "", email: "", crm: "", uf: "", especialidade: "", clinica: "", cidade: "", mensagem: "" });
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [protocolo, setProtocolo] = useState<string | null>(null);
  const [q, setQ] = useState({ protocolo: "", email: "" });
  const [status, setStatus] = useState<null | { found: boolean; status?: string; criadoEm?: string }>(null);
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = conviteSchema.safeParse(f);
    if (!parsed.success) {
      const campo = String(parsed.error.issues[0]?.path[0] ?? "");
      const msgs: Record<string, string> = { nome: "Informe seu nome completo.", email: "E-mail inválido.", crm: "CRM deve ter só números (3 a 8 dígitos).", uf: "UF com 2 letras.", especialidade: "Informe a especialidade.", cidade: "Informe a cidade." };
      toast.error(msgs[campo] ?? "Confira os campos.");
      return;
    }
    if (!consent) return void toast.error("Confirme o consentimento para continuar.");
    setLoading(true);
    try {
      const r = await enviar({ data: parsed.data });
      if (r.ok) { setProtocolo(r.protocolo); setQ({ protocolo: r.protocolo, email: parsed.data.email }); }
      else toast.error(r.error);
    } catch { toast.error("Não foi possível enviar agora. Tente novamente."); }
    finally { setLoading(false); }
  }

  async function onConsultar(e: React.FormEvent) {
    e.preventDefault();
    try { setStatus(await consultar({ data: q })); }
    catch { toast.error("Confira o protocolo e o e-mail."); }
  }

  const etapa = status?.status ? etapas[status.status] ?? { label: status.status, desc: "" } : null;

  return (
    <main className="min-h-screen bg-black text-foreground px-4 sm:px-6 py-12">
      <div className="mx-auto max-w-[1040px]">
        <Link to="/" className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--gold)] hover:underline">← Voltar ao início</Link>
        <p className="mt-8 text-[11px] uppercase tracking-[0.42em] text-[color:var(--gold)]">Programa de convites PAXMED</p>
        <h1 className="mt-3 font-serif text-[34px] md:text-[48px] leading-tight">Solicite seu convite</h1>
        <p className="mt-4 max-w-[680px] text-foreground/80 leading-relaxed">
          A PAXMED está em fase de implantação com um grupo inicial de médicos. Analisamos cada solicitação pelos critérios abaixo e respondemos a todas, pelo e-mail informado.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <section className="parxis-login-card rounded-xl p-6">
            <h2 className="font-serif text-[24px]">Critérios</h2>
            <ul className="mt-4 space-y-2 text-[15px] text-foreground/85 list-disc pl-5">{criterios.map((c) => <li key={c}>{c}</li>)}</ul>
          </section>
          <section className="parxis-login-card rounded-xl p-6">
            <h2 className="font-serif text-[24px]">Benefícios</h2>
            <ul className="mt-4 space-y-2 text-[15px] text-foreground/85 list-disc pl-5">{beneficios.map((c) => <li key={c}>{c}</li>)}</ul>
          </section>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <section className="parxis-login-card rounded-xl p-6 sm:p-8">
            <h2 className="font-serif text-[24px]">Formulário</h2>
            {protocolo ? (
              <div className="mt-4 space-y-3" role="status">
                <p>Solicitação recebida. Guarde seu protocolo:</p>
                <p className="font-mono text-[22px] text-[color:var(--gold)]" data-testid="protocolo">{protocolo}</p>
                <p className="text-foreground/75 text-[14px]">Use o protocolo e o seu e-mail ao lado para acompanhar o status.</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="mt-4 space-y-4">
                <Field name="nome" label="Nome completo" value={f.nome} onChange={set("nome")} required />
                <Field name="email" label="E-mail" type="email" value={f.email} onChange={set("email")} required max={255} />
                <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-3">
                  <Field name="crm" label="CRM" value={f.crm} onChange={set("crm")} required max={8} />
                  <Field name="uf" label="UF" value={f.uf} onChange={set("uf")} required max={2} />
                </div>
                <Field name="especialidade" label="Especialidade" value={f.especialidade} onChange={set("especialidade")} required />
                <Field name="clinica" label="Clínica (opcional)" value={f.clinica} onChange={set("clinica")} max={160} />
                <Field name="cidade" label="Cidade" value={f.cidade} onChange={set("cidade")} required />
                <label className="block">
                  <span className={label}>Mensagem (opcional)</span>
                  <div className="parxis-login-field"><textarea name="mensagem" rows={3} maxLength={1000} value={f.mensagem} onChange={(e) => set("mensagem")(e.target.value)} /></div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[color:var(--gold)]" />
                  <span className="text-[13px] text-foreground/80">Autorizo a PAXMED a usar estes dados apenas para analisar minha solicitação, conforme a LGPD.</span>
                </label>
                <button type="submit" disabled={loading} className="parxis-btn parxis-btn-primary w-full"><span>{loading ? "Enviando…" : "Enviar solicitação"}</span></button>
              </form>
            )}
          </section>

          <section className="parxis-login-card rounded-xl p-6 sm:p-8">
            <h2 className="font-serif text-[24px]">Consultar status</h2>
            <form onSubmit={onConsultar} className="mt-4 space-y-4">
              <Field name="q-protocolo" label="Protocolo" value={q.protocolo} onChange={(v) => setQ((s) => ({ ...s, protocolo: v }))} required max={20} />
              <Field name="q-email" label="E-mail" type="email" value={q.email} onChange={(v) => setQ((s) => ({ ...s, email: v }))} required max={255} />
              <button type="submit" className="parxis-btn parxis-btn-ghost w-full"><span>Consultar</span></button>
            </form>
            {status && (
              <div className="mt-5" role="status" data-testid="status">
                {status.found && etapa ? (
                  <>
                    <p className="text-[color:var(--gold)] text-[18px]">{etapa.label}</p>
                    <p className="text-[14px] text-foreground/80 mt-1">{etapa.desc}</p>
                    {status.criadoEm && <p className="text-[12px] text-foreground/60 mt-2">Enviada em {new Date(status.criadoEm).toLocaleDateString("pt-BR")}</p>}
                  </>
                ) : <p className="text-[14px]">Nenhuma solicitação encontrada com esses dados.</p>}
              </div>
            )}
            <div className="mt-6 border-t border-[color:var(--gold)]/20 pt-4 text-[13px] text-foreground/70 space-y-1">
              {Object.values(etapas).map((e) => <p key={e.label}><span className="text-foreground/90">{e.label}:</span> {e.desc}</p>)}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
