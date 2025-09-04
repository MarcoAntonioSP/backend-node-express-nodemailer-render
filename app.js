// app.js

// 1. IMPORTAÇÃO DOS MÓDULOS
require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit"); // Adicionado para limitar requisições
const createDOMPurify = require("dompurify"); // Adicionado para sanitizar HTML
const { JSDOM } = require("jsdom"); // Adicionado para dar um contexto de DOM ao dompurify no Node.js

// 2. CONFIGURAÇÕES INICIAIS
const app = express();
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

// Desabilita o header 'X-Powered-By' para maior segurança
app.disable("x-powered-by");

// 3. VARIÁVEIS DE AMBIENTE
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const host = process.env.SMTP_HOST || "smtp.umbler.com";
const port = process.env.SMTP_PORT || 587;
const appUrl =
  process.env.APP_URL || "https://backend-node-express-nodemailer-render.onrender.com";

// Verificação obrigatória das variáveis
if (!user || !pass || !host || !port) {
  console.error("❌ Variáveis de ambiente SMTP não configuradas corretamente.");
  process.exit(1);
}

// 4. MIDDLEWARES
// Segurança de headers HTTP
app.use(helmet());

// CORS dinâmico e mais seguro
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.length === 0 || !origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Acesso não permitido por CORS"));
    }
  },
  methods: "POST,GET",
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static("public"));

// Limite de requisições para todas as rotas
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Muitas requisições enviadas deste IP, por favor, tente novamente após 15 minutos.",
});

// Limite mais restrito para a rota de envio de e-mail
const sendEmailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Muitos e-mails enviados deste IP, por favor, tente novamente após 15 minutos.",
});

app.use(limiter);

// 5. ROTAS

// Healthcheck
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "email-backend" });
});

// Rota de teste
app.get("/", (req, res) => {
  res.status(200).send("API do formulário de contato KiSite está no ar!");
});

// Rota de envio de e-mail com limite de requisições
app.post("/send-email", sendEmailLimiter, async (req, res) => {
  const { from_name, from_email, subject, message } = req.body;

  if (!from_name || !from_email || !subject || !message) {
    return res
      .status(400)
      .json({ success: false, message: "Todos os campos são obrigatórios." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(from_email)) {
    return res
      .status(400)
      .json({ success: false, message: "E-mail inválido informado." });
  }

  const sanitizedName = DOMPurify.sanitize(from_name);
  const sanitizedSubject = DOMPurify.sanitize(subject);
  const sanitizedMessage = DOMPurify.sanitize(message);
  const sanitizedEmail = DOMPurify.sanitize(from_email);

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });

  const mailOptions = {
    from: `"${sanitizedName}" <${user}>`,
    to: user,
    replyTo: sanitizedEmail,
    subject: `Novo Contato do Site: ${sanitizedSubject}`,
    html: `
    <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
        <tr>
          <td style="background-color: #344467; color: #f2ce00; text-align: center; padding: 20px;">
            <h1 style="margin: 0; font-size: 24px;">Novo Contato</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px; color: #152034;">
            <p style="font-size: 16px;">Você recebeu uma nova mensagem do formulário de contato do site.</p>
            <h3 style="margin-bottom: 5px; color: #f2ce00;">Detalhes do Contato:</h3>
            <p><strong>Nome:</strong> ${sanitizedName}</p>
            <p><strong>E-mail:</strong> ${sanitizedEmail}</p>
            <p><strong>Assunto:</strong> ${sanitizedSubject}</p>
            <hr style="border:none; border-top:1px solid #e0e0e0; margin: 20px 0;">
            <h3 style="margin-bottom: 5px; color: #f2ce00;">Mensagem:</h3>
            <p style="background: #f0f0f0; padding: 15px; border-radius: 5px; font-size: 15px; color: #152034;">${sanitizedMessage}</p>
            <p style="font-size: 12px; color: #999999; margin-top: 20px;">Enviado via KiSite</p>
          </td>
        </tr>
        <tr>
          <td style="background-color: #f7f7f7; text-align: center; padding: 15px;">
            <a href="https://www.kisite.com.br" target="_blank">
              <img src="https://backend-node-express-nodemailer-render.onrender.com/logo.png" alt="Logo KiSite" style="height: 60px; margin-bottom: 10px;">
            </a>
            <p style="font-size: 12px; color: #344467; margin: 0;">&copy; ${new Date().getFullYear()} KiSite. Todos os direitos reservados.</p>
          </td>
        </tr>
      </table>
    </div>
  `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Mensagem enviada: %s", info.messageId);
    res
      .status(200)
      .json({ success: true, message: "Mensagem enviada com sucesso!" });
  } catch (error) {
    console.error("❌ Erro ao enviar e-mail:", error);
    res
      .status(500)
      .json({ success: false, message: "Falha ao enviar a mensagem." });
  }
}); // <--- Esta é a chave que provavelmente estava faltando

// 6. INICIALIZAÇÃO DO SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});