/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { TripMembersService } from './trip-members.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';

describe('TripMembersService', () => {
  let service: TripMembersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: { findUnique: jest.fn() },
    trip_Members: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripMembersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TripMembersService>(TripMembersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('inviteUser', () => {
    // Test #1: Inviter is not an accepted member
    it('Should throw ForbiddenException if inviter is not an accepted member', async () => {
      mockPrismaService.trip_Members.findFirst.mockResolvedValue(null);
      await expect(service.inviteUser('trip-1', 1, 2)).rejects.toThrow(ForbiddenException);
    });

    // Test #2: Target user does not exist
    it('Should throw NotFoundException if target user does not exist', async () => {
      mockPrismaService.trip_Members.findFirst.mockResolvedValue({ status: 'ACCEPTED' });
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.inviteUser('trip-1', 1, 2)).rejects.toThrow(NotFoundException);
    });

    // Test #3: User is already invited or in the trip
    it('Should throw ConflictException if user is already invited or in the trip', async () => {
      mockPrismaService.trip_Members.findFirst
        .mockResolvedValueOnce({ status: 'ACCEPTED' })
        .mockResolvedValueOnce({ status: 'PENDING' });
      mockPrismaService.user.findUnique.mockResolvedValue({ user_id: 2 });

      await expect(service.inviteUser('trip-1', 1, 2)).rejects.toThrow(ConflictException);
    });

    // Test #4: Create invite successfully
    it('Should create invite successfully', async () => {
      mockPrismaService.trip_Members.findFirst
        .mockResolvedValueOnce({ status: 'ACCEPTED' })
        .mockResolvedValueOnce(null);
      mockPrismaService.user.findUnique.mockResolvedValue({ user_id: 2 });
      mockPrismaService.trip_Members.create.mockResolvedValue({ status: 'PENDING' });

      const result = await service.inviteUser('trip-1', 1, 2);
      expect(result.status).toBe('PENDING');
    });
  });

  describe('acceptInvite', () => {
    // Test #5: Invite does not exist
    it('Should throw NotFoundException if invite does not exist', async () => {
      mockPrismaService.trip_Members.findFirst.mockResolvedValue(null);
      await expect(service.acceptInvite('trip-1', 1)).rejects.toThrow(NotFoundException);
    });

    // Test #6: Accept invite successfully
    it('Should accept invite successfully', async () => {
      mockPrismaService.trip_Members.findFirst.mockResolvedValue({ trip_members_id: 'uuid-1', status: 'PENDING' });
      mockPrismaService.trip_Members.update.mockResolvedValue({ status: 'ACCEPTED' });

      const result = await service.acceptInvite('trip-1', 1);
      expect(result.status).toBe('ACCEPTED');
    });
  });

  describe('removeMemberOrDecline', () => {
    // Test #7: Membership does not exist
    it('Should throw NotFoundException if membership does not exist', async () => {
      mockPrismaService.trip_Members.findFirst.mockResolvedValue(null);
      await expect(service.removeMemberOrDecline('trip-1', 1)).rejects.toThrow(NotFoundException);
    });

    // Test #8: Decline invite successfully
    it('Should remove member successfully', async () => {
      mockPrismaService.trip_Members.findFirst.mockResolvedValue({ trip_members_id: 'uuid-1' });
      mockPrismaService.trip_Members.delete.mockResolvedValue({});

      const result = await service.removeMemberOrDecline('trip-1', 1);
      expect(result.message).toBe('Removed successfully');
    });
  });
});