# PAXMED — revisão da vitrine e integração com o Manager

Data: 27/11/2026 (UTC). Projeto: Pax Med / PAXMED, repositório indicado pelo proprietário como `parxis-core-protocol`.

## 1. Resumo e versões

- Versão inicial salva: `72dfc09308b65058d24d3225fb19d31a0d7b49ad`, 27/11/2026 17:02 UTC, “Troca marca PADAXOR por PAXMED no rodapé, e-mails e acessos para /login e /area”. Árvore de trabalho limpa no início.
- Prévia revisável preparada. **Não corresponde a uma certificação de 98% de integração operacional**: autenticação real, gravação e leitura de registros não foram exercitadas nesta rodada, por expressa restrição de não gravar em produção.
- Nada publicado; nenhum domínio/DNS alterado; nenhuma implantação, migração ou mudança de configuração de autenticação realizada. Nenhuma página, conta, cadastro, segredo ou registro excluído.
- Nenhuma edição ou consulta ao código do projeto separado PAXCARE. Apenas a página pública `/area` do Manager foi aberta; ela exibe a marca PAX CARE.
- O estado do código publicado no Lovable não foi identificado por commit. Código salvo, prévia e código publicado devem ser comparados separadamente.

## 2. Alterações efetivamente feitas

1. Os quatro acessos da vitrine (cabeçalho e seção principal) agora encaminham explicitamente para `https://paxmed.com.br/login` e `https://paxmed.com.br/area`. Antes eram relativos `/login` e `/area`, abrindo a origem do Lovable. `/area` não existe localmente e retornava 404. O login antigo permanece disponível em `/login`, sem redirecionamento novo ou exclusão.
2. `/login/diag` finalmente renderiza o diagnóstico. Antes era filho de `/login`, cujo conteúdo não possui saída para páginas filhas, e mostrava a tela de login. Arquivo renomeado para `login_.diag.tsx`, mantendo o endereço público. A árvore de rotas foi regenerada automaticamente, não editada manualmente.
3. `/status`: corrigida divergência de horário entre a primeira renderização e o navegador; resumo agora diferencia não verificado, verificando, sucesso e falhas. Antes declarava “Todos os serviços operando normalmente” mesmo com falhas. Layout e classes visuais preservados.
4. `/api/public/health`: resposta 401 do catálogo do banco não é mais contada como sucesso; removido envio indevido de chave pública opaca como bearer token e incluído tempo máximo de 5s para essa consulta. O catálogo **continua respondendo 401**, inclusive enviando somente a chave pública; portanto o teste agora retorna 503 honestamente, sem afirmar que CRUD funciona ou que o banco inteiro está fora do ar.
5. Acrescentados testes e regras técnicas; preservados integralmente CSS, arte, animações, `traceFlash`, função da cena flutuante, conteúdo do rodapé, páginas de login/convite/administração/histórico e middleware de autenticação.

## 3. Estado das páginas e autenticação

| Página | Estado inicial → final | Serviços e autorização | Confirmação / pendência |
|---|---|---|---|
| `/` | Vitrine existente, contato duplo; apenas destinos de acesso ajustados | Cloud `leads` + api-server Railway; sem login exigido para contato | Renderizada desktop/mobile; gravação não realizada |
| `/login` | Preservada byte por byte | Médico: api-server Railway, POST `/api/collaborator/login`; sessão própria no armazenamento local; `/me` verifica token. Redirecionamento por cargo para `https://workspacepadcom-production.up.railway.app`. Recuperação usa auth do Cloud | Não equivalente ao Manager; login real não testado |
| `/login` aba paciente | Preservada | POST Railway `/api/patient/login`, `{identifier,password}` | Apenas mensagem de sucesso em 2xx; não persiste token nem encaminha ao portal. Contrato não confirmado; Manager `/area` usa CPF + nascimento e opção de senha |
| `/login/diag` | Mostrava login → mostra diagnóstico | Health Railway, presença/expiração local de token, bloqueio local e flags | Corrigido e renderizado; “noindex” NÃO é autorização; acessível sem sessão. Expiração local não valida assinatura |
| `/convite` | Preservada | Funções do próprio site; gravação privilegiada em `convite_solicitacoes`; consulta por protocolo + e-mail | Sem sessão obrigatória. Não enviada solicitação nem consultado registro real nesta rodada |
| `/admin` | Preservada | Sessão separada do Cloud; email/senha; ainda oferece criar conta. Leitura de `leads` limitada por política de papel admin | Só tela deslogada examinada; não atestamos operação autenticada. Cadastro não concede automaticamente papel admin |
| `/releases` | Preservada | Conteúdo estático e JSON gerado por script de histórico Git; não consulta banco | Abriu; não prova versão publicada nem versão do Manager |
| `/status` | Abriu com erro de renderização e resumo enganoso → abre sem erro e relata falhas | GET locais, health do próprio site, `/api/brt` no Railway | Autoteste executado; serviço externo não confirmado |
| `/demonstracao` | Preservada | Navega às duas demonstrações | Ambas abrem |
| `/demonstracao/clinica` e `/demonstracao/paciente` | Preservadas | Portão de identificação envia `/api/vitrine-leads` no Railway; liberação local por navegador | Não são sessões reais do Manager nem barreiras para dados privados |
| `/area` local | Continua ausente (404) | Nenhum | Não criada página artificial; botão principal agora vai ao Manager |

