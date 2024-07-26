import { Injectable } from "@nestjs/common";
import { $Enums } from "@prisma/client";
import { Socket } from "socket.io";
import { MatchHistoryService } from "src/match-history/match-history.service";
import { UserItemsService } from "src/user-items/user-items.service";
import { UsersService } from "src/users/users.service";

export class Ball {
	x: number;
	y: number;
	raduis: number;
	dx: number;
	dy: number;
	speed: number;

	constructor(
		x: number,
		y: number,
		raduis: number,
		dx: number,
		dy: number,
		speed: number,
	) {
		this.x = x;
		this.y = y;
		this.raduis = raduis;
		this.dx = dx;
		this.dy = dy;
		this.speed = speed;
	}
}

export class Paddle {
	x: number;
	y: number;
	width: number;
	height: number;
	score: number = 0;
	color: string;

	constructor(x: number, y: number, width: number, height: number, color: string) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.score = 0;
		this.color = color;
	}
}

export class MatchDetails {
	createdAt?: Date;
	winnerScore: number;
	loserScore: number;
	gameMode: $Enums.GameMode;
	startAt?: Date;
	endAt?: Date;
	winner: number;
	loser: number;
}

export class Room {
	player1: User;
	player2: User;
	ball: Ball;
	matchDetails: MatchDetails;
	gameMode: string;
	ballInterval: NodeJS.Timeout;
}

export class User {
	userId: number;
	sockets: Socket[] = [];
	paddle: Paddle;
}


const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 500;
const BALL_RADIUS = 15;
const BALL_SPEED = 5;
const BALL_DX = 5;
const BALL_DY = 5;
const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 150;
const PADDLE_SPEED = 10;
const WINNER_SCORE = 5;

@Injectable()
export class GameService {
  constructor(
    private readonly usersService: UsersService,
    private readonly matchHistoryService: MatchHistoryService,
    private readonly userItemsService: UserItemsService
  ) {}
  private queue: User[] = [];
  private againstFriendQueue: User[] = [];
  private rooms: Map<string, Room> = new Map();
  private users: Map<number, User> = new Map();


	addNewUser(client: Socket, userId: number) {
    const user = this.getUser(userId);
    if (!user) {
      const user = new User();
      user.userId = userId;
      user.sockets.push(client);
      this.users.set(userId, user);
    } else if (!user?.sockets.includes(client)) {
      user?.sockets.push(client);
    }

	}

  cleanUp(client: Socket) {
    this.users.forEach((user) => {
      if (user.sockets.includes(client)) {
        user.sockets.splice(user.sockets.indexOf(client), 1);
      }
    });
    
    if (this.queue.length === 0) return;
    this.queue.forEach((user) => {
      if (user.sockets.includes(client)) {
        user.sockets.splice(user.sockets.indexOf(client), 1);
      }
    });
    
    if (this.againstFriendQueue.length === 0) return;
    this.againstFriendQueue.forEach((user) => {
      if (user.sockets.includes(client)) {
        user.sockets.splice(user.sockets.indexOf(client), 1);
      }
    });
    
    if (this.rooms.size === 0) return;
    this.rooms.forEach((room) => {
      if (room.player1.sockets.includes(client)) {
        room.player1.sockets.splice(room.player1.sockets.indexOf(client), 1);
      }
      if (room.player2.sockets.includes(client)) {
        room.player2.sockets.splice(room.player2.sockets.indexOf(client), 1);
      }
    });
  }

  // reconnect user to the game when the user refreshes the page
  reconnectUser(client: Socket, userId: number) {
    const roomId = this.getRoomIdByUserId(userId);
      if (roomId) {
        const room = this.getRoom(roomId);
        if (room) {
          client.join(roomId);
          if (room.gameMode === 'friend') {
            client.emit('go_to_game', room.player1.userId === userId ? room.player2.userId : room.player1.userId);
            if ( room.player1 !== undefined && room.player2 !== undefined && room.ball !== undefined) {
              client.emit('start_game',
              room.ball, room.player1.paddle, room.player2.paddle,
              { userId: room.player1.userId, opponentId: room.player2.userId }
            );
          }
        } else if (room.gameMode === 'random') {
          client.emit('go_to_random_game');
          if (room.player1 !== undefined && room.player2 !== undefined && room.ball !== undefined) {
            client.emit('start_game',
              room.ball, room.player1.paddle, room.player2.paddle,
              { userId: room.player1.userId, opponentId: room.player2.userId }
            );
          }
        }
      }
    }
  }


