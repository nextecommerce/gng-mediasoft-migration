import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CronService {

    @Cron('*/1 * * * *') // Cron expression for running every minute
    runCronJob() {
        // Your cron job logic goes here
        console.log('Cron job executed at:', new Date());
    }
}