Os metadados próprios das páginas de conteúdo existentes foram inspecionados: título, descrição, Open Graph e cartão Twitter presentes. Não adicionadas imagens de compartilhamento relativas nem alterada a identidade.

## 4. Inventário de links e botões

D = computador 1280×1800; M = celular 390×844. Visibilidade e destino foram lidos da página renderizada, não apenas dos arquivos. Elementos condicionais autenticados são identificados abaixo como não exercitados. Botão oculto intencionalmente no celular não foi tratado como perdido.

| Página / posição / item | Ação esperada | Destino ou ação atual confirmada no código | Teste / resultado | Pendência |
|---|---|---|---|---|
| `/`, marca e pular conteúdo | Voltar/ir ao topo | `#top` | Alvo existe D/M | Nenhuma de destino |
| `/`, Manifesto, Recursos, Inteligência, O Círculo, Ecossistema | Rolar seções | `#manifesto`, `#recursos`, `#tecnologia`, `#clinicas`, `#ecossistema` | Todos os alvos existem; menu desktop, oculto no mobile | Rolagem não certifica serviço |
| `/`, Área do Médico / Clínica, topo + principal (2) | Abrir acesso operacional | `https://paxmed.com.br/login` | 4 acessos totais conferidos em 1440×900, 851×622 e 390×844; navegação abriu entrada do Manager | Não submetido login |
| `/`, Portal do Paciente, topo + principal (2) | Abrir acesso do cliente | `https://paxmed.com.br/area` | Navegação abriu CPF + nascimento no Manager; desktop/mobile sem transbordamento | Não submetida identificação |
| `/`, Conhecer Planos / Solicitar Demonstração (topo e principal), Solicitar Demonstração na seção de candidatura | Ir ao contato, não comprar licença | `#contato` | Alvo existe; principal visível D/M, topo oculto mobile | Não é ligação com API de planos |
| `/`, Conheça a PADCON Platform® | Abrir ecossistema | `https://padcon.replit.app/`, nova aba, `noopener noreferrer` | Destino e atributos renderizados | Conteúdo externo não testado nesta rodada |
| `/`, contraste / movimento / EN / PT | Preferência visual/idioma | Estado + armazenamento local; movimento oculto mobile | Controles renderizados; teste do logotipo aprovado | Não dependem do Manager |
| `/`, Reproduzir Depoimento 01/02/03 | Reproduzir vídeo | **Sem handler, URL ou mídia** | Confirmado no código e renderizado | Precisa de vídeos autorizados e ação definida; não inventados |
| `/`, três pontos dos depoimentos | Deslocar carrossel | `scrollTo(i)` | Handler confirmado; controles renderizados | Não confundir com reprodução de vídeo |
| `/`, Enviar candidatura | Enviar contato | Cloud `leads` + Railway `/api/vitrine-contatos` | Consentimento bloqueou envio; dois payloads observados em interceptação | Entrega real não comprovada; falha externa ignorada |
| `/login`, marca / voltar | Voltar à vitrine | `/` | D/M; voltar textual oculto mobile | Mantido local |
| `/login`, Sou Médico ou Clínica / Sou Paciente | Alternar formulário | `/login?perfil=medico` / `?perfil=paciente` | Handlers e estados confirmados | Não cria login do Manager |
| `/login`, acessar / entrar no portal | Autenticar | Railway colaborador / paciente | Inspeção; nenhum envio real | Contratos, CORS e credenciais próprias |
| `/login`, Esqueci minha senha | Recuperar acesso | Auth Cloud, redirect `/reset-password` local | Inspeção; não enviado email | Rota não existe; não recupera necessariamente senha do Manager |
| `/login`, Ver/Ocultar | Mostrar senha digitada | Estado local | Renderizado | Nenhuma de serviço |
| `/login`, quatro selos e Fechar (condicional) | Abrir/fechar explicação | Estado de painel de certificações | Código e botões presentes | Selos não comprovam certificação real |
| `/login`, Encerrar sessão (condicional) | Sair | Limpa sessão própria e encerra sessão Cloud | Código apenas | Pode também desconectar `/admin`; não exercitado |
| `/convite`, Voltar ao início | Voltar vitrine | `/` | D/M | Nenhuma |
| `/convite`, Enviar solicitação | Gerar protocolo | Função interna → `convite_solicitacoes` | Nome inválido rejeitado sem envio | Envio real exige autorização para testar gravação |
| `/convite`, Consultar | Ler status | Função interna; protocolo + email | Código e formulário renderizados | Leitura real não exercitada; sem painel de gestão do status |
| `/admin`, Entrar / Primeiro acesso / Criar conta | Sessão ou cadastro Cloud | `signInWithPassword` / `signUp` | Tela deslogada renderizada D/M | Não usados terceiros nem criadas contas |
| `/admin`, buscar / Exportar CSV / Atualizar / Sair (condicionais) | Consultar/exportar contatos e sair | Filtro local; CSV; SELECT Cloud; signOut | Código confirmado, **não testado com sessão** | Credencial autorizada e teste com dados permitidos |
| `/admin`, email / WhatsApp do lead (condicionais) | Contatar lead | `mailto:<email>` / `https://wa.me/<dígitos>` | Código apenas, sem acessar contatos | Validar números internacionais |
| `/releases`, Ir para o site / Ver status | Navegação local | `/` / `/status` | Renderizados D/M | Histórico gerado pode estar desatualizado |
| `/status`, Executar auto-teste / auto-refresh / intervalo | Verificar GETs, repetir | GETs locais e Railway; 10/30/60/300s | Autoteste executado D/M; intervalos no código | Não testa autenticação nem gravação; auto-refresh prolongado não exercitado |
| `/status`, Ir para o site / Acessar login | Navegação local de diagnóstico | `/` / `/login` | Renderizados | Intencionalmente preserva login antigo |
| `/login/diag`, re-executar / voltar ao login | Triagem e retorno | GET health; inspeção local; `/login` | Página corrigida e retorno exercitado | Sem validação de assinatura ou permissão |
| `/demonstracao`, marca / voltar / idiomas | Navegar/preferences | `/`; EN/PT | Renderizados D/M; voltar oculto mobile | Wordmark antigo na arte permanece; não alterado nesta rodada |
| `/demonstracao`, Sou paciente / Sou clínica | Abrir portão correto | `/demonstracao/paciente` / `/demonstracao/clinica` | Páginas abertas | Não são acessos operacionais |
| Demonstrações, Abrir a porta | Captar identificação | Railway `/api/vitrine-leads` | Inspeção; não enviado CPF/CNPJ | Contrato real e autorização de gravação |
| Demonstrações liberadas, CTA / Reiniciar (condicionais) | Contato / revogar liberação local | `/#contato`; remove chave local | Código confirmado | Reiniciar oculto mobile; não exercitado estado liberado |
| 404 local, Go home; erro, Try again/Go home (condicional) | Recuperar navegação | `/`; invalidação local | 404 observado em `/area` | Textos existentes em inglês, preservados |

