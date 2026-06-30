import { app, InvocationContext } from "@azure/functions";
import { Types } from "mongoose";
import { connectToDatabase } from "../db/connection";
import { emailService } from "../services/email.service";
import { employerProfileRepository } from "../repositories/employerProfile.repository";

type JobExpiryQueueMessage =
    | { type: 'job_expiry_reminder'; jobId: string; companyId: string; jobTitle: string; expiresAt: string }
    | { type: 'job_expired';         jobId: string; companyId: string; jobTitle: string };

export async function jobProcessor(message: unknown, context: InvocationContext): Promise<void> {
    await connectToDatabase();
    context.log('jobProcessor: received queue message', message);

    let payload: JobExpiryQueueMessage;

    try {
        payload = (typeof message === 'string' ? JSON.parse(message) : message) as JobExpiryQueueMessage;
    } catch {
        context.error('jobProcessor: failed to parse queue message');
        return;
    }

    const companyObjectId = new Types.ObjectId(payload.companyId);
    const recipients = await employerProfileRepository.findApprovedEmailsForCompany(companyObjectId);

    if (recipients.length === 0) {
        context.warn(`jobProcessor: no approved recipients found for company ${payload.companyId}, skipping email`);
        return;
    }

    switch (payload.type) {
        case 'job_expiry_reminder':
            await emailService.sendJobExpiryReminder(recipients, payload.jobTitle, payload.expiresAt);
            context.log(`jobProcessor: sent job expiry reminder to ${recipients.length} recipient(s) for job ${payload.jobId}`);
            break;

        case 'job_expired':
            await emailService.sendJobExpiredNotification(recipients, payload.jobTitle);
            context.log(`jobProcessor: sent job expired notification to ${recipients.length} recipient(s) for job ${payload.jobId}`);
            break;

        default:
            context.warn('jobProcessor: unknown message type', (payload as any).type);
    }
}

app.storageQueue('jobProcessor', {
    queueName: 'job-expiry-queue',
    connection: 'AzureWebJobsStorage',
    handler: jobProcessor,
});
