import { Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { ChatService } from './chat.service';

@WebSocketGateway({ namespace: 'api/chats', cors: '*' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private readonly logger = new Logger(ChatGateway.name);

    constructor(
        private readonly authService: AuthService,
        private readonly chatService: ChatService
    ) { }

    @WebSocketServer()
    server: Server;

    afterInit(server: Socket) {

    }

    handleConnection(client: Socket) {
        const [type, token] = (client.handshake.headers['authorization'] as string ?? '').split(' ');
        // 클라이언트를 인증합니다.
        if (type !== 'Bearer' || !(client['user'] = this.authService.validate(token)))
            client.disconnect(true);

        // 클라이언트가 원하는 채팅방에 참여합니다.
        const chatId = client['chatId'] = client.handshake.query['chatId'];
        try {
            if (typeof chatId !== 'number')
                throw new Error('bad_request');
            // 채팅방 참여자 여부를 보장합니다.
            this.chatService.getParticipantId(chatId, client['user'].id)
        } catch {
            client.disconnect(true);
        }
        // 채팅방 참여
        client.join(chatId.toString());
    }

    handleDisconnect(client: Socket) {

    }

}