O rodapé da vitrine apresenta domínio e e-mails como **texto**, não links clicáveis. Não há botão para `/convite` na homepage.

## 5. Formulários — valores, validação e destino real

### Contato da homepage

| Campo | Origem / transformação | Validação existente | Destino |
|---|---|---|---|
| `nome` | FormData, trim | obrigatório; HTML max 200; handler 2–120 | ambos |
| `email` | FormData, trim | type email, obrigatório, HTML max 200; regex no handler; sem lowercase | ambos |
| `telefone` | FormData, trim ou null | opcional, type tel, max 200; sem validação de formato | ambos |
| `clinica` | FormData, trim | obrigatório, HTML max 200; handler min 2 | ambos |
| `especialidade` | Valor do select **traduzido no idioma selecionado** | obrigatório; handler min 2 | ambos |
| `volume_protocolos` | Valor traduzido do select, trim ou null | opcional | ambos |
| `necessidade` | Textarea, trim | obrigatório, HTML max 2000; handler min 5 | ambos |
| consentimento | Estado de checkbox fora do formulário | handler exige true | **não enviado nem persistido como evidência** |
| `source` | Constante `paxmed-homepage` | não editável pelo formulário | somente api-server |

Fluxo atual: `Promise.allSettled` dispara INSERT Cloud `leads` e POST no api-server configurado em `VITE_API_BASE_URL`, atualmente Railway. Confirmação considera **somente o resultado Cloud**. Uma resposta externa 503 ainda resulta em “Sua candidatura foi recebida” se Cloud der sucesso — reproduzido com interceptação local. Isso não comprova recebimento no Manager. Não trocado endpoint, contrato ou lógica de confirmação nesta etapa, para preservar o fluxo existente enquanto se decide o destino operacional.

