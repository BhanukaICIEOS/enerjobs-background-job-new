import { app, InvocationContext, Timer } from "@azure/functions";
import { connectToDatabase } from "../db/connection";
import { seoAggregationService } from "../services/seoAggregation.service";

export async function seoWorkerChecker(_myTimer: Timer, context: InvocationContext): Promise<void> {
    await connectToDatabase();

    await seoAggregationService.computeAll();

    context.log('seoWorkerChecker: SEO aggregation run complete');
}

app.timer('seoWorkerChecker', {
    schedule: '0 0 2 * * *',
    handler: seoWorkerChecker
});
