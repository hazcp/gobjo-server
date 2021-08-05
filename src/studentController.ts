import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import mongoService from './mongo.service';
import { ObjectId } from 'mongodb';

@Controller(
  'student',
)

export class StudentController {

  @Get()
  async findAllStudents() {
    return await mongoService.db.collection('students').find().toArray();
  }

  @Get('find')
  async isExistingStudentEmail(@Query('email') email: string) {
    const emailCount = await mongoService.db.collection('students').count({
      email: email
    });
    return {exists: emailCount > 0}
  }

  @Get('validate')
  async isPasswordCorrect(@Query('email') email: string,
                          @Query('password') password: string) {
    if(password === null) {
      password = "";
    }
    const student = await mongoService.db.collection('students').findOne({
      email: email
    });
    return {correct: password === student.password};
  }

  @Get(':id')
  async findStudent(@Param('id') id: string) {
    return await mongoService.db.collection('students').findOne({
      _id: new ObjectId(id)
    })
  }

  @Post('login')
  async loginStudent(@Query('email') email: string,
                     @Query('password') password: string) {
    return await mongoService.db.collection('students').findOne({
      email: email
    });
}


  @Post()
  async createStudent(@Body() body: any) {
    const student = await mongoService.db.collection('students').insertOne({
      email: body.email,
      password: body.password,
      pageNumber: 1
    });
    const idStudent = student.insertedId;
    return await mongoService.db.collection('students').findOne({
      _id: new ObjectId(idStudent)
    })
  }

  @Patch(':id')
  async updateStudent(@Param('id') id: string, @Body() body: any) {
    await mongoService.db.collection('students').updateOne({
      _id: new ObjectId(id)
    }, {
      $set: body,
    });
    return await mongoService.db.collection('students').findOne({
      _id: new ObjectId(id)
    })
  }

  @Delete(':id')
  async deleteStudent(@Param('id') id: string) {
    await mongoService.db.collection('students').deleteOne({
      _id: new ObjectId(id)
    });
  }
}