Políticas reais consultadas sem ler cadastros: RLS ativo em `leads`; INSERT permitido para anon/autenticado com limites de nome (2–120), email (5–200 e regex), clínica (2–200), especialidade (2–120), necessidade (5–2000); SELECT exige papel `admin`. Privilégios de tabela presentes, mas RLS limita leitura. Sem confirmação de validação de consentimento ou anti-spam no destino externo.

### Solicitação de convite

| Campo | Origem | Validação compartilhada frontend/servidor | Transformação gravada |
|---|---|---|---|
| nome | Estado, input | trim, 3–120 | trim |
| email | Estado, input email | trim, email válido, max 255 | lowercase |
| crm | Estado, input max 8 | somente 3–8 dígitos | trim |
| uf | Estado, input max 2 | exatamente duas letras | uppercase; não verifica UF real |
| especialidade | Estado | trim, 2–120 | trim |
| clinica | Estado | opcional, max 160 | vazio vira null |
| cidade | Estado | trim, 2–120 | trim |
| mensagem | Estado, textarea | opcional, max 1000 | vazio vira null |
| consentimento | Estado checkbox | só frontend | não enviado/registrado; chamada direta pode omitir |

Envio chama função interna pública, não Manager. Gera protocolo aleatório `PXM-XXXX-XXXX`; grava via cliente privilegiado Cloud em `convite_solicitacoes`. RLS ativo e sem políticas públicas nessa tabela; acesso privilegiado da função bypassa RLS. A função valida os campos mas não verifica CRM ativo em fonte oficial, consentimento servidor, rate limit ou CAPTCHA. Possibilidade de spam e pedidos repetidos; não alterada política nesta rodada.

Confirmação apresenta protocolo; erro retorna orientação genérica. Consulta aceita protocolo (trim/max 20) e email válido/max 255; compara protocolo uppercase e email lowercase; retorna apenas status e datas, não dados pessoais. Não exige login; protocolo + email são segredo de consulta, não autenticação robusta. Erro de banco na consulta não é distinguido de “não encontrada”. `updated_at` tem default, mas a migração local não mostra atualização automática por trigger. Não enviado email automático, embora textos de aprovação prometam envio; não há painel de convites em `/admin` (ele lê apenas `leads`).

### Outros formulários

- Login médico local: estado `email` enviado como `username` trim + `password` sem trim. Form usa `noValidate`; só username vazio é bloqueado explicitamente. Regras HTML de senha required/min 8 não são garantidas pelo handler. Correlation ID UUID no POST; 401 tem orientação e ID curto; bloqueio cliente não substitui rate limit servidor. Token/perfil ficam no armazenamento da origem Lovable e não são automaticamente compartilhados com Manager.
- Paciente local: identifier + password; 2xx não valida estrutura nem cria sessão navegável. Não equivalente à identificação CPF/nascimento do Manager.
- Admin: estado email/senha; validação nativa email/required/min 8; cadastro com confirmação direcionada a `/admin`. RLS de papel admin protege leads, não o mero nome “admin” da página.
- Portões de demonstração: nome trim 3–120, CPF com dígitos verificadores, telefone 10/11 dígitos, CNPJ validado quando clínica; consentimento e antispam (honeypot/2,5s) somente no frontend. Envia tipo, nome, CPF/CNPJ/telefone sem máscara, source e cinco UTMs permitidas. `rotaOrigem` existe no tipo, mas não é preenchido. Sem bearer; qualquer 2xx libera chave local, sem exigir `{ok:true}`. Liberação local não protege dados privados nem valida licença.

