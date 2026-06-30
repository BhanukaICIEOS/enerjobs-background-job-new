import { app, InvocationContext } from "@azure/functions";
import { Types } from "mongoose";
import { connectToDatabase } from "../db/connection";
import { emailService } from "../services/email.service";
import { employerProfileRepository } from "../repositories/employerProfile.repository";

type PromotionQueueMessage =
    | { type: 'promotion_expiry_reminder'; promotionId: string; companyId: string; jobTitle: string; expiresAt: string }
    | { type: 'promotion_expired';         promotionId: string; companyId: string; jobTitle: string };

export async function promotionProcessor(message: unknown, context: InvocationContext): Promise<void> {
    await connectToDatabase();
    context.log('promotionProcessor: received queue message', message);

    let payload: PromotionQueueMessage;

    try {
        payload = (typeof message === 'string' ? JSON.parse(message) : message) as PromotionQueueMessage;
    } catch {
        context.error('promotionProcessor: failed to parse queue message');
        return;
    }

    const companyObjectId = new Types.ObjectId(payload.companyId);
    const recipients = await employerProfileRepository.findApprovedEmailsForCompany(companyObjectId);

    console.log("recipients>>>>>>>>>>>>>>>>>>>>>>>>", recipients)
    if (recipients.length === 0) {
        context.warn(`promotionProcessor: no approved recipients found for company ${payload.companyId}, skipping email`);
        return;
    }

    switch (payload.type) {
        case 'promotion_expiry_reminder':
            await emailService.sendPromotionExpiryReminder(recipients, payload.jobTitle, payload.expiresAt);
            context.log(`promotionProcessor: sent promotion expiry reminder to ${recipients.length} recipient(s) for promotion ${payload.promotionId}`);
            break;

        case 'promotion_expired':
            await emailService.sendPromotionExpiredNotification(recipients, payload.jobTitle);
            context.log(`promotionProcessor: sent promotion expired notification to ${recipients.length} recipient(s) for promotion ${payload.promotionId}`);
            break;

        default:
            context.warn('promotionProcessor: unknown message type', (payload as any).type);
    }
}

app.storageQueue('promotionProcessor', {
    queueName: 'promotion-queue',
    connection: 'AzureWebJobsStorage',
    handler: promotionProcessor,
});
