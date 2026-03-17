/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { TripService } from './trip.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TripService', () => {
  let service: TripService;
  let prisma: PrismaService;

  const mockPrismaService = {
    trip: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    follows: {
      findMany: jest.fn(),
    },
    friendship: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TripService>(TripService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTripById', () => {
    // Test #1: Return trip if found and user has access
    it('should return trip if found', async () => {
      const mockTrip = { trip_id: 'trip-1' };
      mockPrismaService.trip.findFirst.mockResolvedValue(mockTrip);

      const result = await service.getTripById('trip-1', 1);
      expect(result).toEqual(mockTrip);
    });

    // Test #2: Throw NotFoundException if trip not found or no access
    it('should throw NotFoundException if trip not found', async () => {
      mockPrismaService.trip.findFirst.mockResolvedValue(null);

      await expect(service.getTripById('trip-1', 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPublicTrips', () => {
    // Test #3: Return public trips
    it('should return public trips', async () => {
      const mockTrips = [{ trip_id: 'trip-1' }];
      mockPrismaService.trip.findMany.mockResolvedValue(mockTrips);

      const result = await service.getPublicTrips();
      expect(result).toEqual(mockTrips);
    });

    // Test #4: Throw NotFoundException if no public trips found
    it('should throw NotFoundException if no public trips found', async () => {
      mockPrismaService.trip.findMany.mockResolvedValue([]);

      await expect(service.getPublicTrips()).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFriendSharedTrips', () => {
    // Test #5: Return trips shared by friends
    it('should return trips shared by friends', async () => {
      mockPrismaService.follows.findMany.mockResolvedValue([{ receiver_id: 2 }]);
      mockPrismaService.friendship.findMany.mockResolvedValue([{ requester_id: 1, receiver_id: 3 }]);
      mockPrismaService.trip.findMany.mockResolvedValue([{ trip_id: 'trip-1' }]);

      const result = await service.getFriendSharedTrips(1);
      expect(result).toEqual([{ trip_id: 'trip-1' }]);
    });

    // Test #6: Throw NotFoundException if user has no friends or following
    it('should throw NotFoundException if no friends or following', async () => {
      mockPrismaService.follows.findMany.mockResolvedValue([]);
      mockPrismaService.friendship.findMany.mockResolvedValue([]);

      await expect(service.getFriendSharedTrips(1)).rejects.toThrow(NotFoundException);
    });

    // Test #7: Throw NotFoundException if no friend trips found
    it('should throw NotFoundException if no friend trips found', async () => {
      mockPrismaService.follows.findMany.mockResolvedValue([{ receiver_id: 2 }]);
      mockPrismaService.friendship.findMany.mockResolvedValue([]);
      mockPrismaService.trip.findMany.mockResolvedValue([]);

      await expect(service.getFriendSharedTrips(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSharedTripsById', () => {
    // Test #8: Return shared trip by ID
    it('should return shared trip by ID', async () => {
      const mockTrip = { trip_id: 'trip-1' };
      mockPrismaService.trip.findFirst.mockResolvedValue(mockTrip);

      const result = await service.getSharedTripsById('trip-1');
      expect(result).toEqual(mockTrip);
    });

    // Test #9: Throw NotFoundException if shared trip not found
    it('should throw NotFoundException if shared trip not found', async () => {
      mockPrismaService.trip.findFirst.mockResolvedValue(null);

      await expect(service.getSharedTripsById('trip-1')).rejects.toThrow(NotFoundException);
    });
  });
});