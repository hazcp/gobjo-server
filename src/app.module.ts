

import { Module } from '@nestjs/common';
import { StudentController } from './studentController';
import { JobController } from './jobController';
import { JobStatusController } from './jobStatusController';

@Module({
  imports: [],
  controllers: [StudentController, JobController, JobStatusController],
  providers: [],
})

export class AppModule {}
