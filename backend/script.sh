#/bin/bash
export FRONT_URL="http://10.13.10.8:5252"
export BACK_URL="http://10.13.10.8:3000"


# Wait for PostgreSQL to be ready
until pg_isready -h postgres -p 5432 -U "$POSTGRES_USER"; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 2
done

# Run Prisma migrations
npx --yes prisma migrate dev --name init

# Connect to the database and execute any additional commands (if needed)
PGPASSWORD="$POSTGRES_PASSWORD" psql -h postgres -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<EOF

INSERT INTO "Item" (img , name , description , price , type , power , color)
VALUES ('$BACK_URL/pd/pd1.png', 'test name1', 'test description', 10, 'paddle', 'Power', 'yellow');
INSERT INTO "Item" (img , name , description , price , type , power , color)
VALUES ('$BACK_URL/pd/pd2.png', 'test name2', 'test description', 10, 'paddle', 'Power', 'green');
INSERT INTO "Item" (img , name , description , price , type , power , color)
VALUES ('$BACK_URL/pd/pd3.png', 'test name3', 'test description', 10, 'paddle', 'Power', 'pink');
INSERT INTO "Item" (img , name , description , price , type , power , color)
VALUES ('$BACK_URL/pd/pd4.png', 'test name4', 'test description', 10, 'paddle', 'Power', 'red');

INSERT INTO "Item" (img , name , description , price , type , power)
VALUES ('$BACK_URL/bn/bn1.jpeg', 'test name5', 'test description', 10, 'banner', 'Power');
INSERT INTO "Item" (img , name , description , price , type , power)
VALUES ('$BACK_URL/bn/bn2.jpg', 'test name6', 'test description', 10, 'banner', 'Power');
INSERT INTO "Item" (img , name , description , price , type , power)
VALUES ('$BACK_URL/bn/bn3.jpg', 'test name7', 'test description', 10, 'banner', 'Power');
INSERT INTO "Item" (img , name , description , price , type , power)
VALUES ('$BACK_URL/bn/defaultBanner.jpg', 'test name8', 'test description', 10, 'banner', 'Power');


INSERT INTO "Item" (img , name , description , price , type , power)
VALUES ('$BACK_URL/av/av1.png', 'test name9', 'test description', 10, 'avatar', 'Power');
INSERT INTO "Item" (img , name , description , price , type , power)
VALUES ('$BACK_URL/av/av10.png', 'test name10', 'test description', 10, 'avatar', 'Power');
INSERT INTO "Item" (img , name , description , price , type , power)
VALUES ('$BACK_URL/av/av2.png', 'test name11', 'test description', 10, 'avatar', 'Power');
INSERT INTO "Item" (img , name , description , price , type , power)
VALUES ('$BACK_URL/av/av3.png', 'test name12', 'test description', 10, 'avatar', 'Power');
INSERT INTO "Item" (img , name , description , price , type , power)
VALUES ('$BACK_URL/av/av4.png', 'test name13', 'test description', 10, 'avatar', 'Power');
INSERT INTO "Item" (img , name , description , price , type , power)
VALUES ('$BACK_URL/av/av5.png', 'test name14', 'test description', 10, 'avatar', 'Power');
INSERT INTO "Item" (img , name , description , price , type , power)
VALUES ('$BACK_URL/av/av6.png', 'test name15', 'test description', 10, 'avatar', 'Power');
INSERT INTO "Item" (img , name , description , price , type , power)
VALUES ('$BACK_URL/av/av7.png', 'test name16', 'test description', 10, 'avatar', 'Power');
INSERT INTO "Item" (img , name , description , price , type , power)
VALUES ('$BACK_URL/av/av8.png', 'test name17', 'test description', 10, 'avatar', 'Power');
INSERT INTO "Item" (img , name , description , price , type , power)
VALUES ('$BACK_URL/av/av9.png', 'test name18', 'test description', 10, 'avatar', 'Power');


INSERT INTO "Achievement" (name, description, uri)
VALUES ('First Win', 'Win your first match', '$BACK_URL/ach/first_win.png');
INSERT INTO "Achievement" (name, description, uri)
VALUES ('First Defeat', 'You have faced your first defeat. Rise and fight again!', '$BACK_URL/ach/first_defeat.png');
INSERT INTO "Achievement" (name, description, uri)
VALUES ('Flawless Victory', 'Win a single match without letting your opponent score a single point.', '$BACK_URL/ach/flawless.png');
INSERT INTO "Achievement" (name, description, uri)
VALUES ('Marathon Match', 'You have shown true stamina by completing a match that lasted over 5 minutes.', '$BACK_URL/ach/Speed_Demon.png');
INSERT INTO "Achievement" (name, description, uri)
VALUES ('Ping Pong Pro', 'Win 50 matches against tough opponents', '$BACK_URL/ach/ping_pong_pro.png');
INSERT INTO "Achievement" (name, description, uri)
VALUES ('AI Conqueror', 'Defeat the AI opponent on the highest difficulty level in a single match.', '$BACK_URL/ach/ai_conqueror.png');

EOF

echo "Data inserted successfully."

npm run start:dev