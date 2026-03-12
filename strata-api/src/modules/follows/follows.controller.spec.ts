/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { FollowsController } from './follows.controller';
import { FollowsService } from './follows.service';

describe('FollowsController', () => {
  let controller: FollowsController;
  let service: FollowsService;

  const mockFollowsService = {
    follow: jest.fn(),
    unfollow: jest.fn(),
    getFollowers: jest.fn(),
    getFollowing: jest.fn(),
  };

  const mockRequest = {
    user: { userId: 1 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FollowsController],
      providers: [
        { provide: FollowsService, useValue: mockFollowsService },
      ],
    }).compile();

    controller = module.get<FollowsController>(FollowsController);
    service = module.get<FollowsService>(FollowsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should call getFollowers with user ID', async () => {
    await controller.getFollowers(mockRequest);
    expect(service.getFollowers).toHaveBeenCalledWith(1);
  });

  it('Should call getFollowing with user ID', async () => {
    await controller.getFollowing(mockRequest);
    expect(service.getFollowing).toHaveBeenCalledWith(1);
  });

  it('Should call follow with correct IDs', async () => {
    const targetUserId = 2;
    await controller.follow(mockRequest, targetUserId);
    expect(service.follow).toHaveBeenCalledWith(1, targetUserId);
  });

  it('Should call unfollow with correct IDs', async () => {
    const targetUserId = 2;
    await controller.unfollow(mockRequest, targetUserId);
    expect(service.unfollow).toHaveBeenCalledWith(1, targetUserId);
  });
});