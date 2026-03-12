/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { FollowsService } from './follows.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('FollowsService', () => {
  let service: FollowsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: { findUnique: jest.fn() },
    follows: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<FollowsService>(FollowsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('follow', () => {
    it('Should throw BadRequestException if trying to follow self', async () => {
      await expect(service.follow(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('Should throw NotFoundException if receiver does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.follow(1, 2)).rejects.toThrow(NotFoundException);
    });

    it('Should throw ConflictException if already following', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ user_id: 2 });
      mockPrismaService.follows.findFirst.mockResolvedValue({ status: 'ACCEPTED' });
      
      await expect(service.follow(1, 2)).rejects.toThrow(ConflictException);
    });

    it('Should create follow relationship successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ user_id: 2 });
      mockPrismaService.follows.findFirst.mockResolvedValue(null);
      mockPrismaService.follows.create.mockResolvedValue({ status: 'ACCEPTED' });

      const result = await service.follow(1, 2);
      expect(result.status).toBe('ACCEPTED');
    });
  });

  describe('unfollow', () => {
    it('Should throw NotFoundException if relationship does not exist', async () => {
      mockPrismaService.follows.deleteMany.mockResolvedValue({ count: 0 });
      await expect(service.unfollow(1, 2)).rejects.toThrow(NotFoundException);
    });

    it('Should remove follow relationship successfully', async () => {
      mockPrismaService.follows.deleteMany.mockResolvedValue({ count: 1 });
      const result = await service.unfollow(1, 2);
      expect(result.message).toBe('Unfollowed successfully');
    });
  });

  describe('getFollowers and getFollowing', () => {
    it('Should return list of followers', async () => {
      mockPrismaService.follows.findMany.mockResolvedValue([{ requester_id: 2 }]);
      const result = await service.getFollowers(1);
      expect(result.length).toBe(1);
    });

    it('Should return list of following', async () => {
      mockPrismaService.follows.findMany.mockResolvedValue([{ receiver_id: 2 }]);
      const result = await service.getFollowing(1);
      expect(result.length).toBe(1);
    });
  });
});