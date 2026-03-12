/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { FriendshipController } from './friendship.controller';
import { FriendshipService } from './friendship.service';

describe('FriendshipController', () => {
  let controller: FriendshipController;
  let service: FriendshipService;

  const mockFriendshipService = {
    sendRequest: jest.fn(),
    acceptRequest: jest.fn(),
    removeFriendship: jest.fn(),
    getAll: jest.fn(),
    getAccepted: jest.fn(),
    getPending: jest.fn(),
  };

  const mockRequest = {
    user: { userId: 1 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendshipController],
      providers: [
        { provide: FriendshipService, useValue: mockFriendshipService },
      ],
    }).compile();

    controller = module.get<FriendshipController>(FriendshipController);
    service = module.get<FriendshipService>(FriendshipService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should call sendRequest with the correct IDs', async () => {
    const receiverId = 2;
    await controller.sendRequest(mockRequest, receiverId);
    expect(service.sendRequest).toHaveBeenCalledWith(1, receiverId);
  });

  it('Should call acceptRequest with the correct IDs', async () => {
    const requesterId = 2;
    await controller.acceptRequest(mockRequest, requesterId);
    expect(service.acceptRequest).toHaveBeenCalledWith(1, requesterId);
  });

  it('Should call removeFriendship with the correct IDs', async () => {
    const otherUserId = 2;
    await controller.removeFriendship(mockRequest, otherUserId);
    expect(service.removeFriendship).toHaveBeenCalledWith(1, otherUserId);
  });

  it('Should call getAll with the correct user ID', async () => {
    await controller.getAll(mockRequest);
    expect(service.getAll).toHaveBeenCalledWith(1);
  });

  it('Should call getAccepted with the correct user ID', async () => {
    await controller.getAccepted(mockRequest);
    expect(service.getAccepted).toHaveBeenCalledWith(1);
  });

  it('Should call getPending with the correct user ID', async () => {
    await controller.getPending(mockRequest);
    expect(service.getPending).toHaveBeenCalledWith(1);
  });
});