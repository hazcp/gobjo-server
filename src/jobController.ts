import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import mongoService from './mongo.service';
import { ObjectId } from 'mongodb';
import { postCodeToLatLong } from './postcodeToLatLong';
import { generateLatLongRange } from './generateLatLongRange';
import * as moment from 'moment';

@Controller(
  'job',
)

export class JobController {

  @Get()
  async findAllJobs() {
    return await mongoService.db.collection('jobs').find().toArray();
  }


    @Get('search')
    async searchJobs(@Query('postcode') postcode: string,
                      @Query('specifiedDistance') specifiedDistance: string,
                      @Query('isToday') isToday: string,
                     @Query('studentId') studentId: string) {

    const specifiedDistanceNumber = Number.parseFloat(specifiedDistance);

    const studentsLatLong = await postCodeToLatLong(postcode);

    const searchArea = generateLatLongRange(studentsLatLong, specifiedDistanceNumber);
    console.log(searchArea);



    const isTodayBool = JSON.parse(isToday);
    let fromDate: Date;
    let toDate: Date;
    if(isTodayBool) {
      // find jobs that begin from now until the end of the day
      fromDate = moment(new Date()).toDate();
      toDate = moment(new Date().setHours(23,59,59,0)).toDate();
    } else {
      // find jobs that begin tomorrow until the last day of next week
      fromDate = moment(new Date().setHours(0,1,0,0)).add(1, 'days').toDate();
      toDate = moment(new Date().setHours(23,59,59,0)).add(7, 'days').toDate();
    }
    // add timezone offset then convert to ISO 8601 format, as a String
      console.log(fromDate.getTime());
    const isoTimeFrom = new Date(fromDate.getTime() - (fromDate.getTimezoneOffset() * 60000)).toISOString();
    const isoTimeTo = new Date(toDate.getTime() - (toDate.getTimezoneOffset() * 60000)).toISOString();

    // find out which jobs student has applied for
    const jobsAppliedForCondition = {
      $and: [
        {studentId: studentId},
        {jobStatus : "hasApplied"}
      ]};

    const jobsAppliedFor = await mongoService.db.collection('jobs-statuses').find(jobsAppliedForCondition).toArray();
    const jobsAppliedForIds = jobsAppliedFor.map(job => new ObjectId(job.jobId)); // convert array to array of jobId's


    const getStudentCondition = {
        _id: new ObjectId(studentId)
      };

    const getStudent = await mongoService.db.collection('students').findOne(getStudentCondition);
    let isBarStaff = getStudent["isBarStaff"];
    let isKitchenPorter = getStudent["isKitchenPorter"];
    let isWaiter = getStudent["isWaiter"];
    const studentExperience = [];

    if(isBarStaff == true) {
      studentExperience.push("Bar Staff");
    }
    if(isKitchenPorter == true) {
      studentExperience.push("Kitchen Porter");
    }
    if(isWaiter == true) {
      studentExperience.push("Waiter");
    }

      const jobsSearchParametersConditions = {
        $and: [
          {latitude : {$gte: searchArea.southEast.lat}},
          {latitude : {$lte: searchArea.northWest.lat}},
          {longitude : {$lte: searchArea.southEast.long}},
          {longitude : {$gte: searchArea.northWest.long}},
          {timeFrom : {$gte: isoTimeFrom, $lte: isoTimeTo}},
          {_id : {$nin: jobsAppliedForIds}},
          {title: {$in: studentExperience}}
        ]
      };

      const jobsSearchSortByCondition = {
      timeFrom: 1
    }

    const jobs = await mongoService.db.collection('jobs').find(jobsSearchParametersConditions).sort(jobsSearchSortByCondition).toArray();

    const jobsSavedCondition = {
      $and: [
        {studentId: studentId},
        {jobStatus : "hasSaved"}
      ]};

    const jobsSaved = await mongoService.db.collection('jobs-statuses').find(jobsSavedCondition).toArray();
    const jobsSavedIds = jobsSaved.map(jobStatus => jobStatus.jobId.toString()); // convert array to array of jobId's

    jobs.forEach(job => { job.isSaved = jobsSavedIds.indexOf(job._id.toString()) > -1 } )

    return jobs;
  }



  // @Get('find/:id')
  // async findJob(@Param('id') id: string) {
  //   const jobsSavedCondition = {
  //     $and: [
  //       {studentId: studentId},
  //       {jobStatus : "hasSaved"}
  //     ]};
  //
  //   const jobsSaved = await mongoService.db.collection('jobs-statuses').find(jobsSavedCondition).toArray();
  //   const jobsSavedIds = jobsSaved.map(job => job.jobId.toString()); // convert array to array of jobI
  //
  //   return await mongoService.db.collection('jobs').findOne({
  //     _id: new ObjectId(id),
  //   });
  // }

  @Get('find')
  async findJob(@Query('jobId') jobId: string,
                @Query('studentId') studentId: string) {
    const jobsSavedCondition = {
      $and: [
        {studentId: studentId},
        {jobId: jobId},
        {jobStatus : "hasSaved"}
      ]};

    const isJobSaved = await mongoService.db.collection('jobs-statuses').findOne(jobsSavedCondition);

    const job =  await mongoService.db.collection('jobs').findOne({
      _id: new ObjectId(jobId),
    });
    job.isSaved = !! isJobSaved;
    return job;
  }

  @Post()
  async createJob(@Body() body: any) {
    await mongoService.db.collection('jobs').insertOne({
      title: body.title,
      employer: body.employer,
      wage: body.wage,
      timeFrom: body.timeFrom,
      timeTo: body.timeTo,
      location: body.location,
      postcode: body.postcode,
      description: body.description,
      latitude: body.latitude,
      longitude: body.longitude
    });
  }

  @Patch(':id')
  async updateJob(@Param('id') id: string, @Body() body: any) {
    await mongoService.db.collection('jobs').updateOne({
      _id: new ObjectId(id),
    }, {
      $set: body,
    });
  }

  @Delete(':id')
  async deleteJob(@Param('id') id: string) {
    await mongoService.db.collection('jobs').deleteOne({
      _id: new ObjectId(id),
    });
  }
}