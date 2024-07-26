"use client"
import Leaders from "./leaders";
import RankTable from "./rankTable";
import Loading from "./Loading";
import useFetch from "./useFetch";
import "./main.css";
import "./normalize.css";

interface FetchResult {
    data: any[] | null;
    isPending: boolean;
    err: string | null;
}

const Rank = () => {
    const { data, isPending, err } = useFetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users?order_by=win`) as FetchResult;

    return (
        <section className="rank-leaderboard">
            <div className="test">
            </div>
            <div className="container-leaderboard">
                {/* {isPending && <Loading />} */}
                {/* {err && <div>{err}</div>} */}
                {data && Array.isArray(data) && <Leaders users={data.slice(0, 3)}></Leaders>}
                {/* <div className="test"></div> */}
                {data && <RankTable users={data}></RankTable>}
            </div>
        </section>
    );
}

export default Rank;