# 🩺 VitalsAI - Painel Inteligente de Saúde Preventiva & BI

O **VitalsAI** é um MVP (Produto Mínimo Viável) moderno focado em saúde preventiva e Business Intelligence. A aplicação permite que usuários ou profissionais de saúde insiram marcadores biométricos brutos (glicemia, pressão arterial, colesterol, etc.) e, através de Inteligência Artificial Generativa, recebam relatórios clínicos estruturados, análises de risco e gráficos dinâmicos em tempo real.

🚀 **Link do projeto em produção:** [COLE_AQUI_O_LINK_DA_VERCEL]

---

## 🛠️ Arquitetura e Tecnologias Utilizadas

O projeto foi desenhado sob os conceitos de arquitetura ágil, separação de responsabilidades (Client/Server), segurança de credenciais e Edge Computing:

*   **Front-end & UX:** Construído com **React**, **TypeScript** e **Tailwind CSS**. A interface é totalmente responsiva (Desktop/Mobile), com gráficos dinâmicos de BI (utilizando componentes modernos) e suporte nativo a estados de carregamento fluidos.
*   **Hospedagem:** Publicado globalmente através da **Vercel** com fluxo automatizado de CI/CD via GitHub.
*   **Back-end & Banco de Dados:** Centralizado no **Supabase** (PostgreSQL) para persistência segura dos históricos de biomarcadores dos usuários, com políticas rígidas de segurança em nível de linha (**RLS - Row Level Security**).
*   **DevOps & Edge Computing:** A lógica de comunicação com a IA foi isolada em **Supabase Edge Functions** (ambiente de servidor Deno TypeScript). Isso garante que as chaves de API secretas fiquem protegidas no lado do servidor e reduz drasticamente a latência de rede.
*   **Core de Inteligência Artificial:** Integração via API de ultra-performance com o **Groq**, consumindo o modelo de código aberto **Llama 3**. O prompt de sistema foi programado para exigir respostas estritamente estruturadas em formato JSON, permitindo o parse perfeito dos dados no front-end.

---

## 📦 Como a IA Processa os Dados (System Prompt)

Para garantir consistência e segurança nas respostas da IA, a Edge Function instrui o modelo a atuar rigidamente sob as seguintes diretrizes:
1.  Analisar os marcadores biométricos e classificá-los em faixas de segurança ou alertas.
2.  Gerar recomendações práticas e fundamentadas de hábitos saudáveis.
3.  Retornar os dados estruturados estritamente em um objeto JSON tipado (Score Geral, Nível de Risco, Listas de Insights e Avisos Legais).
4.  Garantir a inclusão obrigatória de um *disclaimer* médico informando que o relatório não substitui uma consulta profissional.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
*   Node.js (versão 20 ou superior)
*   Supabase CLI instalado (ou via `npx`)

### Passo a Passo

1.  **Clonar o repositório:**
    ```bash
    git clone https://github.com
    cd SEU_REPOSITORIO
    ```

2.  **Instalar as dependências:**
    ```bash
    npm install
    ```

3.  **Configurar as Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz do projeto e adicione as credenciais do seu projeto:
    ```env
    VITE_SUPABASE_URL=https://supabase.co
    VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
    ```

4.  **Ativar sessões anônimas:** no painel do Supabase, habilite `Anonymous Sign-Ins` nas configurações de autenticação e aplique as migrations (`supabase db push`). Cada navegador/dispositivo terá um histórico privado próprio; sem uma conta, esses históricos não são sincronizados entre dispositivos.

5.  **Configurar o Servidor (Edge Functions):**
    No painel do Supabase, certifique-se de adicionar o segredo da sua API do Groq nas configurações de Function Secrets:
    ```env
    GROQ_API_KEY=gsk_sua_chave_secreta_do_groq
    ```

6.  **Rodar em modo de desenvolvimento:**
    ```bash
    npm run dev
    ```

---

## 🛡️ Licença

Este projeto foi desenvolvido para fins de portfólio de engenharia de software e está sob a licença MIT. Feel free para explorar o código!
