// Uso: node scripts/list-tenants.js
const prisma = require("../src/config/db");

async function main() {
  const tenants = await prisma.tenant.findMany();
  if (tenants.length === 0) {
    console.log("No hay negocios cargados todavía. Usá scripts/create-tenant.js");
    return;
  }
  for (const t of tenants) {
    console.log(`- ${t.name} (id: ${t.id})`);
    console.log(`    WhatsApp: ${t.whatsappPhoneNumberId || "no conectado"}`);
    console.log(`    Instagram: ${t.instagramAccountId || "no conectado"}`);
  }
}

main().finally(() => prisma.$disconnect());
