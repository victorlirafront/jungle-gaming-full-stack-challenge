import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TasksService } from './tasks.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  FilterTasksDto,
  CreateCommentDto,
  GetCommentsDto,
} from './dto';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @MessagePattern('tasks.create')
  async create(@Payload() payload: { data: CreateTaskDto; userId: string }) {
    return this.tasksService.create(payload.data, payload.userId);
  }

  @MessagePattern('tasks.findAll')
  async findAll(@Payload() filterDto: FilterTasksDto) {
    return this.tasksService.findAll(filterDto);
  }

  @MessagePattern('tasks.findOne')
  async findOne(@Payload() id: string) {
    return this.tasksService.findOne(id);
  }

  @MessagePattern('tasks.update')
  async update(
    @Payload() payload: { id: string; data: UpdateTaskDto; userId: string }
  ) {
    return this.tasksService.update(payload.id, payload.data, payload.userId);
  }

  @MessagePattern('tasks.remove')
  async remove(@Payload() payload: { id: string; userId: string }) {
    await this.tasksService.remove(payload.id, payload.userId);
    return { success: true };
  }

  @MessagePattern('tasks.createComment')
  async createComment(
    @Payload()
    payload: { taskId: string; data: CreateCommentDto; userId: string }
  ) {
    return this.tasksService.createComment(
      payload.taskId,
      payload.data,
      payload.userId
    );
  }

  @MessagePattern('tasks.getComments')
  async getComments(
    @Payload() payload: { taskId: string; query: GetCommentsDto }
  ) {
    return this.tasksService.getComments(payload.taskId, payload.query);
  }

  @MessagePattern('tasks.getHistory')
  async getHistory(@Payload() taskId: string) {
    return this.tasksService.getHistory(taskId);
  }
}

