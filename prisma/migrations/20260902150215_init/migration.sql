-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "whatsappPhoneNumberId" TEXT,
    "whatsappAccessToken" TEXT,
    "instagramAccountId" TEXT,
    "instagramAccessToken" TEXT,
    "handoffContact" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "externalContactId" TEXT NOT NULL,
    "needsHuman" BOOLEAN NOT NULL DEFAULT false,
    "paused" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Conversation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_whatsappPhoneNumberId_key" ON "Tenant"("whatsappPhoneNumberId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_instagramAccountId_key" ON "Tenant"("instagramAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_tenantId_channel_externalContactId_key" ON "Conversation"("tenantId", "channel", "externalContactId");
