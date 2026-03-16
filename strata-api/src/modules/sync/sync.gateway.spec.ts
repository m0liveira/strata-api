/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { SyncGateway } from './sync.gateway';

describe('SyncGateway', () => {
  let gateway: SyncGateway;

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SyncGateway],
    }).compile();

    gateway = module.get<SyncGateway>(SyncGateway);
    gateway.server = mockServer as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test #1: Notify clients in the trip room that a sync is needed
  it('Should notify clients in the trip room that a sync is needed', () => {
    gateway.notifySyncNeeded('trip-1');

    expect(mockServer.to).toHaveBeenCalledWith('trip-1');
    expect(mockServer.emit).toHaveBeenCalledWith('syncNeeded', { tripId: 'trip-1' });
  });
});