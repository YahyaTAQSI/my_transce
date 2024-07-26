"use client";
import React, { useEffect, useState } from "react";
import "./channelChat.css";
import { MdOutlineCancel } from "react-icons/md";
import { useRecoilValue } from "recoil";
import { userToken } from "@/app/Atoms/userToken";
import Image from "next/image";

interface popupProps {
  setSelectedChannel: React.Dispatch<React.SetStateAction<number>>;
  setShowPopUpSearchChannels: React.Dispatch<React.SetStateAction<boolean>>;
  userId: number;
}

interface channelInterface {
  name: string;
  type: string;
  topic: string;
  uri: string;
  code: number;
  id: number;
}

const PopupSearchChannels: React.FC<popupProps> = ({
  setSelectedChannel,
  setShowPopUpSearchChannels,
  userId,
}) => {
  const [error, setError] = useState<string>("");
  const [code, setCode] = useState<number | undefined>(0);
  const [channelName, setChannelName] = useState("");
  const [fetchedChannels, setFetchedChannels] = useState<channelInterface[]>();
  const userTok = useRecoilValue(userToken);

  const handleJoin = async (id: number) => {
    const req = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/channelss/roles?channelId=${id}`,
      {
        headers: {
          Authorization: `Bearer ${userTok}`,
          "Content-Type": "application/json",
        },
      }
    );
    const allRoles = await req.json();
    console.log("all roles =>", allRoles);
    const imIinIt = allRoles.filter((e: any) => e.userID == userId);
    if (imIinIt.length && imIinIt.length > 0) {
      console.log("ALREADY IN IT imIinIt => ", imIinIt);
      setShowPopUpSearchChannels(false);
      setSelectedChannel(id);
      setCode(undefined);
      return;
    }
    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/channelss/joinpublic?userID=${userId}&channelID=${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${userTok}`,
          "Content-Type": "application/json",
        },
      }
    ).then(() => {
      setCode(0);
      setShowPopUpSearchChannels(false);
    });
  };

  const handleJoinProtected = async (id: number, originalCode: number) => {
    console.log(
      "id : ",
      id,
      " original code :",
      originalCode,
      " entered code :",
      code
    );
    if (originalCode == code) {
      handleJoin(id);
    } else {
      setError("code is wrong");
      setCode(undefined);
      setTimeout(() => {
        setError("");
      }, 2000);
    }
  };

  useEffect(() => {
    console.log("HERE");
    const fetchFreshChannels = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/channelss?mustinclude=${channelName}`,
        {
          headers: {
            Authorization: `Bearer ${userTok}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      console.log("data is equal to :", data);
      setFetchedChannels(data);
    };

    fetchFreshChannels();
  }, [channelName]);

  return (
    <div className="popupContainer">
      <button
        className="cancelBtn"
        onClick={() => {
          setShowPopUpSearchChannels(false);
          setChannelName("");
          setCode(undefined);
        }}
      >
        <MdOutlineCancel />
      </button>
      <div className="searchingArea">
        {error.length > 0 ? <p className="errorMsg">{error}</p> : ""}
        <input
          type="text"
          name="channelName"
          className="searchingChannelInput"
          placeholder="search channel"
          value={channelName}
          onChange={(e) => setChannelName(e.currentTarget.value)}
        />
        <div className="searchedChannelsList">
          {fetchedChannels &&
            fetchedChannels?.map((e: channelInterface) => {
              return (
                <div className="channelLink" key={e.id}>
                  <div className="imageAndName">
                    <Image
                      src={`${e.uri}`}
                      width={50}
                      height={50}
                      alt="IMG"
                      className="channelImage"
                    />
                    <div className="nameAndCode">
                      <p>{e.name}</p>
                      {e.type == "PROTECTED" ? (
                        <input
                          type="number"
                          style={{ appearance: "textfield" }}
                          placeholder="code"
                          onKeyDown={(e) => e.key === "." && e.preventDefault()}
                          value={code != undefined ? code.toString() : ""}
                          onChange={(e) => {
                            if (e.target.value.length < 5)
                              setCode(parseInt(e.target.value));
                          }}
                        />
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                  {e.type == "PUBLIC" ? (
                    <button
                      className="joinBtn"
                      onClick={() => handleJoin(e.id)}
                    >
                      join
                    </button>
                  ) : (
                    <button
                      className="joinBtn"
                      onClick={() => handleJoinProtected(e.id, e.code)}
                    >
                      join
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default PopupSearchChannels;
