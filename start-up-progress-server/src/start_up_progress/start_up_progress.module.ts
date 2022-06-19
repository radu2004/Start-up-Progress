import { Module } from '@nestjs/common';
import { StartUpProgressController } from './start_up_progress.controllers';
import { StartUpProgressService } from './start_up_progress.service';

@Module({
  controllers: [StartUpProgressController],
  providers: [StartUpProgressService],
})
export class StartUpProgressModule {}
