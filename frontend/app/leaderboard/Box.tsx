import useFetch from "./useFetch";

const Box = (uid: any) => {
    let { data, err, isPending } = useFetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${uid}`);
    console.log(uid)
    return (<div>${uid}</div>);
}

export default Box;