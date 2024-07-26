"use client";

import React, { useEffect, useState } from "react";
import "./Stats.css";
import playerData from "../data/player-info.json";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts/core";
import { useRecoilValue } from "recoil";
import { userToken } from "../Atoms/userToken";
import { loggedUser } from "../Atoms/logged";
import { useRouter } from "next/navigation";

export default function Stats() {
  const [data, setData] = useState<any[]>([]);
  const router = useRouter();

  const userTok = useRecoilValue(userToken);
  const userId = useRecoilValue(loggedUser);
  const fetchedData = async () => {
    if (userId === -1) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/match-history/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${userTok}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setData(data);
    } catch (err) {
      console.error(">>>>>>", err);
    }
  };
  useEffect(() => {
    fetchedData();
  }, []);

  const [statsSwitch, setStatsSwitch] = useState({
    state: "win",
    color: "#1ce14e",
  });

  const [chartData, setChartData] = useState();

  const switchStats = (e: any) => {
    const buttonText = e.target.value;

    if (buttonText === "see all") router.push("/latest-games");

    if (buttonText === "win")
      setStatsSwitch({ state: "win", color: "#1ce14e" });

    if (buttonText === "lose")
      setStatsSwitch({ state: "lose", color: "#ff3355" });

    if (buttonText === "w/l")
      setStatsSwitch({ state: "w/l", color: "#ff7f00" });
  };

  // hada lik a mimoun
  const getStats = () => {
    return (
      data.length > 0 &&
      data.map((e) => {
        if (statsSwitch.state === "win") return e.win;
        if (statsSwitch.state === "lose") return e.lose;
        if (statsSwitch.state === "w/l") return e.w_l;
      })
    );
  };

  useEffect(() => {
    setChartData(getStats() as any);
  }, [statsSwitch, data]);

  const getMatchesDates = () => {
    if (data.length === 0) return [];
    const dates = data.map((e) => {
      const date = e?.date + ":00:00";
      const options = { hour: "2-digit", minute: "2-digit" };
      const dateObject = new Date(date).toLocaleString(
        "en-US",
        options as Intl.DateTimeFormatOptions
      );
      return dateObject;
    });
    console.log(">>>>>>>>>>>>>2", dates);
    return dates;
  };

  const option = {
    // title: {
    //   text: `Your ${
    //     statsSwitch.state === "w/l" ? "win-loss ratio" : statsSwitch.state
    //   } over the week`,
    //   textStyle: {
    //     color: statsSwitch.color,
    //   },
    // },
    tooltip: {
      backgroundColor: "#27272b",
      borderWidth: 1,
      trigger: "axis",
      axisPointer: {
        type: "line",
        label: {
          backgroundColor: "#27272b",
        },
        lineStyle: {
          color: "transparent",
        },
      },
    },
    grid: {
      left: "2%",
      right: "5%",
      bottom: "2%",

      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        boundaryGap: false,
        data: getMatchesDates(),
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        axisLabel: {
          show: true,
          color: "#ffffff",
        },
      },
    ],
    yAxis: [
      {
        splitLine: {
          show: false,
        },
        type: "value",
        axisLine: {
          lineStyle: {
            color: "transparent",
          },
        },
      },
    ],
    series: [
      {
        name: statsSwitch.state,
        type: "line",
        stack: "Total",
        smooth: true,
        lineStyle: {
          width: 2,
          color: statsSwitch.color + "80",
        },
        showSymbol: true,
        itemStyle: {
          color: statsSwitch.color,
          borderColor: statsSwitch.color,
        },
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: statsSwitch.color,
            },
            {
              offset: 1,
              color: "#27272b",
            },
          ]),
        },
        data: chartData,
      },
    ],
  };

  return (
    <div className="stats_container">
      <ReactECharts className="reactEcharts" option={option} />
      <select
        value={statsSwitch.state}
        onChange={switchStats}
        className="select_stats"
        style={{
          color: statsSwitch.color,
          background: statsSwitch.color + "10",
        }}
      >
        <option value="win">win</option>
        <option value="lose">lose</option>
        <option value="w/l">w/l</option>
        <option value="see all">see all</option>
      </select>
    </div>
  );
}