  quitGame(userId: number) { // handle the quit button of the front end
    const user = this.users.get(userId);
    const roomId = this.getRoomIdByUserId(userId);
    const room = this.getRoom(roomId);

    if (this.queue.includes(user)) {
      this.queue.splice(this.queue.indexOf(user), 1);
    }

    if (room) {
      if (room.gameMode === 'friend') {
        room.player1.sockets.forEach((socket) => {
          socket.leave(roomId);
          socket.emit('quited', userId);
        });

        room.player2.sockets.forEach((socket) => {
          socket.leave(roomId);
          socket.emit('quited', userId);
        });

        // update status of the players to online
        this.usersService.updateStatus(room.player1.userId, 'online');
        this.usersService.updateStatus(room.player2.userId, 'online');
      } else if (room.gameMode === 'random') {
        user?.sockets.forEach((socket) => {
          socket.emit('quited', userId);
        });
        // update status of the player to online
        this.usersService.updateStatus(userId, 'online');
      }
      room.gameMode = '';

      this.rooms.delete(roomId);
    }
  }

  sendGameRequest(
    client: Socket,
    payload: { userId: number, opponentId: number, index: number, table: string }
  ) {
    if (payload.userId === -1) return;
    const user = this.getUser(payload.opponentId);
    if (user) {
      user?.sockets.forEach((socket) => {
        socket.emit('game_request_request', {
          opponentId: payload.userId,
          index: payload.index,
          table: payload.table,
        });
      });
    } else {
      client.emit('game_request_request', 'Opponent not found');
    }
  }

  gameResponse(
    client,
    response: { userId: number, opponentId: number, accepted: boolean, index: number }
  ) {
    const user = this.getUser(response.userId);
    if (user) {
      user?.sockets.forEach((socket) => {
        socket.emit('game_response_response', {
          accepted: response.accepted,
          index: response.index,
          id: response.opponentId,
        });
      });
    } else {
      client.emit('game_response_response', 'Opponent not found');
    }
  }

  removeNotification(opponentId: number ) {
    const user = this.getUser(opponentId);
    if (user) {
      user?.sockets.forEach((socket) => {
        socket.emit('remove_notification');
      });
    }
  }

  inTheQueue(opponentId: number) {
    const user = this.getUser(opponentId);
    if (user) {
      user?.sockets.forEach((socket) => {
        socket.emit('in_the_queue');
      });
    }
  }

  removeSendedRequest(sendedRequestQueue: number[]) {
    sendedRequestQueue.forEach((id) => {
      const user = this.getUser(id);
      if (user) {
        user?.sockets.forEach((socket) => {
          socket.emit('remove_notification');
        });
      }
    });
  }

  resign(userId: number, client: Socket) {
    const user = this.users.get(userId);
    // const roomId = this.getRoomIdByUserId(userId);
    const roomId = [...client.rooms].filter((roomId) => roomId !== client.id).filter((roomId) => roomId !== userId.toString())[0];
    const room = this.rooms.get(roomId);

    if (user) {
      if (room) {
        const allSockets = [...room.player1.sockets, ...room.player2.sockets];
        allSockets.forEach((socket) => {
          socket.leave(roomId);
        });
        if (user === room.player1) {
          this.gameOverEmitter(room.player2, room.player1, 'Opponent resigns. You win.', 'You concede. You lose.', room);
        } else if (user === room.player2) {
          this.gameOverEmitter(room.player1, room.player2, 'Opponent resigns. You win.', 'You concede. You lose.', room);
        }
        this.rooms.delete(roomId);
      }
    }
  }

