/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    
    // Test #1: Call authService.register and return the result
    it('Should call authService.register and return the result', async () => {
      const dto = {
        name: 'john doe',
        username: 'johndoe',
        email: 'johndoe@email.com',
        password: 'password123',
      };
      const expectedResult = { code: 201, message: 'User registered successfully' };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(dto);

      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    // Test #2: Call authService.login and return the token
    it('Should call authService.login and return the token', async () => {
      const dto = { identifier: 'johndoe', password: 'password123' };
      const expectedResult = {
        code: 200,
        access_token: 'fake-jwt-token',
        user: { user_id: 1, email: 'johndoe@email.com', username: 'johndoe' },
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(dto as any);

      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });
});