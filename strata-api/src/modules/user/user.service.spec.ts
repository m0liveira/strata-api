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
    // Test #5: Get user own profile successfully
    it('Should return user profile successfully without password', async () => {
      const userId = 1;
      const fakeUser = {
        user_id: 1,
        username: 'johndoe',
        name: 'John doe',
        photo: 'photo-url',
        email: 'john.doe@example.com'
      };

      mockPrismaService.user.findUnique.mockResolvedValue(fakeUser);

      const result = await service.getUserData(userId);

      expect(result.user_id).toBe(1);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { user_id: userId },
        select: {
          user_id: true,
          username: true,
          name: true,
          photo: true,
          email: true,
        },
      });
    });

    // Test #6: Throw NotFoundException if own profile is not found
    it('Should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserData(999)).rejects.toThrow(NotFoundException);
    });
  });
});