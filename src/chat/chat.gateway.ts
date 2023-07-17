import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { ChatService } from './chat.service';
import { Message } from '@prisma/client';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({ namespace: 'api/chats', cors: '*' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private readonly logger = new Logger(ChatGateway.name);

    constructor(
        private readonly authService: AuthService,
        private readonly chatService: ChatService
    ) { }

    @WebSocketServer()
    server: Server;

    async afterInit(server: Socket) {

    }

    async handleConnection(client: Socket) {
        const [type, token] = (client.handshake.headers['authorization'] as string ?? '').split(' ')
        // 클라이언트를 인증합니다.
        if (type !== 'Bearer' || !(client['userId'] = (await this.authService.validate(token))?.identifier)) {
            client.disconnect(true)
            return
        }

        // 클라이언트가 원하는 채팅방에 참여합니다.
        const chatId = client['chatId'] = +client.handshake.query['chatId']
        try {
            if (isNaN(chatId))
                throw new Error('bad_request');
            // 채팅방 참여자 여부를 보장합니다.
            await this.chatService.getParticipantId(chatId, client['userId'])
        } catch {
            client.disconnect(true)
            return
        }
        // 채팅방 참여
        client.join(chatId.toString());
        this.logger.log(`WS - Realtime message ${client['userId']} - ${client.id} connected - ${chatId}`)
    }

    async handleDisconnect(client: Socket) {

    }

    /**
     * 실시간 메시지를 전송합니다.
     */
    @OnEvent('chat.message')
    async onMessage(message: Message) {
        this.logger.log(`WS - Realtime message emit ${message.senderId} - ${message.chatId} - ${message.id}`)

        this.server.to(message.chatId.toString())
            .emit('message', message)
    }
}
