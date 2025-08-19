# Instruções para Acessar o Site

## O servidor está rodando na porta 3003

Para acessar o site, use os seguintes URLs:

- **Home**: http://localhost:3003
- **Estilador**: http://localhost:3003/styler
- **Revisor**: http://localhost:3003/revision
- **Preços**: http://localhost:3003/pricing
- **Dashboard**: http://localhost:3003/dashboard
- **Debug (teste)**: http://localhost:3003/debug

## Soluções para Problemas de CSS

Se as páginas aparecerem sem formatação:

1. **Limpe o cache do navegador**:
   - Pressione Ctrl+Shift+Delete (ou Cmd+Shift+Delete no Mac)
   - Selecione "Cached images and files"
   - Clique em "Clear data"

2. **Force um refresh completo**:
   - Pressione Ctrl+Shift+R (ou Cmd+Shift+R no Mac) na página

3. **Use uma janela anônima/privada**:
   - Chrome: Ctrl+Shift+N
   - Firefox: Ctrl+Shift+P
   - Safari: Cmd+Shift+N

4. **Verifique o console do navegador**:
   - Pressione F12 para abrir as ferramentas de desenvolvedor
   - Vá para a aba "Console"
   - Procure por erros em vermelho

## Como navegar no site

Use o menu de navegação no topo da página para acessar as diferentes seções:
- **Home**: Página inicial com informações sobre o serviço
- **Estilador**: Ferramenta de estilização de documentos
- **Revisor**: Ferramenta de revisão de textos
- **Dashboard**: Painel de controle (requer login)
- **Suporte/Preços**: Informações sobre planos e preços

## Teste de Debug

Acesse http://localhost:3003/debug para verificar se o CSS está carregando corretamente. Esta página mostra:
- Status do carregamento do Tailwind CSS
- Exemplos de estilos aplicados
- Links de teste para navegação

## Deploy no Vercel

Para fazer o deploy no Vercel:

1. Faça commit de todas as mudanças:
   ```bash
   git add .
   git commit -m "Site completo com SaaS platform"
   git push
   ```

2. Acesse https://vercel.com e faça login

3. Importe o repositório do GitHub

4. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_OPENAI_API_KEY`: Sua chave da API OpenAI

5. Clique em "Deploy"

O site será publicado automaticamente e você receberá um URL público para acessar.