import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { AuthGuard } from '../guards/auth.guard';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
describe('CommentController', () => {
  let controller: CommentController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: CommentService;

  const mockCommentService = {
    getAllComment: jest.fn(),
    getCommentById: jest.fn(),
    updateCommentTitleDescription: jest.fn(),
    deleteCommentById: jest.fn(),
  };

  const mockReq: Partial<Request> = {
    user: { userId: 'user123' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        {
          provide: CommentService,
          useValue: mockCommentService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CommentController>(CommentController);
    service = module.get<CommentService>(CommentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all comments', async () => {
    const comments = [{ id: '1' }];
    mockCommentService.getAllComment.mockResolvedValue(comments);

    const result = await controller.getAllComment();

    expect(result).toEqual(comments);
    expect(mockCommentService.getAllComment).toHaveBeenCalled();
  });

  it('should return comment by id', async () => {
    const comment = { id: '1' };
    mockCommentService.getCommentById.mockResolvedValue(comment);

    const result = await controller.getCommentById('1');

    expect(result).toEqual(comment);
  });

  it('should delete own Comment', async () => {
    mockCommentService.deleteCommentById.mockResolvedValue(undefined);

    const result = await controller.deleteCommentById(mockReq as Request, '1');

    expect(result).toEqual({ message: 'Comment Has Been Removed.' });
  });
});
