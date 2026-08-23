import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';

import { Role } from '@prisma/client';
import { PaginationPayloadDto } from 'src/main/apiutils';
import { CompletePublisherProfileDto } from './Dto/complete-creator-profile.dto';
import { CreateUserDto } from './Dto/user.create.dto';
import { UpdateUserDto } from './Dto/user.update.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(
    @Query() pagination: PaginationPayloadDto,
    @Query('role') role?: Role,
  ) {
    return this.usersService.findAll(pagination, role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post(':id/publisher-profile')
  completePublisherProfile(
    @Param('id') id: string,
    @Body() dto: CompletePublisherProfileDto,
  ) {
    return this.usersService.completePublisherProfile(id, dto);
  }
}
