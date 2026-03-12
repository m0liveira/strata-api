/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { TripMembersController } from './trip-members.controller';
import { TripMembersService } from './trip-members.service';

describe('TripMembersController', () => {
  let controller: TripMembersController;
  let service: TripMembersService;

  const mockTripMembersService = {
    inviteUser: jest.fn(),
    acceptInvite: jest.fn(),
    removeMemberOrDecline: jest.fn(),
  };

  const mockRequest = {
    user: { userId: 1 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripMembersController],
      providers: [
        { provide: TripMembersService, useValue: mockTripMembersService },
      ],
    }).compile();

    controller = module.get<TripMembersController>(TripMembersController);
    service = module.get<TripMembersService>(TripMembersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should call inviteUser with correct arguments', async () => {
    const tripId = 'trip-123';
    const targetUserId = 2;
    await controller.inviteUser(mockRequest, tripId, targetUserId);
    expect(service.inviteUser).toHaveBeenCalledWith(tripId, 1, targetUserId);
  });

  it('Should call acceptInvite with correct arguments', async () => {
    const tripId = 'trip-123';
    await controller.acceptInvite(mockRequest, tripId);
    expect(service.acceptInvite).toHaveBeenCalledWith(tripId, 1);
  });

  it('Should call removeMemberOrDecline with correct arguments', async () => {
    const tripId = 'trip-123';
    await controller.leaveTrip(mockRequest, tripId);
    expect(service.removeMemberOrDecline).toHaveBeenCalledWith(tripId, 1);
  });
});