## 6. Manager e contrato externo

Confirmado via HTTP e página renderizada, sem credenciais:

- `https://paxmed.com.br/login`: HTTP 200 e entrada real com email/CPF/usuário + senha.
- `https://paxmed.com.br/area`: HTTP 200 e entrada real com CPF + data de nascimento, opção de senha e ficha de saúde `/anamnese/v2`; marca PAX CARE. O retorno institucional dessa página aponta para `https://paxter.com.br`, divergência a revisar **no Replit**, não alterada daqui.
- Manager GET `/api/health`: HTTP 200 JSON; não atesta login ou gravação.
- Manager GET `/api/vitrine-contatos`: HTTP 401 JSON. GET 401 **não confirma contrato POST**, nem prova ausência do endpoint. Não tentado POST, nem enumerados endpoints privados.
- api-server antigo GET `/api/health`: HTTP 404 nesta consulta; no navegador health também apresentou falha de rede. `/api/brt` falhou. Contrato, CORS e disponibilidade devem ser reconciliados com Replit.
- Snapshot `docs/api-contract/openapi.yaml` só descreve health e autenticação colaborador. Não contém contrato de contatos, pacientes ou leads.

Falta para integrar contato ao Manager: OpenAPI/contrato atual com método, campos obrigatórios e opcionais, formatos, enums independentes do idioma, source permitido, consentimento, autenticação (público ou protegido), CORS da prévia/publicado, códigos e corpo de sucesso/erro, limite de requisições, idempotência, destino de armazenamento, responsabilidade por duplicidade, política LGPD e autorização para teste de gravação/leitura em ambiente seguro. Nenhuma credencial privada deve ir para o navegador.

## 7. Testes e evidências

- Auditoria de 10 páginas existentes + `/area` inexistente em 1280×1800 e 390×844; após correções **zero erros de página e zero transbordamento horizontal**. `/area` local permanece 404; sem novos links da vitrine para ele.
- `tests/vitrine-access-links.spec.py`: aprovado; dois botões em duas posições e três larguras, destinos absolutos corretos.
- `tests/paxmed-live-logo.spec.py`: aprovado; ciclo oficial preservado. Comparação da função `ParxisMonogram`, CSS, `traceFlash` e logotipo com versão inicial: idênticos. Não alterada levitação.
- `bun test tests/service-health.test.ts`: 4 testes aprovados, 8 asserções (401 não saudável; não verificado; falhas; em andamento).
- `tests/paxmed-integration-audit.spec.py`: aprovado. Intercepta TODAS as operações de escrita; usa somente dados sintéticos `audit@example.invalid`, sem transmissão de teste ao servidor. Contato sem consentimento bloqueado; payloads duplos confirmados; falha externa 503 ignorada reproduzida; nome inválido no convite bloqueado; diagnóstico abre e retorna; links navegam ao Manager e mostram entradas reais. **Isso não é teste de gravação real.**
- Navegação pública do Manager testada em desktop/mobile, sem transbordamento. Nenhum login submetido, conta criada, email enviado, registro pessoal lido ou exportado.
- Autoteste `/status` executado: home/login 200; favicon falhou no navegador, mas teste servidor obteve 200; catálogo Cloud 401; health local corretamente 503; `/api/brt` falhou. Não classificado banco inteiro como indisponível.
- Compilação automática: último registro consultado “build OK”, 27/11/2026 17:41:51 UTC. Não executado build manual, conforme fluxo da plataforma.
- Tentativas iniciais de testes encontraram prévia antes de hidratar/atualizar e seletor sensível à caixa no botão externo; ajustados testes e repetidos com sucesso. Erro de horário de `/status` foi reproduzido antes e desapareceu depois.
- Demais suites legadas de autenticação/canário/regressão visual não executadas; algumas usam caminho antigo fixo de Chromium e expectativas históricas. Não contamos essas suites como aprovadas.

