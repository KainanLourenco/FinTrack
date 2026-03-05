# UX e Insights Financeiros

## Fluxos de UX Inteligentes

1.  **Onboarding Guiado e Personalizado:**
    *   Não apenas pedir dados, mas perguntar objetivos (ex: "Sair das dívidas", "Economizar para viagem").
    *   Configuração automática de categorias baseada no perfil (Estudante, Família, Autônomo).
2.  **Alertas de Orçamento em Tempo Real:**
    *   Notificação push/in-app quando o usuário atinge 50%, 80% e 100% do orçamento de uma categoria.
    *   Sugestão imediata de "remanejamento" de verba de outra categoria.
3.  **Detecção de Assinaturas Recorrentes:**
    *   Ao identificar transações repetidas (mesmo valor/dia), sugerir cadastrar como recorrente.
    *   Alerta de aumento de preço em assinaturas (ex: Netflix aumentou R$ 5,00).
4.  **"Sobrou no Mês?" (Fechamento Mensal):**
    *   Resumo gamificado no dia 1º: "Você economizou R$ 200 a mais que mês passado!".
    *   Opção de um clique para mover a sobra para uma meta/poupança.
5.  **Previsão de Saldo Futuro:**
    *   Baseado nas contas fixas cadastradas, mostrar se o saldo vai ficar negativo antes do fim do mês.
6.  **Comparativo "Você vs. Média":**
    *   (Anônimo) "Pessoas com seu perfil gastam 15% menos em Mercado. Veja dicas."
7.  **Meta Inteligente "Pague-se Primeiro":**
    *   Sugestão de transferir automaticamente para a poupança assim que o salário cai.

## Jornadas Detalhadas

### 1. Cadastro Inicial (Onboarding)
1.  **Boas-vindas:** Tela limpa com proposta de valor ("Assuma o controle").
2.  **Objetivo Principal:** Seleção única (ex: "Organizar gastos", "Investir", "Sair do vermelho").
3.  **Configuração Rápida de Contas:** "Qual seu banco principal?" (Ícones grandes dos bancos).
4.  **Saldo Inicial:** Input simples ou opção "Pular e configurar depois".
5.  **Tour Guiado:** Highlight em 3 pontos chave: "Adicionar Transação", "Ver Saldo", "Definir Meta".
6.  **Primeira Vitória:** Pedir para registrar o primeiro gasto do dia (ex: café) para quebrar a inércia.

### 2. Criação de Orçamento (Budgeting)
1.  **Análise Automática:** O app sugere orçamentos com base na média dos últimos 3 meses (se houver dados).
2.  **Definição por Categoria:** Lista de categorias com sliders visuais.
    *   *UI:* Barra verde/amarela/vermelha conforme o valor sobe.
3.  **Feedback Imediato:** "Com esse orçamento, você vai gastar 90% da sua renda. Recomendamos 70%."
4.  **Trava de Segurança:** Opção "Bloquear gastos?" (Simbolico/Alerta forte).
5.  **Confirmação:** Resumo visual "Sobra prevista: R$ X".

### 3. Revisão Mensal (Review)
1.  **Notificação:** "Seu relatório de Março está pronto!".
2.  **Stories Financeiros:** Formato tipo Instagram Stories com destaques:
    *   "Total Gasto"
    *   "Maior Categoria"
    *   "Dia com mais gastos"
3.  **Comparativo:** Gráfico de barras "Este mês" vs "Mês passado".
4.  **Ação:** "Definir meta para Abril?" ou "Manter orçamento atual?".

## Componentes de UI e Microinterações

*   **Barra de Progresso de Orçamento:**
    *   Fina e discreta abaixo de cada categoria na lista.
    *   Muda de cor (Verde -> Amarelo -> Vermelho) conforme enche.
    *   *Microinteração:* Treme levemente ao atingir 100%.
*   **Card de "Saúde Financeira":**
    *   Um "Score" ou "Emoji" no topo da home (ex: 😃, 😐, 😟) baseado no saldo vs dias restantes do mês.
*   **Botão de Ação Flutuante (FAB) Inteligente:**
    *   Ao segurar o botão "+", aparecem atalhos rápidos para as 3 categorias mais usadas (ex: "Almoço", "Uber", "Mercado").
*   **Feedback Hápitco:**
    *   Vibração leve ao completar uma meta ou registrar uma transação com sucesso.

## Dados Necessários no Backend

*   **Tabela `budgets`:** `user_id`, `category_id`, `amount_limit`, `period`.
*   **Tabela `financial_goals`:** `target_amount`, `current_amount`, `deadline`.
*   **Histórico Agregado:** Views ou tabelas de cache com gastos mensais por categoria para comparação rápida.
*   **Configurações de Usuário:** `notification_thresholds` (ex: avisar em 80%), `currency`, `savings_goal_percent`.

## Relatórios e Painéis

1.  **"Para onde foi meu dinheiro?":** Gráfico de Rosca (Donut) interativo. Clicar na fatia "Alimentação" explode em subcategorias ou locais.
2.  **Fluxo de Caixa Diário:** Gráfico de barras verticais (Receita vs Despesa) dia a dia. Ajuda a identificar padrões de gastos no fim de semana.
3.  **Evolução Patrimonial:** Gráfico de linha mostrando o saldo acumulado de todas as contas nos últimos 6-12 meses.
4.  **Previsão vs Realizado:** Tabela comparativa lado a lado do que foi orçado vs o que foi efetivamente gasto.
