const { PrismaClient } = require("../generated/prisma");

// Un solo cliente de Prisma para toda la app (patrón singleton recomendado).
const prisma = new PrismaClient();

module.exports = prisma;
