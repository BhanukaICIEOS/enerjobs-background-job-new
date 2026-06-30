import { app, InvocationContext } from "@azure/functions";
import { Types } from "mongoose";
import { connectToDatabase } from "../db/connection";
import { emailService } from "../services/email.service";
import { employerProfileRepository } from "../repositories/employerProfile.repository";

type JobRefreshQueueMessage =
    | { type: 'refresh_available'; jobId: string; companyId: string; jobTitle: string };

export async function jobRefreshProcessor(message: unknown, context: InvocationContext): Promise<void> {
    await connectToDatabase();
    context.log('jobRefreshProcessor: received queue message', message);

    let payload: JobRefreshQueueMessage;

    try {
        payload = (typeof message === 'string' ? JSON.parse(message) : message) as JobRefreshQueueMessage;
    } catch {
        context.error('jobRefreshProcessor: failed to parse queue message');
        return;
    }

    const companyObjectId = new Types.ObjectId(payload.companyId);
    const recipients = await employerProfileRepository.findApprovedEmailsForCompany(companyObjectId);

    if (recipients.length === 0) {
        context.warn(`jobRefreshProcessor: no approved recipients found for company ${payload.companyId}, skipping email`);
        return;
    }

    await emailService.sendJobRefreshAvailable(recipients, payload.jobTitle);
    context.log(`jobRefreshProcessor: sent refresh-available email to ${recipients.length} recipient(s) for job ${payload.jobId}`);
}

app.storageQueue('jobRefreshProcessor', {
    queueName: 'job-refresh-queue',
    connection: 'AzureWebJobsStorage',
    handler: jobRefreshProcessor,
});
