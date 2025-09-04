// app.js

// 1. IMPORTAÇÃO DOS MÓDULOS
require("dotenv").config(); // carrega as variáveis do .env
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

// 2. CONFIGURAÇÕES INICIAIS
const app = express();

// 3. VARIÁVEIS DE AMBIENTE
// No Render, configure estas variáveis no painel
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const host = process.env.SMTP_HOST || "smtp.umbler.com";
const port = process.env.SMTP_PORT || 587;

// 4. CONFIGURAÇÃO DE CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
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

// 5. ROTAS

// Rota de teste
app.get("/", (req, res) => {
  res.status(200).send("API do formulário de contato KiSite está no ar!");
});

// Rota de envio de e-mail
app.post("/send-email", async (req, res) => {
  const { from_name, from_email, subject, message } = req.body;

  if (!from_name || !from_email || !subject || !message) {
    return res
      .status(400)
      .json({ success: false, message: "Todos os campos são obrigatórios." });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT), // garante que seja número
    secure: false, // false para porta 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: `"${from_name}" <${user}>`,
    to: user,
    replyTo: from_email,
    subject: `Novo Contato do Site: ${subject}`,
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
            <p><strong>Nome:</strong> ${from_name}</p>
            <p><strong>E-mail:</strong> ${from_email}</p>
            <p><strong>Assunto:</strong> ${subject}</p>
            
            <hr style="border:none; border-top:1px solid #e0e0e0; margin: 20px 0;">
            
            <h3 style="margin-bottom: 5px; color: #f2ce00;">Mensagem:</h3>
            <p style="background: #f0f0f0; padding: 15px; border-radius: 5px; font-size: 15px; color: #152034;">${message}</p>
            
            <p style="font-size: 12px; color: #999999; margin-top: 20px;">Enviado via KiSite</p>
          </td>
        </tr>
        <tr>
          <td style="background-color: #f7f7f7; text-align: center; padding: 15px;">
            <a href="https://www.kisite.com.br" target="_blank"><img src="http://localhost:3000/logo.png" alt="Logo KiSite" style="height: 60px; margin-bottom: 10px;"></a>
            <p style="font-size: 12px; color: #344467; margin: 0;">&copy; ${new Date().getFullYear()} KiSite. Todos os direitos reservados.</p>
          </td>
        </tr>
      </table>
    </div>
  `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Mensagem enviada: %s", info.messageId);
    res
      .status(200)
      .json({ success: true, message: "Mensagem enviada com sucesso!" });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    res
      .status(500)
      .json({ success: false, message: "Falha ao enviar a mensagem." });
  }
});

// 6. INICIALIZAÇÃO DO SERVIDOR
// Render define a porta automaticamente com process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
