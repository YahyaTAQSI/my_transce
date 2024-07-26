import Image from "next/image";
import avatar from "./assets/avatars/av-1.svg";
import throphy1 from "./assets/throphies/throphy-1.svg";
import { getRank } from "../util/headers";

interface RankTableProps {
  users: any[];
}

const RankTable: React.FC<RankTableProps>  = ({ users }) => {
  if (users.length == 3) {
    return <div className="scrollable-leaderboard"></div>;
  }

  const i = users.length >= 3 ? 0 : 3;
  const data = !i ? users.slice(3, users.length) : users;
  return (
    <div className="scrollable-leaderboard">
      <table>
        <tr>
          <th>Place</th>
          <th>Player Name</th>
          <th>Local stat</th>
          <th>Winrate</th>
          <th>WLR</th>
          <th>Rank</th>
        </tr>
        {data.map((user, index) => {
          let rank = getRank(user.xp);
          console.log("RANK ", rank);
          return (
            <tr key={user.uid}>
              <td>#{index + 4 - i}</td>
              <td>
                <Image height={40} width={40} src={user.avatar} alt="" />
                {/* <Image src={avatar} alt=""/> */}
                <span>{user.username}</span>
              </td>
              <td>
                {user.win}-{user.lose}
              </td>
              <td>
                {user.lose === 0
                  ? "100%"
                  : `${(user.win / user.lose).toFixed(2)}%`}
              </td>
              <td>{user.lose === 0 ? "0%" : `${user.win / user.lose}%`}</td>
              <td>
                <Image
                  height={40}
                  width={40}
                  src={`/ranks/${rank}.png`}
                  alt=""
                />
                <span>{rank}</span>
              </td>
            </tr>
          );
        })}
      </table>
    </div>
  );
};

export default RankTable;
