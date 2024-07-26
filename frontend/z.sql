CREATE TABLE chats (
  chat_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(uid),
  friend_id INT REFERENCES users(uid),
  chat_date DATE NOT NULL, -- Date of the chat
  CONSTRAINT fk_chat_user FOREIGN KEY (user_id) REFERENCES users(uid),
  CONSTRAINT fk_chat_friend FOREIGN KEY (friend_id) REFERENCES users(uid)
);

-- Messages table
CREATE TABLE messages (
  message_id SERIAL PRIMARY KEY,
  chat_id INT REFERENCES chats(chat_id),
  time TIMESTAMP NOT NULL,
  msg TEXT NOT NULL,
  recipient BOOLEAN NOT NULL,
  CONSTRAINT fk_message_chat FOREIGN KEY (chat_id) REFERENCES chats(chat_id)
);




INSERT INTO "Achievement" (name, description, uri)
VALUES ('First Win', 'Win your first match', 'http://localhost:3000/ach/first_win.png');
INSERT INTO "Achievement" (name, description, uri)
VALUES ('First Defeat', 'You have faced your first defeat. Rise and fight again!', 'http://localhost:3000/ach/first_defeat.png');
INSERT INTO "Achievement" (name, description, uri)
VALUES ('Flawless Victory', 'Win a single match without letting your opponent score a single point.', 'http://localhost:3000/ach/flawless.png');
INSERT INTO "Achievement" (name, description, uri)
VALUES ('Marathon Match', 'You have shown true stamina by completing a match that lasted over 5 minutes.', 'http://localhost:3000/ach/Speed_Demon.png');
INSERT INTO "Achievement" (name, description, uri)
VALUES ('Ping Pong Pro', 'Win 50 matches against tough opponents', 'http://localhost:3000/ach/ping_pong_pro.png');
INSERT INTO "Achievement" (name, description, uri)
VALUES ('AI Conqueror', 'Defeat the AI opponent on the highest difficulty level in a single match.', 'http://localhost:3000/ach/ai_conqueror.png');