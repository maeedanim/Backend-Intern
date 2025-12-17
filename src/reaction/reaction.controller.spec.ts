import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../guards/auth.guard';
import { ReactionController } from './reaction.controller';
import { ReactionService } from './reaction.service';
describe('ReactionController', () => {
  let controller: ReactionController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: ReactionService;

  const mockReactionService = {
    getReactions: jest.fn(),
    countReactions: jest.fn(),
  };

  //   const mockReq: Partial<Request> = {
  //     user: { userId: 'user123' },
  //   };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReactionController],
      providers: [
        {
          provide: ReactionService,
          useValue: mockReactionService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReactionController>(ReactionController);
    service = module.get<ReactionService>(ReactionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  //   it('should return all replies', async () => {
  //     const replies = [{ id: '1' }];
  //     mockReplyService.getAllReply.mockResolvedValue(replies);

  //     const result = await controller.getAllReply();

  //     expect(result).toEqual(replies);
  //     expect(mockReplyService.getAllReply).toHaveBeenCalled();
  //   });

  //   it('should return reply by id', async () => {
  //     const reply = { id: '1' };
  //     mockReplyService.getReplyById.mockResolvedValue(reply);

  //     const result = await controller.getReplyById('1');

  //     expect(result).toEqual(reply);
  //   });

  //   it('should delete own Reply', async () => {
  //     mockReplyService.deleteReplyById.mockResolvedValue(undefined);

  //     const result = await controller.deleteReplyById(mockReq as Request, '1');

  //     expect(result).toEqual({ message: 'Reply Has Been Removed.' });
  //   });
});