  gameOverEmitter = (
    winner: User,
    loser: User,
    winnerMsg: string,
    loserMsg: string,
    room: Room
  ) => {

    room.gameMode = '';
    clearInterval(room.ballInterval);
    room.matchDetails.endAt = new Date();
    room.matchDetails.winnerScore = winner.paddle.score;
    room.matchDetails.loserScore = loser.paddle.score;
    room.matchDetails.winner = winner.userId;
    room.matchDetails.loser = loser.userId;
    this.matchHistoryService.create(room.matchDetails as any);

    winner.sockets.forEach((socket) => {
      socket.emit('game_over', winnerMsg);
    });
    loser.sockets.forEach((socket) => {
      socket.emit('game_over', loserMsg);
    });
  }

  addToRandomQueue(user: User, color: string) {
    if (!this.queue.includes(user)) {
      if (this.queue.length === 0) {
        user.paddle = new Paddle(
          0,
          CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
          PADDLE_WIDTH,
          PADDLE_HEIGHT,
          color,
        );
      } else {
        user.paddle = new Paddle(
          CANVAS_WIDTH - PADDLE_WIDTH,
          CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
          PADDLE_WIDTH,
          PADDLE_HEIGHT,
          color,
        );
      }
      this.queue.push(user);
      this.usersService.updateStatus(user.userId, 'ingame');
    }
  }

  deleteTempRooms(userId1: number, userId2: number) {
    const tmpRoom1 = [...this.rooms.keys()].find((roomId) =>
      roomId.includes(userId1.toString()),
    );
    const tmpRoom2 = [...this.rooms.keys()].find((roomId) =>
      roomId.includes(userId2.toString()),
    );
    if (tmpRoom1) this.rooms.delete(tmpRoom1);
    if (tmpRoom2) this.rooms.delete(tmpRoom2);
  }

  startRandomMatch() {
    if (this.queue.length === 2) {
      const player1 = this.queue.shift();
      const player2 = this.queue.shift();
      const roomId = `${player1.userId}+${player2.userId}`;
      const allSockets = [...player1.sockets, ...player2.sockets];

      allSockets.forEach((socket) => {
        socket.join(roomId);
      });

      this.deleteTempRooms(player1.userId, player2.userId);

      const room = new Room();
      room.player1 = player1;
      room.player2 = player2;

      room.ball = new Ball(
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2,
        BALL_RADIUS,
        BALL_DX,
        BALL_DY,
        BALL_SPEED,
      );

      room.gameMode = 'random';

      this.rooms.set(roomId, room);
      room.matchDetails = new MatchDetails();
      room.matchDetails.gameMode = $Enums.GameMode.RANDOM;
      room.matchDetails.startAt = new Date();

      allSockets.forEach((socket) => {
        socket.emit(
          'start_game',
          room.ball,
          player1.paddle,
          player2.paddle,
          { userId: player1.userId, opponentId: player2.userId },
        );
      });
      this.updateBall(room, roomId);
    }
  }

  async randomMatchMaking(userId: number) {
    const user = this.getUser(userId);
    if (user) {
      const color = await this.userItemsService.getPaddleColor(userId);
      this.addToRandomQueue(user, color);
      this.startRandomMatch();
    } else {
      console.log('User not found', userId);
    }
  }

  goToRandomGame(userId: number) {
    const user = this.getUser(userId);
    const tmpRoom = new Room();
    tmpRoom.gameMode = 'random';
    this.rooms.set(userId.toString(), tmpRoom);

    if (user) {
      user.sockets.forEach((socket) => {
        socket.emit('go_to_random_game');
      });
    }
  }

