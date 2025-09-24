-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_notification" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sms_notification" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "whatsapp_notification" BOOLEAN NOT NULL DEFAULT false;
