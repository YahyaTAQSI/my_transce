
CREATE TABLE users (
  uid SERIAL PRIMARY KEY,
  status VARCHAR(50) NOT NULL,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  bio TEXT,
  password VARCHAR(255) NOT NULL,
  TwoFA BOOLEAN NOT NULL,
  choosedProfileImage VARCHAR(255),
  choosedBanner VARCHAR(255)
);


CREATE TABLE achievements (
  aid SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  uri VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  unlocked BOOLEAN NOT NULL
);


CREATE TABLE user_achievements (
  user_id INT REFERENCES users(uid),
  achievement_id INT REFERENCES achievements(aid),
  PRIMARY KEY (user_id, achievement_id),
  FOREIGN KEY (user_id) REFERENCES users(uid),
  FOREIGN KEY (achievement_id) REFERENCES achievements(aid)
);
