import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import mongoService from './mongo.service';
import { ObjectId } from 'mongodb';

@Controller(
  'user',
)

export class UserController {

  @Get()
  async findAllUsers() {
    return await mongoService.db.collection('users').find().toArray();
  }

  @Get(':id')
  async findUser(@Param('id') id: string) {
    return await mongoService.db.collection('users').findOne({
      _id: new ObjectId(id)
    })
  }

  @Post()
  async createUser(@Body() body: any) {
    await mongoService.db.collection('users').insertOne({
      type: body.type,
      email: body.email,
      password: body.password
    });
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() body: any) {
    await mongoService.db.collection('users').updateOne({
      _id: new ObjectId(id)
    }, {
      $set:{
        name: body.name,
        age: body.age,
        postcode: body.postcode,
        university: body.university,
        hasBarStaffExp: body.hasBarStaffExp,
        hasWaiterExp: body.hasWaiterExp,
        hasKitchenPorterExp: body.hasKitchenPorterExp,
        savedJobs: body.savedJobs,
        signUpPageNum: body.signUpPageNum
      }
    });
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await mongoService.db.collection('users').deleteOne({
      _id: new ObjectId(id)
    });
  }
}

