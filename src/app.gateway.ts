import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({
    cors: { origin: "*" }
})
export class AppGateway {

    @WebSocketServer() server: Server

    @SubscribeMessage('payment_status')
    sendPaymentNotification(@MessageBody() payload: any): void {
        this.server.emit('get_payment_status_now', payload);
    }
}