/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';

describe('ChatGateway', () => {
    let gateway: ChatGateway;
    let service: ChatService;

    const mockChatService = {
        saveMessage: jest.fn(),
    };

    const mockJwtService = {
        verifyAsync: jest.fn(),
    };

    const mockServer = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
    };

    const mockClient = {
        join: jest.fn(),
        data: {
            user: { userId: 1 },
        },
    } as any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatGateway,
                { provide: ChatService, useValue: mockChatService },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        gateway = module.get<ChatGateway>(ChatGateway);
        service = module.get<ChatService>(ChatService);
        gateway.server = mockServer as any;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Test #1: Join the client to the trip room
    it('Should join the client to the trip room', async () => {
        await gateway.handleJoinTrip({ tripId: 'trip-1' }, mockClient);
        expect(mockClient.join).toHaveBeenCalledWith('trip-1');
    });

    // Test #2: Save and emit the message
    it('Should save and emit the message', async () => {
        const savedMessage = { message_id: 'msg-1', message: 'Hey' };
        mockChatService.saveMessage.mockResolvedValue(savedMessage);

        await gateway.handleMessage({ tripId: 'trip-1', message: 'Hey' }, mockClient);

        expect(service.saveMessage).toHaveBeenCalledWith('trip-1', 1, 'Hey');
        expect(mockServer.to).toHaveBeenCalledWith('trip-1');
        expect(mockServer.emit).toHaveBeenCalledWith('newMessage', savedMessage);
    });

    // Test #3: Do nothing if userId is missing from the token
    it('Should do nothing if userId is missing from the token', async () => {
        const clientWithoutUser = { data: {} } as any;

        await gateway.handleMessage({ tripId: 'trip-1', message: 'Hey' }, clientWithoutUser);

        expect(service.saveMessage).not.toHaveBeenCalled();
        expect(mockServer.emit).not.toHaveBeenCalled();
    });
});