  goToFriendlyGame(
    payload: {userId: number, opponentId: number}
  ) {
    const user = this.getUser(payload.userId);
    const opponent = this.getUser(payload.opponentId);

    if (user && opponent) {
      const roomId = `${payload.userId}+${payload.opponentId}`;
      const room = new Room();
      const allSockets = [...user.sockets, ...opponent.sockets];
      room.player1 = this.users.get(payload.userId);
      room.player2 = this.users.get(payload.opponentId);
      room.gameMode = 'friend';

      room.player1.sockets.forEach((socket) => {
        socket.emit('go_to_game', payload.opponentId);
      });

      room.player2.sockets.forEach((socket) => {
        socket.emit('go_to_game', payload.userId);
      });

      this.usersService.updateStatus(payload.userId, 'ingame');
      this.usersService.updateStatus(payload.opponentId, 'ingame');

      room.matchDetails = new MatchDetails();
      room.matchDetails.gameMode = $Enums.GameMode.AGAINST_FRIEND;
      room.matchDetails.createdAt = new Date();

      allSockets.forEach((socket) => {
        socket.join(roomId);
        socket.emit('remove_notification');
      });

      this.rooms.set(roomId, room);
    }
  }

  addToFriendQueue(user: User, color: string) {
    if (this.againstFriendQueue.length < 2 && user) {
      if (this.againstFriendQueue.length === 0) {
        user.paddle = new Paddle(
          0,
          CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
          PADDLE_WIDTH,
          PADDLE_HEIGHT,
          color
        );
      } else if (this.againstFriendQueue.length === 1) {
        user.paddle = new Paddle(
          CANVAS_WIDTH - PADDLE_WIDTH,
          CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
          PADDLE_WIDTH,
          PADDLE_HEIGHT,
          color
        );
      }
      this.againstFriendQueue.push(user);
    }
  }

  startFriendMatch() {
    if (this.againstFriendQueue.length === 2) {
      const player1 = this.againstFriendQueue.shift();
      const player2 = this.againstFriendQueue.shift();
      const roomId = this.rooms.has(`${player1.userId}+${player2.userId}`)
        ? `${player1.userId}+${player2.userId}`
        : this.rooms.has(`${player2.userId}+${player1.userId}`)
          ? `${player2.userId}+${player1.userId}`
          : null;

      if (roomId) {
        const room = this.rooms.get(roomId);
        room.player1 = player1;
        room.player2 = player2;
        room.ball = new Ball(
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2,
          BALL_RADIUS,
          BALL_DX,
          BALL_DY,
          BALL_SPEED,
        );

        room.matchDetails.startAt = new Date();

        const allSockets = [...player1.sockets, ...player2.sockets];

        allSockets.forEach((socket) => {
          socket.emit('start_friend_game',
            room.ball, player1.paddle, player2.paddle,
            { userId: player1.userId, opponentId: player2.userId }
          );
        });

        this.updateBall(room, roomId);
      }
    }
  }

  async friendMatchMaking(userId: number) {
    const user = this.getUser(userId);
    if (user) {
      const color = await this.userItemsService.getPaddleColor(userId);
      this.addToFriendQueue(user, color);
      this.startFriendMatch();
    }
  }

  getUser(userId: number) : User {
    return this.users.get(userId);
  }

  getRoomIdByUserId(userId: number) : string {
    const roomKeys = Array.from(this.rooms.keys());
    const roomId = roomKeys.find((roomId) => roomId.includes(userId.toString()));
    return roomId;
  }

  getRoom(roomId: string) : Room {
    return this.rooms.get(roomId);
  }

  movePaddle(client: Socket, userId: number, direction: string) {
    const user = this.users.get(userId);
    if (user) {
      const roomId = [...client.rooms].filter((roomId) => roomId !== client.id)[0];
      // const roomId = this.getRoomIdByUserId(userId);
      const room = this.rooms.get(roomId);
      if (room) {
        if (direction === 'up') {
          if (user.paddle.y > 0) {
            user.paddle.y -= PADDLE_SPEED;
          }
        } else if (direction === 'down') {
          if (user.paddle.y + user.paddle.height < CANVAS_HEIGHT) {
            user.paddle.y += PADDLE_SPEED;
          }
        }
        const allSockets = [...room.player1.sockets, ...room.player2.sockets];
        allSockets.forEach((socket) => {
          socket.emit('update', room.ball, room.player1.paddle, room.player2.paddle);
        });
      }
    }
  }

