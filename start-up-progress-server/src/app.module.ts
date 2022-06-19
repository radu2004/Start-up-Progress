import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StartUpProgressModule } from './start_up_progress/start_up_progress.module';

@Module({
  imports: [StartUpProgressModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
