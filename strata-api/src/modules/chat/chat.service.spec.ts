/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ChatService', () => {
  let service: ChatService;
  let prisma: PrismaService;

  const mockPrismaService = {
    chat: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('saveMessage', () => {
    // Test #1: Create a new chat if it does not exist and save the message
    it('Should create a new chat if it does not exist and save the message', async () => {
      mockPrismaService.chat.findFirst.mockResolvedValue(null);
      mockPrismaService.chat.create.mockResolvedValue({ chat_id: 'chat-1', trip_id: 'trip-1' });
      mockPrismaService.message.create.mockResolvedValue({ message_id: 'msg-1', message: 'Hello' });

      const result = await service.saveMessage('trip-1', 1, 'Hello');

      expect(mockPrismaService.chat.create).toHaveBeenCalledWith({ data: { trip_id: 'trip-1' } });
      expect(mockPrismaService.message.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: { user_id: 1, chat_id: 'chat-1', message: 'Hello' } })
      );
      expect(result).toEqual({ message_id: 'msg-1', message: 'Hello' });
    });

    // Test #2: Use the existing chat to save the message
    it('Should use the existing chat to save the message', async () => {
      mockPrismaService.chat.findFirst.mockResolvedValue({ chat_id: 'existing-chat' });
      mockPrismaService.message.create.mockResolvedValue({ message_id: 'msg-2' });

      await service.saveMessage('trip-1', 1, 'Test');

      expect(mockPrismaService.chat.create).not.toHaveBeenCalled();
      expect(mockPrismaService.message.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: { user_id: 1, chat_id: 'existing-chat', message: 'Test' } })
      );
    });
  });

  describe('getMessages', () => {
    // Test #3: Return an empty array if the chat does not exist
    it('Should return an empty array if the chat does not exist', async () => {
      mockPrismaService.chat.findFirst.mockResolvedValue(null);

      const result = await service.getMessages('trip-1');

      expect(result).toEqual([]);
    });
  });
});