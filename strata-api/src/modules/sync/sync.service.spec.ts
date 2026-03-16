/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { SyncService } from './sync.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SyncService', () => {
  let service: SyncService;
  let prisma: PrismaService;

  const mockPrismaService = {
    $transaction: jest.fn().mockImplementation((cb) => cb(mockPrismaService)),
    trip_Members: { findMany: jest.fn() },
    trip: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn(), findMany: jest.fn() },
    destination: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn(), findMany: jest.fn() },
    location: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn(), findMany: jest.fn() },
    expense: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn(), findMany: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SyncService>(SyncService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('push', () => {
    // Test #1: Process creations and deletions within a transaction
    it('Should process creations and deletions within a transaction', async () => {
      const pushData: any = {
        changes: {
          trips: {
            created: [{ trip_id: 'trip-1', name: 'Nova Viagem' }],
            updated: [],
            deleted: ['trip-2'],
          },
        },
        lastPulledAt: 0,
      };

      const result = await service.push(1, pushData);

      expect(prisma.$transaction).toHaveBeenCalled();
      
      expect(prisma.trip.create).toHaveBeenCalledWith({
        data: {
          trip_id: 'trip-1',
          name: 'Nova Viagem',
          members: { create: { user_id: 1, status: 'ACCEPTED' } },
        },
      });

      expect(prisma.trip.update).toHaveBeenCalledWith({
        where: { trip_id: 'trip-2' },
        data: expect.objectContaining({ deleted_at: expect.any(Date) }),
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe('pull', () => {
    // Test #2: Group data correctly into updated and deleted categories
    it('Should group data correctly into updated and deleted categories', async () => {
      mockPrismaService.trip_Members.findMany.mockResolvedValue([{ trip_id: 'trip-1' }]);
      
      mockPrismaService.trip.findMany.mockResolvedValue([
        { trip_id: 'trip-1', name: 'Viagem 1', deleted_at: null },
        { trip_id: 'trip-2', name: 'Viagem 2', deleted_at: new Date() },
      ]);
      
      mockPrismaService.destination.findMany.mockResolvedValue([]);
      mockPrismaService.location.findMany.mockResolvedValue([]);
      mockPrismaService.expense.findMany.mockResolvedValue([]);

      const result = await service.pull(1, 1000);

      expect(prisma.trip_Members.findMany).toHaveBeenCalledWith({
        where: { user_id: 1 },
        select: { trip_id: true },
      });

      expect(result.changes.trips.updated).toHaveLength(1);
      expect(result.changes.trips.updated[0].trip_id).toBe('trip-1');
      
      expect(result.changes.trips.deleted).toHaveLength(1);
      expect(result.changes.trips.deleted[0]).toBe('trip-2');
    });
  });
});