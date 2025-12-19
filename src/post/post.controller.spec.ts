import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PostingWindowGuard } from './posting-window/guards/postingWindow.guard';

describe('PostController', () => {
  let controller: PostController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: PostService;

  const mockPostService = {
    getAllPost: jest.fn(),
    getPostById: jest.fn(),
    updatePostTitleDescription: jest.fn(),
    deletePostById: jest.fn(),
  };

  const mockReq: Partial<Request> = {
    user: { userId: 'user123' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        {
          provide: PostService,
          useValue: mockPostService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PostingWindowGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PostController>(PostController);
    service = module.get<PostService>(PostService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all posts', async () => {
    const posts = [{ id: '1' }];
    mockPostService.getAllPost.mockResolvedValue(posts);

    const result = await controller.getAllPost();

    expect(result).toEqual(posts);
    expect(mockPostService.getAllPost).toHaveBeenCalled();
  });

  it('should return post by id', async () => {
    const post = { id: '1' };
    mockPostService.getPostById.mockResolvedValue(post);

    const result = await controller.getPostById('1');

    expect(result).toEqual(post);
  });

  it('should delete own Post', async () => {
    mockPostService.deletePostById.mockResolvedValue(undefined);

    const result = await controller.deletePostById(mockReq as Request, '1');

    expect(result).toEqual({ message: 'Post Has Been Removed.' });
  });
});
