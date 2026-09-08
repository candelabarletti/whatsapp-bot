// Script interactivo para dar de alta un negocio-cliente nuevo.
// Uso: node scripts/create-tenant.js

const readline = require("node:readline");
const prisma = require("../src/config/db");

const QUESTIONS = [
  { key: "name", prompt: "Nombre del negocio: " },
  {
    key: "systemPrompt",
    prompt: "System prompt (instrucciones para Claude sobre este negocio): ",
  },
  {
    key: "whatsappPhoneNumberId",
    prompt: "Phone Number ID de WhatsApp (opcional, Enter para saltar): ",
    optional: true,
  },
  {
    key: "whatsappAccessToken",
    prompt: "Access Token de WhatsApp (opcional): ",
    optional: true,
  },
  {
    key: "instagramAccountId",
    prompt: "Instagram Account ID (opcional): ",
    optional: true,
  },
  {
    key: "instagramAccessToken",
    prompt: "Access Token de Instagram (opcional): ",
    optional: true,
  },
  {
    key: "handoffContact",
    prompt: "Contacto para avisos de escalamiento a humano, email o teléfono (opcional): ",
    optional: true,
  },
];

async function collectAnswers() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answers = {};
  let index = 0;

  console.log("=== Alta de nuevo negocio-cliente ===\n");
  rl.setPrompt(QUESTIONS[0].prompt);
  rl.prompt();

  for await (const line of rl) {
    answers[QUESTIONS[index].key] = line.trim() || null;
    index += 1;
    if (index >= QUESTIONS.length) break;
    rl.setPrompt(QUESTIONS[index].prompt);
    rl.prompt();
  }

  rl.close();
  return answers;
}

async function main() {
  const answers = await collectAnswers();

  if (!answers.name || !answers.systemPrompt) {
    throw new Error("Nombre y system prompt son obligatorios.");
  }

  const tenant = await prisma.tenant.create({ data: answers });
  console.log(`\n✅ Negocio creado: ${tenant.name} (id: ${tenant.id})`);
}

main()
  .catch((err) => {
    console.error("Error creando el tenant:", err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
