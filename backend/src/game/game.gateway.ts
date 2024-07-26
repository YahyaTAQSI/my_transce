import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway(3001, { cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly gameService: GameService) {}

  handleConnection(client: Socket) {}

  handleDisconnect(client: Socket) {
    this.gameService.cleanUp(client);
  }

  @SubscribeMessage('new_user')
  handleNewUser(client: Socket, userData: { userId: number }) {
    if (userData.userId !== -1) {
      this.gameService.addNewUser(client, userData.userId);
      this.gameService.reconnectUser(client, userData.userId);
    } else {
      console.log('Unauthorized user (not logged in)');
    }
  }

  @SubscribeMessage('quit')
  handleQuit(client: Socket, payload: { userId: number }) {
    this.gameService.quitGame(payload.userId);
  }

  @SubscribeMessage('game_request')
  handleGameRequest(
    client: Socket,
    payload: {
      userId: number;
      opponentId: number;
      index: number;
      table: string;
    },
  ) {
    this.gameService.sendGameRequest(client, payload);
  }

  @SubscribeMessage('game_response')
  handleGameResponse(
    client: Socket,
    response: {
      userId: number;
      opponentId: number;
      accepted: boolean;
      index: number;
    },
  ) {
    console.log('Game response received ', response);
    this.gameService.gameResponse(client, response);
  }

  @SubscribeMessage('remove_notification')
  handleRemoveNotification(
    client: Socket,
    payload: { userId: number; opponentId: number },
  ) {
    // userId not user (remove-it-later)
    this.gameService.removeNotification(payload.opponentId);
  }

  // handle when user is in the queue for not sending request to the same user again
  @SubscribeMessage('in_the_queue')
  handleInTheQueue(client: Socket, payload: { opponentId: number }) {
    this.gameService.inTheQueue(payload.opponentId);
  }

  @SubscribeMessage('join_queue')
  handleJoinQueue(client: Socket, payload: { userId: number }) {
    this.gameService.randomMatchMaking(payload.userId);
  }

  @SubscribeMessage('go_to_random_game')
  handleGoToRandomGame(client: Socket, payload: { userId: number }) {
    this.gameService.goToRandomGame(payload.userId);
  }

  @SubscribeMessage('movePaddle')
  handleMovePaddle(
    client: Socket,
    payload: { userId: number; keyCode: string },
  ) {
    this.gameService.movePaddle(client, payload.userId, payload.keyCode);
  }

  @SubscribeMessage('resign')
  handleResign(client: Socket, payload: { userId: number }) {
    this.gameService.resign(payload.userId, client);
  }

  @SubscribeMessage('go_to_game')
  handleGoToGame(
    client: Socket,
    payload: { userId: number; opponentId: number },
  ) {
    this.gameService.goToFriendlyGame(payload);
  }

  @SubscribeMessage('remove_sended_request')
  handleRemoveSendedRequest(
    client: Socket,
    payload: { sendedRequestQueue: number[] },
  ) {
    this.gameService.removeSendedRequest(payload.sendedRequestQueue);
  }

  @SubscribeMessage('ready')
  handleReady(client: Socket, payload: { userId: number }) {
    this.gameService.friendMatchMaking(payload.userId);
  }
}
