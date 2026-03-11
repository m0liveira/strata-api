/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    getUserData: jest.fn(),
    updateProfile: jest.fn(),
    getPublicProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    // Test #1: Call userService.getProfile with user ID from token
    it('Should call userService.getProfile with user ID from token', async () => {
      const req = { user: { userId: 1 } };
      const expectedResult = { user_id: 1, username: 'johndoe' };

      mockUserService.getUserData.mockResolvedValue(expectedResult);

      const result = await controller.getUserData(req);

      expect(mockUserService.getUserData).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateProfile', () => {
    // Test #2: Call userService.updateProfile with user ID and DTO
    it('Should call userService.updateProfile with user ID and DTO', async () => {
      const req = { user: { userId: 1 } };
      const dto = { name: 'Johny' };
      const expectedResult = { user_id: 1, name: 'Johny' };

      mockUserService.updateProfile.mockResolvedValue(expectedResult);

      const result = await controller.updateProfile(req, dto);

      expect(mockUserService.updateProfile).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getPublicProfile', () => {
    // Test #3: Call userService.getPublicProfile with username
    it('Should call userService.getPublicProfile with username', async () => {
      const username = 'johndoe';
      const expectedResult = { user_id: 2, username: 'johndoe' };

      mockUserService.getPublicProfile.mockResolvedValue(expectedResult);

      const result = await controller.getPublicProfile(username);

      expect(mockUserService.getPublicProfile).toHaveBeenCalledWith(username);
      expect(result).toEqual(expectedResult);
    });
  });
});