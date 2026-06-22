# ✅ Checklist de Testes - Projeto de Encomendas

## Testes de Funcionalidade Básica

### Login (index.html)
- [ ] Senha 1234 (Portaria) → vai para painel.html
- [ ] Senha 9999 (Admin) → vai para painelgestorADM.html
- [ ] Senha 0000 (Morador) → vai para telausuario.html
- [ ] Senha errada → mostra alerta "Senha incorreta"
- [ ] Campo limpa após erro
- [ ] Botão de olho mostra/esconde senha
- [ ] Pressionar Enter envia formulário

---

## Testes do Painel de Portaria (painel.html)

### Carregamento Inicial
- [ ] Página carrega encomendas pendentes automaticamente
- [ ] Tabela exibe lista de encomendas
- [ ] Se não há encomendas, exibe "Nenhuma encomenda pendente"

### Nova Encomenda
- [ ] Botão "+ NOVA ENCOMENDA" abre modal
- [ ] Campo de código tem botão 📱 (roxo) ao lado
- [ ] Campo de tipo é dropdown (não text input)
- [ ] Validação: não permite salvar sem preencher obrigatórios
- [ ] Validação: mostra lista de erros se falhar
- [ ] Upload de foto funciona
- [ ] Após salvar, modal fecha automaticamente
- [ ] Campos do formulário limpam
- [ ] Tabela atualiza com nova encomenda

### Leitor de Código de Barras 📱
- [ ] Clicando no botão 📱 ativa o modo scanner
- [ ] Campo de código fica com borda **verde brilhante**
- [ ] Placeholder muda para "📱 Escaneador ativo..."
- [ ] Digite código + Enter move para próximo campo
- [ ] Clicando novamente desativa o modo
- [ ] Campo volta ao normal (borda branca)

### Confirmar Entrega
- [ ] Botão "Entregar" em cada encomenda abre modal
- [ ] Modal pede nome do recebedor
- [ ] Validação: não permite confirmar sem nome
- [ ] Após confirmar, encomenda some da lista
- [ ] Modal de entrega fecha
- [ ] Modal de histórico atualiza (se aberto)

### Histórico de Entregas
- [ ] Botão "📜 HISTÓRICO" mostra área de histórico
- [ ] Tabela exibe últimas 10 entregas
- [ ] Se vazio, mostra "Nenhuma entrega encontrada"
- [ ] Fotos das entregas aparecem com link "📷 Ver"

### Temas/Cores
- [ ] Botão cinza (fundo cinza escuro)
- [ ] Botão marrom (fundo marrom)
- [ ] Botão azul (fundo azul escuro)
- [ ] Botão com imagem (fundo Ubatuba)
- [ ] Tema é persistente (recarga a página, tema mantém)

### Rádio Player
- [ ] Clique no botão ▶ (canto superior direito)
- [ ] Ícone muda para ⏸ (pause)
- [ ] Clique novamente para pausar

---

## Testes de Segurança e Validação

### Entrada de Dados
- [ ] Tente salvar encomenda com campos vazios → erro
- [ ] Campo "Código" não permite vazio
- [ ] Campo "Morador" não permite vazio
- [ ] Campo "Endereço" não permite vazio
- [ ] Campo "Empresa" não permite vazio
- [ ] Dados HTML malicioso: `<script>alert('xss')</script>` não executa

### Tratamento de Erros
- [ ] Desconecte internet
- [ ] Tente salvar encomenda → mostra erro
- [ ] Tente carregar histórico → mostra erro
- [ ] Mensagens de erro são legíveis

---

## Testes de Performance

### Recarregamento Automático
- [ ] Abra a página
- [ ] Espere 30 segundos
- [ ] Dados devem recarregar (mesmo se lista vazia)
- [ ] Se modal aberto, NÃO recarrega (não atrapalha usuário)

### Responsividade
- [ ] Mobile (360px): layout se ajusta
- [ ] Tablet (768px): 2 colunas
- [ ] Desktop (1024px+): layout completo
- [ ] Botões são clicáveis no mobile
- [ ] Tabela scrollável no mobile

---

## Testes no Banco de Dados (Supabase)

### Inserção
- [ ] Nova encomenda aparece em `encomendas` table
- [ ] Campos `created_at`, `id` são preenchidos automaticamente
- [ ] Status = 'pendente' por padrão

### Atualização
- [ ] Após confirmar entrega, status muda para 'entregue'
- [ ] Nome do recebedor é preenchido corretamente
- [ ] `updated_at` é atualizado

### Leitura
- [ ] SELECT com status='pendente' funciona
- [ ] SELECT com status='entregue' funciona
- [ ] Order by created_at, limit 10 funciona

### Upload de Fotos
- [ ] Foto é salva em Supabase Storage (bucket: encomendas)
- [ ] URL pública é gerada
- [ ] Link "📷 Ver" abre imagem em nova aba

---

## Testes de Compatibilidade

### Navegadores
- [ ] Chrome/Edge (recomendado)
- [ ] Firefox
- [ ] Safari (macOS)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Sistema Operacional
- [ ] Windows (PowerShell)
- [ ] macOS
- [ ] Linux

---

## Testes de Scanner Físico (Opcional)

### Leitor USB
- [ ] Conecte leitor ao computador
- [ ] Ative modo scanner (botão 📱)
- [ ] Aponte para código 128
- [ ] Código aparece no campo
- [ ] Enter é enviado automaticamente
- [ ] Cursor move para próximo campo

### Leitor Bluetooth
- [ ] Pareie com computador
- [ ] Repita testes do USB acima

---

## Testes de Console (F12)

### Verificar Erros
```javascript
// No console, verifique:
// 1. Nenhum erro vermelho
// 2. Inicialização: "📱 Página carregada, inicializando..."
// 3. Sucesso: "✅ Inicialização concluída!"
```

### Testar Funções Manualmente
```javascript
// Carregar encomendas
carregarEncomendas();

// Mudar cor
window.mudarCor('azul');

// Ativar scanner
iniciarLeitorCodigoBarras();

// Ver estado do scanner
console.log('Scanner ativo?', scannerAtivo);
```

---

## Testes de UX/UI

### Visual
- [ ] Texto legível (contraste adequado)
- [ ] Botões com hover effect (clareza)
- [ ] Modal com backdrop escuro
- [ ] Ícones aparecem corretamente (emojis)
- [ ] Animações suaves

### Fluxo
- [ ] Usuário consegue nova encomenda em < 3 cliques
- [ ] Usuário consegue entregar encomenda em < 3 cliques
- [ ] Focos corretos (Tab funciona)
- [ ] Enter submete formulários

---

## Checklist Final

- [ ] Todos os arquivos salvos corretamente
- [ ] `logica.js` importa Supabase
- [ ] `painel.html` carrega `logica.js` com `type="module"`
- [ ] Variáveis de Supabase estão corretas
- [ ] Bucket 'encomendas' existe no Supabase
- [ ] Tabela 'encomendas' existe no Supabase
- [ ] Chave ANON do Supabase está ativa
- [ ] Nenhum console error vermelho

---

**Status**: Pronto para Produção ✅  
**Data**: 2026-06-22  
**Versão**: 2.0
