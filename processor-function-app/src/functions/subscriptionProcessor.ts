import { app, InvocationContext } from "@azure/functions";
import { Types } from "mongoose";
import { connectToDatabase } from "../db/connection";
import { emailService } from "../services/email.service";
import { employerProfileRepository } from "../repositories/employerProfile.repository";

type SubscriptionQueueMessage =
    | { type: 'renewal_reminder'; companyId: string; renewalDate: string }
    | { type: 'expiry_notification'; companyId: string };

export async function subscriptionProcessor(message: unknown, context: InvocationContext): Promise<void> {
    await connectToDatabase();
    context.log('subscriptionProcessor: received queue message', message);

    let payload: SubscriptionQueueMessage;

    try {
        payload = (typeof message === 'string' ? JSON.parse(message) : message) as SubscriptionQueueMessage;
    } catch {
        context.error('subscriptionProcessor: failed to parse queue message');
        return;
    }

    const companyObjectId = new Types.ObjectId(payload.companyId);
    const recipients = await employerProfileRepository.findApprovedEmailsForCompany(companyObjectId);

    if (recipients.length === 0) {
        context.warn(`subscriptionProcessor: no approved recipients found for company ${payload.companyId}, skipping email`);
        return;
    }

    switch (payload.type) {
        case 'renewal_reminder':
            await emailService.sendRenewalReminder(recipients, payload.companyId, payload.renewalDate);
            context.log(`subscriptionProcessor: sent renewal reminder to ${recipients.length} recipient(s) for company ${payload.companyId}`);
            break;

        case 'expiry_notification':
            await emailService.sendExpiryNotification(recipients, payload.companyId);
            context.log(`subscriptionProcessor: sent expiry notification to ${recipients.length} recipient(s) for company ${payload.companyId}`);
            break;

        default:
            context.warn('subscriptionProcessor: unknown message type', (payload as any).type);
    }
}

app.storageQueue('subscriptionProcessor', {
    queueName: 'subscription-queue',
    connection: 'AzureWebJobsStorage',
    handler: subscriptionProcessor,
});
