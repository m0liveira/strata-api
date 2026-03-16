/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

describe('ChatController', () => {
  let controller: ChatController;
  let service: ChatService;

  const mockChatService = {
    getMessages: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        { provide: ChatService, useValue: mockChatService },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
    service = module.get<ChatService>(ChatService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMessages', () => {
    // Test #1: Return the message history for a given trip
    it('Should return the message history for a given trip', async () => {
      const expectedMessages = [{ message_id: 'msg-1', message: 'Hello' }];
      mockChatService.getMessages.mockResolvedValue(expectedMessages);

      const result = await controller.getMessages('trip-1');

      expect(service.getMessages).toHaveBeenCalledWith('trip-1');
      expect(result).toEqual(expectedMessages);
    });
  });
});