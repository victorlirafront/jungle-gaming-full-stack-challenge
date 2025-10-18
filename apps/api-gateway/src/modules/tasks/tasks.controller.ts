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
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard, CurrentUser, JwtPayload } from '../../common';
import {
  CreateTaskDto,
  UpdateTaskDto,
  FilterTasksDto,
  CreateCommentDto,
  GetCommentsDto,
  GetHistoryDto,
} from './dto';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(
    @Inject('TASKS_SERVICE')
    private tasksClient: ClientProxy
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  async create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: JwtPayload) {
    return firstValueFrom(
      this.tasksClient.send('tasks.create', {
        data: createTaskDto,
        userId: user.sub,
      })
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with optional filters' })
  @ApiResponse({ status: 200, description: 'Return all tasks' })
  async findAll(@Query() filterDto: FilterTasksDto) {
    return firstValueFrom(this.tasksClient.send('tasks.findAll', filterDto));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiResponse({ status: 200, description: 'Return task' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.tasksClient.send('tasks.findOne', id));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: JwtPayload
  ) {
    return firstValueFrom(
      this.tasksClient.send('tasks.update', {
        id,
        data: updateTaskDto,
        userId: user.sub,
      })
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return firstValueFrom(
      this.tasksClient.send('tasks.remove', { id, userId: user.sub })
    );
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add comment to task' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async createComment(
    @Param('id') taskId: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: JwtPayload
  ) {
    return firstValueFrom(
      this.tasksClient.send('tasks.createComment', {
        taskId,
        data: createCommentDto,
        userId: user.sub,
      })
    );
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Get task comments' })
  @ApiResponse({ status: 200, description: 'Return task comments' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async getComments(
    @Param('id') taskId: string,
    @Query() getCommentsDto: GetCommentsDto
  ) {
    return firstValueFrom(
      this.tasksClient.send('tasks.getComments', {
        taskId,
        query: getCommentsDto,
      })
    );
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get task history' })
  @ApiResponse({ status: 200, description: 'Return task history' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async getHistory(
    @Param('id') taskId: string,
    @Query() getHistoryDto: GetHistoryDto
  ) {
    return firstValueFrom(
      this.tasksClient.send('tasks.getHistory', {
        taskId,
        query: getHistoryDto,
      })
    );
  }
}

