# Deploy do Estilador IA no Vercel

## Como fazer o deploy gratuito no Vercel

### 1. Preparação
Primeiro, instale as dependências localmente para testar:

```bash
npm install
npm run dev
```

Acesse http://localhost:3000 para testar localmente.

### 2. Deploy no Vercel

#### Opção A: Deploy via CLI
1. Instale o Vercel CLI:
```bash
npm i -g vercel
```

2. Faça login:
```bash
vercel login
```

3. Execute o deploy:
```bash
vercel
```

4. Siga as instruções no terminal.

#### Opção B: Deploy via GitHub
1. Crie um repositório no GitHub
2. Faça push do código:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/seu-usuario/estilador-ia.git
git push -u origin main
```

3. Acesse [vercel.com](https://vercel.com)
4. Clique em "New Project"
5. Importe o repositório do GitHub
6. Vercel detectará automaticamente que é um projeto Next.js
7. Clique em "Deploy"

### 3. Configuração da API Key

Para não expor sua API key no código:

1. No painel do Vercel, vá em Settings > Environment Variables
2. Adicione:
   - Nome: `NEXT_PUBLIC_OPENAI_API_KEY`
   - Valor: sua chave da OpenAI
3. Redeploy o projeto

### 4. Uso

Após o deploy, você terá uma URL como:
- `https://estilador-ia.vercel.app`

Acesse a URL e use o aplicativo diretamente no navegador!

## Funcionalidades

- Upload de documentos .docx
- Processamento com IA usando OpenAI API
- Aplicação de estilos customizáveis
- Remoção de conteúdo específico
- Download do documento processado
- Interface moderna e responsiva

## Custos

- **Vercel**: Gratuito para uso pessoal (100GB de bandwidth/mês)
- **OpenAI API**: Pago por uso (~$0.002 por chamada com gpt-4o-mini)

## Segurança

- A API key é usada apenas no cliente (navegador)
- Não há servidor backend, tudo roda no navegador
- Os documentos não são armazenados em nenhum servidor
- Processamento 100% no lado do cliente

## Problemas Comuns

### "API Key inválida"
- Verifique se a chave está correta
- Confirme se tem créditos na OpenAI

### "Documento muito grande"
- O limite é baseado no plano da OpenAI
- Tente dividir documentos grandes

### "Erro de CORS"
- Isso não deve ocorrer pois usamos `dangerouslyAllowBrowser: true`
- Se ocorrer, verifique as configurações do Next.js