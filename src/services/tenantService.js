const prisma = require("../config/db");

function findTenantByWhatsappPhoneNumberId(phoneNumberId) {
  return prisma.tenant.findUnique({ where: { whatsappPhoneNumberId: phoneNumberId } });
}

function findTenantByInstagramAccountId(instagramAccountId) {
  return prisma.tenant.findUnique({ where: { instagramAccountId } });
}

function createTenant(data) {
  return prisma.tenant.create({ data });
}

module.exports = {
  findTenantByWhatsappPhoneNumberId,
  findTenantByInstagramAccountId,
  createTenant,
};
