import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CronService {

    // @Cron('* * * * * *') // Cron expression for running every minute
    // handleCron() {
    //     // Your cron job logic goes here
    //     console.log('Cron job executed from service at:', new Date());
    // }
    
}