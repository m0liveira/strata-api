/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

describe('SyncController', () => {
  let controller: SyncController;
  let service: SyncService;

  const mockSyncService = {
    push: jest.fn(),
    pull: jest.fn(),
  };

  const mockRequest = {
    user: { userId: 1 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SyncController],
      providers: [
        { provide: SyncService, useValue: mockSyncService },
      ],
    }).compile();

    controller = module.get<SyncController>(SyncController);
    service = module.get<SyncService>(SyncService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('pushChanges', () => {
    // Test #1: Verify that the controller calls the service with the correct user ID and data
    it('Should call the service.push with the correct data', async () => {
      const pushData: any = { changes: {}, lastPulledAt: 0 };

      await controller.pushChanges(mockRequest, pushData);

      expect(service.push).toHaveBeenCalledWith(1, pushData);
    });
  });

  describe('pullChanges', () => {
    // Test #2: Verify that the controller calls the service with the correct user ID and converts lastPulledAt to a number
    it('Should call the service.pull converting the string lastPulledAt to a number', async () => {
      await controller.pullChanges(mockRequest, '1710331200000');

      expect(service.pull).toHaveBeenCalledWith(1, 1710331200000);
    });

    // Test #3: Verify that the controller calls the service with 0 if lastPulledAt is undefined
    it('Should call the service.pull with 0 if lastPulledAt is undefined', async () => {
      await controller.pullChanges(mockRequest, undefined as any);

      expect(service.pull).toHaveBeenCalledWith(1, 0);
    });
  });
});