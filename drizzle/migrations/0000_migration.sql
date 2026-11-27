CREATE TABLE public.convite_solicitacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo text NOT NULL UNIQUE,
  nome text NOT NULL,
  email text NOT NULL,
  crm text NOT NULL,
  uf text NOT NULL,
  especialidade text NOT NULL,
  clinica text,
  cidade text NOT NULL,
  mensagem text,
  status text NOT NULL DEFAULT 'recebida',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.convite_solicitacoes TO service_role;
ALTER TABLE public.convite_solicitacoes ENABLE ROW LEVEL SECURITY;