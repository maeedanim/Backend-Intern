import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: UserService;

  const mockUserService = {
    getAllUser: jest.fn(),
    getUserById: jest.fn(),
    updateUserSkillExperience: jest.fn(),
    deleteUserById: jest.fn(),
  };

  const mockReq: Partial<Request> = {
    user: { userId: 'user123' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all users', async () => {
    const users = [{ id: '1' }];
    mockUserService.getAllUser.mockResolvedValue(users);

    const result = await controller.getAllUser();

    expect(result).toEqual(users);
    expect(mockUserService.getAllUser).toHaveBeenCalled();
  });

  it('should return user by id', async () => {
    const user = { id: 'user123' };
    mockUserService.getUserById.mockResolvedValue(user);

    const result = await controller.getUserById('user123');

    expect(result).toEqual(user);
  });

  it('should delete own account', async () => {
    mockUserService.deleteUserById.mockResolvedValue(undefined);

    const result = await controller.deleteUserById(
      mockReq as Request,
      'user123',
    );

    expect(result).toEqual({ message: 'User Has Been Removed.' });
  });
});
