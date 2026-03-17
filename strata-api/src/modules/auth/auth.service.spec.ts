/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(() => 'test-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  // Test #1: Register a new user successfully
  it('Should register a new user successfully', async () => {
    const dto = {
      name: 'john doe',
      username: 'johndoe',
      email: 'johndoe@email.com',
      password: 'password123',
    };

    mockPrismaService.user.findUnique.mockResolvedValue(null);

    mockPrismaService.user.create.mockResolvedValue({
      user_id: 1,
      ...dto,
      password: 'hashed-password',
    });

    const result = await service.register(dto);

    expect(result.code).toBe(201);
    expect(result.message).toBe('User registered successfully');
    expect(mockPrismaService.user.create).toHaveBeenCalled();
  });

  // Test #2: Register a new user unsuccessfully due to email already in use
  it('Should not register a new user if email is already in use', async () => {
    const dto = {
      name: 'john doe',
      username: 'johndoe',
      email: 'johndoe@email.com',
      password: 'password123',
    };

    mockPrismaService.user.findUnique.mockResolvedValue({
      user_id: 1,
      email: dto.email,
    });

    await expect(service.register(dto)).rejects.toThrow(
      new ConflictException('This email is already being used')
    );
  });

  // Test #3: Login successfully due to valid credentials
  it('Should login successfully with valid credentials', async () => {
    const dto = { identifier: 'johndoe', password: 'password123' };

    const fakeUser = {
      user_id: 1,
      email: 'johndoe@email.com',
      username: 'johndoe',
      password: 'hashed-password',
      photo: null,
    };

    mockPrismaService.user.findFirst.mockResolvedValue(fakeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.login(dto as any);

    expect(result.code).toBe(200);
    expect(result.access_token).toBe('test-token');
    expect(result.user_id).toBe(fakeUser.user_id);
  });

  // Test #4: Login unsuccessfully due to invalid credentials
  it('Should not login with invalid credentials', async () => {
    const dto = { identifier: 'fantasma', password: 'password123' };

    mockPrismaService.user.findFirst.mockResolvedValue(null);

    await expect(service.login(dto as any)).rejects.toThrow(UnauthorizedException);
  });

  // Test #5: Login unsuccessfully due to invalid password
  it('Should throw UnauthorizedException if password is incorrect', async () => {
    const dto = { identifier: 'johndoe', password: 'wrongpassword' };
    const fakeUser = {
      user_id: 1,
      email: 'johndoe@email.com',
      username: 'johndoe',
      password: 'hashed-password',
    };

    mockPrismaService.user.findFirst.mockResolvedValue(fakeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.login(dto as any)).rejects.toThrow(UnauthorizedException);
  });
});
