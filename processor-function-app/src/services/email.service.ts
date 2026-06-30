import nodemailer from 'nodemailer';

export type EmailOptions = {
    to: string | string[];
    subject: string;
    html: string;
};

function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

async function sendEmail(options: EmailOptions): Promise<void> {
    const transporter = createTransporter();
    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
    });
}

export const emailService = {
    sendRenewalReminder: (to: string | string[], companyId: string, renewalDate: string) => {
        const formatted = new Date(renewalDate).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric',
        });
        return sendEmail({
            to,
            subject: 'Subscription renewal in 7 days',
            html: `
                <p>Hello,</p>
                <p>Your EnerJobs Premium subscription (company ID: <b>${companyId}</b>) is set to renew on <b>${formatted}</b>.</p>
                <p>To avoid any interruption to your service, please ensure your payment details are up to date.</p>
                <p>Thank you for being a Premium member.</p>
                <p>— The EnerJobs Team</p>
            `.trim(),
        });
    },

    sendExpiryNotification: (to: string | string[], companyId: string) =>
        sendEmail({
            to,
            subject: 'Subscription expired — downgraded to Free',
            html: `
                <p>Hello,</p>
                <p>Your EnerJobs Premium subscription (company ID: <b>${companyId}</b>) has expired and your account has been downgraded to the Free plan.</p>
                <p>You can renew your subscription at any time to regain access to Premium features.</p>
                <p>— The EnerJobs Team</p>
            `.trim(),
        }),

    sendJobExpiryReminder: (to: string | string[], jobTitle: string, expiresAt: string) => {
        const formatted = new Date(expiresAt).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric',
        });
        return sendEmail({
            to,
            subject: `Job listing expiring soon: ${jobTitle}`,
            html: `
                <p>Hello,</p>
                <p>Your job listing <b>${jobTitle}</b> is set to expire on <b>${formatted}</b>.</p>
                <p>Please log in to EnerJobs to renew or extend the listing before it expires.</p>
                <p>— The EnerJobs Team</p>
            `.trim(),
        });
    },

    sendJobExpiredNotification: (to: string | string[], jobTitle: string) =>
        sendEmail({
            to,
            subject: `Job listing expired: ${jobTitle}`,
            html: `
                <p>Hello,</p>
                <p>Your job listing <b>${jobTitle}</b> has expired and is no longer visible to candidates.</p>
                <p>You can repost or renew it at any time from your EnerJobs dashboard.</p>
                <p>— The EnerJobs Team</p>
            `.trim(),
        }),

    sendPromotionExpiryReminder: (to: string | string[], jobTitle: string, expiresAt: string) => {
        const formatted = new Date(expiresAt).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric',
        });
        console.log("to>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", to)
        return sendEmail({
            to,
            subject: 'Promotion expiring soon (3 days)',
            html: `
                <p>Hello,</p>
                <p>The promoted listing for <b>"${jobTitle}"</b> on EnerJobs will expire on <b>${formatted}</b>.</p>
                <p>After that date it will no longer appear in promoted slots. Log in to renew the promotion if needed.</p>
                <p>— The EnerJobs Team</p>
            `.trim(),
        });
    },

    sendPromotionExpiredNotification: (to: string | string[], jobTitle: string) =>
        sendEmail({
            to,
            subject: 'Promotion expired',
            html: `
                <p>Hello,</p>
                <p>The paid promotion for your job listing <b>"${jobTitle}"</b> has ended.</p>
                <p>The listing is still active but is no longer featured in promoted slots. You can purchase a new promotion from your EnerJobs dashboard.</p>
                <p>— The EnerJobs Team</p>
            `.trim(),
        }),

    sendJobRefreshAvailable: (to: string | string[], jobTitle: string) =>
        sendEmail({
            to,
            subject: 'Job refresh available — you can refresh this listing now',
            html: `
                <p>Hello,</p>
                <p>The 7-day refresh cooldown for your job listing <b>"${jobTitle}"</b> has cleared.</p>
                <p>You can now refresh this listing to move it back to the top of search results. Log in to your EnerJobs dashboard to refresh it.</p>
                <p>— The EnerJobs Team</p>
            `.trim(),
        }),
};
