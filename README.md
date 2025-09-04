# 📩 KiSite API – Envio de Formulários por E-mail

Este projeto é um **backend em Node.js com Express e Nodemailer**, criado para gerenciar o envio de e-mails a partir de formulários de contato em sites de clientes KiSite.  
Ele garante segurança, personalização e organização centralizada para todos os formulários.

---

## 🚀 Funcionalidades
- Recebe dados de formulários (`nome`, `e-mail`, `assunto`, `mensagem`).
- Envia e-mails via **SMTP** com **Nodemailer**.
- Proteção de credenciais usando variáveis de ambiente (`.env`).
- **CORS configurado** para aceitar apenas domínios autorizados.
- **Template HTML estilizado** para os e-mails, incluindo logo e cores da KiSite.
- Servidor de arquivos estáticos para hospedar a logo usada nos e-mails.

---

## 🛠️ Tecnologias Utilizadas
- [Node.js](https://nodejs.org/) – Ambiente de execução.
- [Express](https://expressjs.com/) – Framework para criação da API.
- [Nodemailer](https://nodemailer.com/) – Envio de e-mails via SMTP.
- [CORS](https://www.npmjs.com/package/cors) – Controle de acesso de origens externas.
- [Dotenv](https://www.npmjs.com/package/dotenv) – Gerenciamento de variáveis de ambiente.

---

## 📂 Estrutura do Projeto
backend/
├── public/ # Arquivos públicos (logo, imagens, etc.)
│ └── logo.png
├── src/
│ └── app.js # Código principal da API
├── .env # Variáveis de ambiente (não versionar!)
├── .gitignore # Arquivos ignorados pelo Git
├── package.json # Dependências e scripts
└── README.md # Documentação

yaml
Copiar código

---

## ⚙️ Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Configurações de SMTP
SMTP_USER=seu-email@seudominio.com
SMTP_PASS=sua-senha
SMTP_HOST=smtp.seuprovedor.com
SMTP_PORT=587

# Domínios permitidos (separados por vírgula)
ALLOWED_ORIGINS=https://www.kisite.com.br,http://localhost:5500

# Porta do servidor (Render define automaticamente em produção)
PORT=3000
▶️ Como Rodar o Projeto Localmente
Clone o repositório:

bash
Copiar código
git clone https://github.com/seuusuario/kisite-api.git
cd kisite-api
Instale as dependências:

bash
Copiar código
npm install
Configure o arquivo .env (veja exemplo acima).

Rode em modo desenvolvimento:

bash
Copiar código
npm run dev
ou em produção:

bash
Copiar código
npm start
🔗 Endpoints
✅ Teste da API
sql
Copiar código
GET /
Retorna:

json
Copiar código
"API do formulário de contato KiSite está no ar!"
📩 Envio de e-mail
bash
Copiar código
POST /send-email
Body (JSON):

json
Copiar código
{
  "from_name": "João da Silva",
  "from_email": "joao@email.com",
  "subject": "Orçamento",
  "message": "Gostaria de saber mais sobre seus serviços."
}
Resposta de sucesso:

json
Copiar código
{
  "success": true,
  "message": "Mensagem enviada com sucesso!"
}
Resposta de erro:

json
Copiar código
{
  "success": false,
  "message": "Falha ao enviar a mensagem."
}
📬 Template de E-mail
O e-mail enviado é estilizado com as cores da KiSite:

Amarelo: #f2ce00

Azul-escuro: #344467

Azul-marinho: #152034

Inclui a logo da KiSite no rodapé com link para o site.

🌍 Deploy
Este projeto pode ser hospedado em:

Render (recomendado)

Railway

Heroku (limitado no free tier)

No Render, basta:

Criar um novo Web Service apontando para este repositório.

Definir as variáveis de ambiente no painel (.env).

Deploy será automático a cada push no GitHub.

👨‍💻 Autor
Marco Antonio D' Agostino– Criação de sites e soluções digitais.
🔗 www.kisite.com.br

