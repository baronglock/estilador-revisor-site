# Deploy no Vercel - Instruções Atualizadas

## Mudanças Importantes de Segurança
- **API Key agora é server-side**: Sua chave OpenAI não ficará exposta no frontend
- **Controle de limites por usuário**: Sistema preparado para limitar uso baseado em planos
- **Sem input de API key**: Usuários não precisam (e não podem) inserir suas próprias chaves

## Passo a Passo para Deploy

### 1. Push para GitHub
```bash
git push origin main
```

### 2. Configuração no Vercel

#### Variável de Ambiente Necessária:
- **Key**: `OPENAI_API_KEY`
- **Value**: Sua chave da OpenAI (começa com `sk-...`)

⚠️ **IMPORTANTE**: Use `OPENAI_API_KEY` sem o prefixo `NEXT_PUBLIC_` porque agora é server-side only!

### 3. Como o Sistema Funciona Agora

#### Para Usuários:
- Não precisam inserir API key
- Usam sua API key no backend
- Limites controlados por plano:
  - **Free**: 1 documento/mês
  - **Pro**: 50 documentos/mês  
  - **Team**: 200 documentos/mês
  - **Enterprise**: Ilimitado

#### Para Você (Admin):
- Controla a API key no Vercel
- Pode desativar usuários específicos
- Controla limites por plano
- Paga apenas pelo uso real

### 4. Arquivo de Configuração

O sistema usa estas configurações (em `/src/app/api/process-document/route.ts`):

```javascript
const PLAN_LIMITS = {
  free: { monthlyDocs: 1, maxParagraphs: 100 },
  pro: { monthlyDocs: 50, maxParagraphs: 1000 },
  team: { monthlyDocs: 200, maxParagraphs: 5000 },
  enterprise: { monthlyDocs: Infinity, maxParagraphs: Infinity },
}
```

### 5. Próximos Passos (Quando Implementar)

1. **Autenticação com Supabase**:
   - Adicionar variáveis: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
   - Conectar com banco de dados de usuários

2. **Pagamentos com Stripe**:
   - Adicionar variáveis: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
   - Implementar checkout e gestão de assinaturas

3. **Banco de Dados**:
   - Rastrear uso real por usuário
   - Histórico de documentos processados
   - Gestão de créditos

### 6. Testando Localmente

Crie um arquivo `.env.local` na raiz do projeto:
```
OPENAI_API_KEY=sk-sua-chave-aqui
```

### 7. Segurança

✅ **Vantagens da nova arquitetura**:
- API key nunca exposta no código cliente
- Controle total sobre quem usa e quanto
- Possibilidade de auditar uso por usuário
- Fácil de desativar acesso se necessário
- Proteção contra uso abusivo

### 8. Deploy Automático

Após configurar no Vercel:
1. Cada `git push` fará deploy automático
2. Preview URLs para branches de desenvolvimento
3. Production URL para branch main

### Suporte

Se precisar ajustar limites ou configurações, edite:
- `/src/app/api/process-document/route.ts` para lógica de negócio
- Variáveis de ambiente no Vercel para chaves e configurações

---

**Nota**: O sistema está preparado para escalar. Quando implementar autenticação e pagamentos, os usuários terão experiência completa de SaaS com controle total de uso e faturamento.