## 8. Textos atuais e riscos a decidir (não alterados)

Rodapé PT: “PAXMED · Sistema de Inteligência Clínica”, “Por PAXMED”, “paxmed.com.br”, “contato@paxmed.com.br”, “Av. Brigadeiro Faria Lima, 3477”, “Itaim Bibi · São Paulo · SP”. EN usa “PAXMED · Clinical Intelligence System”, “By PAXMED”, “contact@paxmed.com.br”. Símbolo usado: `paxmed-symbol-champagne.png`; marca PADCON e “Advanced Systems Architecture” preservadas. CNPJ exibido `00.000.000/0001-00`, marca registrada, conformidade/certificações e endereço aguardam comprovação/conteúdo exato do proprietário. Não inventados novos valores.

A vitrine ainda apresenta 12 licenciados por safra, contagem de 14 dias calculada novamente a cada montagem, depoimento nominal e promessas de resposta em 48h; convite afirma resposta a todas enquanto contato afirma resposta só às candidaturas selecionadas. A contagem não deriva de prazo operacional confirmado. **Pendências editoriais/legais relevantes**, especialmente para evitar escassez artificial e depoimentos não autorizados. Não corrigidas nesta rodada porque foi solicitado preservar textos/layout sem conteúdo exato. Não tratar esses números/promessas como regras comerciais confirmadas.

Riscos principais: sessões Cloud e Manager independentes; recuperação de senha local aponta ao serviço diferente; redirecionamento do login antigo para outra origem não compartilha localStorage; diagnóstico não indexado continua público; armazenamento de token no navegador exige proteção contra XSS; logs de bloqueio podem conter identificador de usuário; cadastro público do admin não equivale a permissão; chamadas privilegiadas de convite exigem proteção contra abuso. Nada disso foi ocultado como “integração pronta”.

## 9. GitHub alinhado, sem publicar ou reescrever histórico

1. Em Project settings → Git, conferir repositório **parxis-core-protocol**, provider e branch sincronizada. Este chat não consegue confirmar o status da conexão pelo painel. Não desconectar/reconectar para tentar reaproveitar repositório existente.
2. Comparar hash final desta revisão com o commit visível na branch sincronizada do GitHub e conferir o diff a partir de `72dfc093`. O salvamento de commits não publica a aplicação.
3. Na sincronização, apenas a branch escolhida chega ao Lovable. Mudanças em outras branches precisam de revisão/merge normal pelo responsável ou seleção consciente da branch no painel. Não usar push forçado, reset, rebase ou reescrever histórico.
4. Se houver divergência, preservar as duas versões e comparar a branch `lovable-sync*` mais recente com a branch sincronizada antes de merge normal no provedor; não sobrescrever a vitrine.
5. Para comparar com Manager: solicitar ao responsável do Replit hash do código implantado, contrato OpenAPI vigente e versão/hora da implantação; exportar fonte sem `.git`, dependências, `.env`, tokens ou dados. Comparar por funcionalidades e contratos, não assumir que arquivos/rotas de stacks diferentes são equivalentes.
6. Manter três referências: commit salvo Lovable, commit efetivamente publicado Lovable e commit implantado Manager. Um HTTP 200 ou `/releases` não identifica esses três commits.

## 10. Próximos passos bloqueados por informação/autorizações

- Replit: fornecer contrato confirmado de contatos, leads, login, paciente e recuperação; explicar a relação entre Railway antigo e Manager.
- Proprietário: autorizar ambiente seguro e conta própria para testar autenticação e ciclo envio → armazenamento → consulta, sem dados pessoais reais.
- Definir fonte de verdade dos contatos, estratégia de duplicidade e comprovação de consentimento, preservando os dados Cloud existentes.
- Definir gestão e notificações de convites, CRM/UF real, rate limit e evidência LGPD sem migrar ou apagar pedidos.
- Enviar textos exatos/comprovados de rodapé, registros, certificações, benefícios, prazo/vagas e depoimentos autorizados.
- Corrigir no Manager o retorno institucional antigo observado em `/area`, se o proprietário confirmar o destino.
- Conferir GitHub/branch e commits implantados; só depois aprovar publicação explicitamente em nova etapa.
