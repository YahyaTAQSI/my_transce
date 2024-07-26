"use client"
import { useState, useEffect } from "react";

const useFetch = (url:string) => {
    let [data, setData] = useState(null);
    let [isPending, setPending] = useState(true);
    let [err, setErr] = useState(null);
    useEffect(() => {
        fetch(url)
            .then((res) => {
                if (!res.ok) {
                    throw Error('Could not fetch');
                }
                return res.json();
            })
            .then((data) => {
                setErr(null);
                setData(data);
                setPending(false);
            }).catch((err)=> {
                setPending(false);
                setErr(err.message);
                setData(null);
            });
    }, [url]);
    return {data, isPending, err}
}

export default useFetch;