import { app } from '@azure/functions';
import { connectToDatabase } from './db/connection';

app.setup({
    enableHttpStream: true,
});

connectToDatabase();
