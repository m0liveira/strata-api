/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseController } from './supabase.controller';
import { SupabaseService } from './supabase.service';
import { BadRequestException } from '@nestjs/common';

describe('SupabaseService', () => {
  let controller: SupabaseController;
  let service: SupabaseService;

  const mockSupabaseService = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupabaseController],
      providers: [
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    controller = module.get<SupabaseController>(SupabaseController);
    service = module.get<SupabaseService>(SupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload a file and return the URL', async () => {
      const fakeFile = {
        originalname: 'test img.png',
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      mockSupabaseService.uploadFile.mockResolvedValue('http://fake-url.com/test_img.png');

      const result = await controller.uploadFile(fakeFile, 'tickets');

      expect(service.uploadFile).toHaveBeenCalledWith(
        'tickets',
        expect.any(String),
        fakeFile
      );
      expect(result).toEqual({ url: 'http://fake-url.com/test_img.png' });
    });

    it('should throw an error if no file is uploaded', async () => {
      await expect(controller.uploadFile(undefined as any, 'tickets')).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteFile', () => {
    it('should call the service to delete the file', async () => {
      mockSupabaseService.deleteFile.mockResolvedValue({ message: 'Success' });

      const result = await controller.deleteFile('http://fake-url.com/file.png', 'tickets');

      expect(service.deleteFile).toHaveBeenCalledWith('tickets', 'http://fake-url.com/file.png');
      expect(result).toEqual({ message: 'Success' });
    });

    it('should throw an error if no URL is provided', async () => {
      await expect(controller.deleteFile('', 'tickets')).rejects.toThrow(BadRequestException);
    });
  });
});