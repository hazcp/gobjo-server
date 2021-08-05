import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import mongoService from './mongo.service';
import { ObjectId } from 'mongodb';
import * as moment from 'moment';

@Controller(
  'job-status',
)

export class JobStatusController {

  @Get('find')
  async findAllJobsWithStatusX(@Query('studentId') studentId: string, @Query('jobStatus') jobStatus: string) {
    let now = moment(new Date()).toDate();
    const isoNow = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString();

    const conditions = {
      $and: [
        {studentId: studentId},
        {jobStatus : jobStatus},
        {timeOfJob: {$gte: isoNow}}
        ]};
    const x =  await mongoService.db.collection('jobs-statuses').find(conditions).toArray();

    const jobsStatusIds = x.map(job => new ObjectId(job.jobId)); // convert array to array of jobId's
    console.log(jobsStatusIds);

    const jobsSearchParametersConditions = {
    _id : {$in: jobsStatusIds}
    }

    const returnedJobList = await mongoService.db.collection("jobs").find(jobsSearchParametersConditions).toArray();
    return returnedJobList;
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
        studentId: body.studentId,
      }, {
        $set: {jobStatus: body.jobStatus}
        }
      );
    } else {
      const condition = {
        _id: new ObjectId(body.jobId)
      }
      const jobFromJobs =  await mongoService.db.collection('jobs').findOne(condition);
      const jobFromJobsTimeFrom = jobFromJobs.timeFrom;

      await mongoService.db.collection('jobs-statuses').insertOne({
        jobId: body.jobId,
        studentId: body.studentId,
        jobStatus: body.jobStatus,
        timeOfJob: jobFromJobsTimeFrom
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