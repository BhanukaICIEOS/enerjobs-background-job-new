import { QueueServiceClient } from '@azure/storage-queue';

const QUEUE_NAMES = {
    subscription: 'subscription-queue',
    jobExpiry:    'job-expiry-queue',
    promotion:    'promotion-queue',
    jobRefresh:   'job-refresh-queue',
} as const;

export type SubscriptionQueueMessage =
    | { type: 'renewal_reminder';   companyId: string; renewalDate: string }
    | { type: 'expiry_notification'; companyId: string };

export type JobExpiryQueueMessage =
    | { type: 'job_expiry_reminder'; jobId: string; companyId: string; jobTitle: string; expiresAt: string }
    | { type: 'job_expired';         jobId: string; companyId: string; jobTitle: string };

export type PromotionQueueMessage =
    | { type: 'promotion_expiry_reminder'; promotionId: string; companyId: string; jobTitle: string; expiresAt: string }
    | { type: 'promotion_expired';         promotionId: string; companyId: string; jobTitle: string };

export type JobRefreshQueueMessage =
    | { type: 'refresh_available'; jobId: string; companyId: string; jobTitle: string };

let client: QueueServiceClient | null = null;

function getClient(): QueueServiceClient {
    if (!client) {
        const connectionString = process.env.AzureWebJobsStorage;
        if (!connectionString) throw new Error('AzureWebJobsStorage environment variable is not set');
        client = QueueServiceClient.fromConnectionString(connectionString);
    }
    return client;
}

async function sendMessage(queueName: string, message: object): Promise<void> {
    const queueClient = getClient().getQueueClient(queueName);
    await queueClient.createIfNotExists();
    const encoded = Buffer.from(JSON.stringify(message)).toString('base64');
    await queueClient.sendMessage(encoded);
}

export const queueService = {
    sendSubscriptionMessage: (message: SubscriptionQueueMessage) =>
        sendMessage(QUEUE_NAMES.subscription, message),

    sendJobExpiryMessage: (message: JobExpiryQueueMessage) =>
        sendMessage(QUEUE_NAMES.jobExpiry, message),

    sendPromotionMessage: (message: PromotionQueueMessage) =>
        sendMessage(QUEUE_NAMES.promotion, message),

    sendJobRefreshMessage: (message: JobRefreshQueueMessage) =>
        sendMessage(QUEUE_NAMES.jobRefresh, message),
};
