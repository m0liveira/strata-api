/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';

describe('TripController', () => {
  let controller: TripController;
  let service: TripService;

  const mockTripService = {
    getPublicTrips: jest.fn(),
    getFriendSharedTrips: jest.fn(),
    getTripById: jest.fn(),
    getSharedTripsById: jest.fn(),
  };

  const mockRequest = {
    user: { userId: 1 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripController],
      providers: [
        { provide: TripService, useValue: mockTripService },
      ],
    }).compile();

    controller = module.get<TripController>(TripController);
    service = module.get<TripService>(TripService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test #1: Get public trips
  it('should call getPublicTrips from service', async () => {
    mockTripService.getPublicTrips.mockResolvedValue([]);
    await controller.getPublicTrips();
    expect(service.getPublicTrips).toHaveBeenCalled();
  });

  // Test #2: Get trips shared by friends
  it('should call getFriendSharedTrips from service with user ID', async () => {
    mockTripService.getFriendSharedTrips.mockResolvedValue([]);
    await controller.getFriendSharedTrips(mockRequest);
    expect(service.getFriendSharedTrips).toHaveBeenCalledWith(1);
  });

  // Test #3: Get trip by ID
  it('should call getTripById from service with trip ID and user ID', async () => {
    mockTripService.getTripById.mockResolvedValue({});
    await controller.getTripById('trip-1', mockRequest);
    expect(service.getTripById).toHaveBeenCalledWith('trip-1', 1);
  });

  // Test #4: Get shared trip by ID
  it('should call getSharedTripsById from service with trip ID', async () => {
    mockTripService.getSharedTripsById.mockResolvedValue({});
    await controller.getSharedTripsById('trip-1');
    expect(service.getSharedTripsById).toHaveBeenCalledWith('trip-1');
  });
});