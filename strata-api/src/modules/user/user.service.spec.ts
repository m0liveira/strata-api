/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateProfile', () => {
    // Test #1: Update user profile successfully
    it('Should update user profile succesfully', async () => {
      const userId = 1;
      const dto = { name: 'Johny', password: 'new-password' };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      mockPrismaService.user.update.mockResolvedValue({
        user_id: 1,
        name: 'Johny',
      });

      const result = await service.updateProfile(userId, dto);

      expect(result.name).toBe('Johny');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { user_id: userId },
        data: { name: 'Johny', password: 'hashed-password' },
        select: expect.any(Object),
      });
    });

    // Test #2: Update user profile fails due to email already in use
    it('Should throw ConflictException if email is already in use', async () => {
      const userId = 1;
      const dto = { email: 'other@email.com' };

      mockPrismaService.user.findUnique.mockResolvedValue({ user_id: 2 });

      await expect(service.updateProfile(userId, dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('getPublicProfile', () => {
    // Test #3: Get public user profile successfully
    it('Should return public user profile if user exists', async () => {
      const username = 'johndoe';
      const fakeUser = { user_id: 1, username: 'johndoe', name: 'John' };

      mockPrismaService.user.findUnique.mockResolvedValue(fakeUser);

      const result = await service.getPublicProfile(username);
      expect(result).toEqual(fakeUser);
    });

    // Test #4: Throw NotFoundException if user does not exist
    it('Should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getPublicProfile('fantasma')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserData', () => {
    // Test #5: Return user profile mapped to DTO successfully
    it('Should return user profile mapped to DTO successfully', async () => {
      const userId = 1;

      const fakeUser = {
        user_id: 1,
        username: 'johndoe',
        email: 'john.doe@example.com',
        name: 'John doe',
        photo: 'photo-url',
        sent_friendships: [
          { receiver_id: 2, status: 'ACCEPTED' },
          { receiver_id: 6, status: 'PENDING' }
        ],
        received_friendships: [
          { requester_id: 3, status: 'ACCEPTED' },
          { requester_id: 7, status: 'PENDING' }
        ],
        sent_follows: [{ receiver_id: 4 }],
        received_follows: [{ requester_id: 5 }],
        trips: [{ trip: { trip_id: 'trip-1', name: 'Lisboa' } }],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(fakeUser);

      const result = await service.getUserData(userId);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { user_id: userId },
        select: {
          user_id: true,
          username: true,
          email: true,
          name: true,
          photo: true,
          sent_friendships: {
            where: { deleted_at: null },
            select: { receiver_id: true, status: true }
          },
          received_friendships: {
            where: { deleted_at: null },
            select: { requester_id: true, status: true }
          },
          sent_follows: {
            where: { deleted_at: null },
            select: { receiver_id: true }
          },
          received_follows: {
            where: { deleted_at: null },
            select: { requester_id: true }
          },
          trips: {
            where: { status: 'ACCEPTED', trip: { deleted_at: null } },
            select: { trip: true }
          },
        },
      });

      expect(result).toEqual({
        user_id: 1,
        username: 'johndoe',
        email: 'john.doe@example.com',
        name: 'John doe',
        photo: 'photo-url',
        pending_friends: [6, 7],
        friends: [2, 3],
        following: [4],
        followers: [5],
        trips: [{ trip_id: 'trip-1', name: 'Lisboa' }],
      });
    });

    // Test #6: Throw NotFoundException if own profile is not found
    it('Should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserData(999)).rejects.toThrow(NotFoundException);
    });
  });
});