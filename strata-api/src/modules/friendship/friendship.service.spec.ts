/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { FriendshipService } from './friendship.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('FriendshipService', () => {
  let service: FriendshipService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: { findUnique: jest.fn() },
    friendship: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendshipService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<FriendshipService>(FriendshipService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendRequest', () => {
    it('Should throw BadRequestException when trying to send a request to oneself', async () => {
      await expect(service.sendRequest(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('Should throw NotFoundException when the receiver does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      
      await expect(service.sendRequest(1, 2)).rejects.toThrow(NotFoundException);
    });

    it('Should throw ConflictException when a friendship or pending request already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ user_id: 2 });
      mockPrismaService.friendship.findFirst.mockResolvedValue({ status: 'PENDING' });
      
      await expect(service.sendRequest(1, 2)).rejects.toThrow(ConflictException);
    });

    it('Should create the request successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ user_id: 2 });
      mockPrismaService.friendship.findFirst.mockResolvedValue(null);
      mockPrismaService.friendship.create.mockResolvedValue({ status: 'PENDING' });

      const result = await service.sendRequest(1, 2);
      expect(result.status).toBe('PENDING');
    });
  });

  describe('acceptRequest', () => {
    it('Should throw NotFoundException when the request does not exist', async () => {
      mockPrismaService.friendship.findFirst.mockResolvedValue(null);
      await expect(service.acceptRequest(2, 1)).rejects.toThrow(NotFoundException);
    });

    it('Should accept the request successfully', async () => {
      mockPrismaService.friendship.findFirst.mockResolvedValue({ status: 'PENDING' });
      mockPrismaService.friendship.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.acceptRequest(2, 1);
      expect(result.count).toBe(1);
    });
  });

  describe('removeFriendship', () => {
    it('Should throw NotFoundException if the friendship does not exist in the database', async () => {
      mockPrismaService.friendship.deleteMany.mockResolvedValue({ count: 0 });
      await expect(service.removeFriendship(1, 2)).rejects.toThrow(NotFoundException);
    });

    it('Should remove the friendship successfully', async () => {
      mockPrismaService.friendship.deleteMany.mockResolvedValue({ count: 1 });
      const result = await service.removeFriendship(1, 2);
      expect(result.message).toBe('Friendship removed');
    });
  });

  describe('listagens', () => {
    it('Should list all friendships for the user', async () => {
      mockPrismaService.friendship.findMany.mockResolvedValue([{ id: 1 }]);
      const result = await service.getAll(1);
      expect(result.length).toBe(1);
    });
  });
});