import { app, InvocationContext, Timer } from "@azure/functions";
import { connectToDatabase } from "../db/connection";
import { refreshCheckerService } from "../services/refreshChecker.service";

export async function refreshChecker(_myTimer: Timer, context: InvocationContext): Promise<void> {
    await connectToDatabase();
    const count = await refreshCheckerService.processRefreshableJobs();
    context.log(`refreshChecker: sent ${count} refresh-available notification(s)`);
}

app.timer('refreshChecker', {
    schedule: '0 * * * * *', // TEMP: revert to '0 0 * * * *'
    handler: refreshChecker
});
