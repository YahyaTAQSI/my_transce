import { useRecoilValue } from "recoil";
import { userToken } from "../Atoms/userToken";
// const userTok = useRecoilValue(userToken);

const mheaders = {
  Authorization: `Bearer ${userToken}`,
  "Content-Type": "application/json",
};

const getRank = (xp: number) => {
  if (xp >= 0 && xp <= 100) return "Beginner";
  if (xp > 100 && xp <= 200) return "Intermediate";
  if (xp > 200 && xp <= 300) return "Expert";
  if (xp > 300 && xp <= 400) return "Master";
  if (xp > 400 && xp <= 500) return "Grandmaster";
  if (xp > 500) return "Apex";
};

const adjustXP = (xp: number, result: string) => {
  const rank = getRank(xp);
  let points = 0;

  switch (rank) {
    case "Beginner":
      points = result === "win" ? 10 : -1;
      break;
    case "Intermediate":
      points = result === "win" ? 8 : -2;
      break;
    case "Expert":
      points = result === "win" ? 6 : -3;
      break;
    case "Master":
      points = result === "win" ? 4 : -4;
      break;
    case "Grandmaster":
      points = result === "win" ? 2 : -5;
      break;
    case "Apex":
      points = result === "win" ? 1 : -6;
      break;
  }

  return xp + points;
};

export { mheaders, getRank };