  handleMoveBall(room: Room, roomId: string) {
    if (!room) return;

    function resetBall() {
      room.ball.speed = BALL_SPEED;
      room.ball.dx = -BALL_DX * Math.sign(room.ball.dx);
      room.ball.dy = Math.random() < 0.5 ? -BALL_DY : BALL_DY;
      room.ball.x = CANVAS_WIDTH / 2 - room.ball.raduis;
      room.ball.y = CANVAS_HEIGHT / 2 - room.ball.raduis;
    }
    function collision(
      b: { x: number; y: number; raduis: number },
      p: { x: number; y: number; width: number; height: number },
    ) {
      const x = Math.max(p.x, Math.min(b.x, p.x + p.width));
      const y = Math.max(p.y, Math.min(b.y, p.y + p.height));
      const distance = Math.sqrt((x - b.x) * (x - b.x) + (y - b.y) * (y - b.y));
      return distance < b.raduis;
    }

    if (room.ball.x < -room.ball.raduis) {
      room.player2.paddle.score++;
      room.player1.sockets.forEach((socket) => {
        socket.emit(
          'update_score',
          room.player2.paddle.score,
          room.player1.paddle.score,
        );
      });
      room.player2.sockets.forEach((socket) => {
        socket.emit(
          'update_score',
          room.player2.paddle.score,
          room.player1.paddle.score,
        );
      });
      if (room.player2.paddle.score === WINNER_SCORE) {
        this.gameOverEmitter(room.player2, room.player1, 'Victory is yours.', 'Defeat is yours.', room);
        this.rooms.delete(roomId);
        return;
      }
      resetBall();
    } else if (room.ball.x > CANVAS_WIDTH + room.ball.raduis) {
      room.player1.paddle.score++;
      room.player1.sockets.forEach((socket) => {
        socket.emit(
          'update_score',
          room.player2.paddle.score,
          room.player1.paddle.score,
        );
      });
      room.player2.sockets.forEach((socket) => {
        socket.emit(
          'update_score',
          room.player2.paddle.score,
          room.player1.paddle.score,
        );
      });

      if (room.player1.paddle.score === WINNER_SCORE) {
        this.gameOverEmitter(room.player1, room.player2, 'Victory is yours.', 'Defeat is yours.', room);
        this.rooms.delete(roomId);
        return;
      }
      resetBall();
    }

    room.ball.x += room.ball.dx;
    room.ball.y += room.ball.dy;

    if (room.ball.y - room.ball.raduis < 0 || room.ball.y + room.ball.raduis > CANVAS_HEIGHT) {
      room.ball.dy = -room.ball.dy;
    }

    const thePlayer = room.ball.x < CANVAS_WIDTH / 2 ? room.player1.paddle : room.player2.paddle;
    if (collision(room.ball, thePlayer)) {
      let collidePoint = room.ball.y - (thePlayer.y + PADDLE_HEIGHT / 2);
      collidePoint /= PADDLE_HEIGHT / 2;
      let angleRad = (Math.PI / 4) * collidePoint;
      let direction = room.ball.x + room.ball.raduis < CANVAS_WIDTH / 2 ? 1 : -1;
      room.ball.dx = direction * room.ball.speed * Math.cos(angleRad);
      room.ball.dy = room.ball.speed * Math.sin(angleRad);
      if (room.ball.speed < 20) room.ball.speed += 1;
    }

    const allSockets = [...room.player1.sockets, ...room.player2.sockets];

    allSockets.forEach((socket) => {
      socket.emit('update', room.ball, room.player1.paddle, room.player2.paddle);
    });
  }

  updateBall(room: Room, roomId: string) {
    room.ballInterval = setInterval(() => {
      this.handleMoveBall(room, roomId);
    }, 1000 / 60);
  }
}