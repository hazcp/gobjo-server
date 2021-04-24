import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import mongoService from './mongo.service';
import { ObjectId } from 'mongodb';

@Controller(
  'job-status',
)

export class JobStatusController {

  @Get('find')
  async findAllJobsWithStatusX(@Query('studentId') studentId: string, @Query('jobStatus') jobStatus: string) {
    const conditions = {
      $and: [
        {studentId: studentId},
        {jobStatus : jobStatus}
        ]};
    const x =  await mongoService.db.collection('jobs-statuses').find(conditions).toArray();
    console.log(x);
    return x;
  }
  @Get('find/:id')
  async findJobStatus(@Param('id') id: string) {
    return await mongoService.db.collection('jobs-statuses').findOne({
      _id: new ObjectId(id),
    });
  }

  @Post()
  async createJobStatus(@Body() body: any) {
    await mongoService.db.collection('jobs-statuses').insertOne({
      jobId: body.jobId,
      studentId: body.studentId,
      appliedTime: body.appliedTime,
      jobStatus: body.jobStatus // string: hasSaved || hasApplied -> isAccepted || isRejected
    });
  }

  @Patch()
  async updateJobStatus(@Body() body: any) {

    const result = await mongoService.db.collection('jobs-statuses').findOne({
      jobId: body.jobId,
      studentId: body.studentId
    });

    if(result) {
      await mongoService.db.collection('jobs-statuses').updateOne({
        jobId: body.jobId,
        studentId: body.studentId
      }, {
        $set: {jobStatus: body.jobStatus}
        }
      );
    } else {
      await mongoService.db.collection('jobs-statuses').insertOne({
        jobId: body.jobId,
        studentId: body.studentId,
        jobStatus: body.jobStatus
      });
    }
  }

  @Delete(':id')
  async deleteJobStatus(@Param('id') id: string) {
    await mongoService.db.collection('jobs-statuses').deleteOne({
      _id: new ObjectId(id),
    });
  }
}