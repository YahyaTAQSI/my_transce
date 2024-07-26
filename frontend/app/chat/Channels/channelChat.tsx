import React, { useEffect, useState } from "react";
import Image from "next/image";
import "./channelChat.css";
import { IoArrowBackOutline } from "react-icons/io5";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { GrChannel } from "react-icons/gr";

interface channelInterface {
  id: number;
  name: string;
  topic: string;
  type: string;
  uri: string;
  roles: any[];
}

interface channelChatProps {
  channels: channelInterface[] | undefined;
  setSelectedChannel: React.Dispatch<React.SetStateAction<number>>;
  setShowPopUpCreateChannel: React.Dispatch<React.SetStateAction<boolean>>;
  setShowPopUpSearchChannels: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChannelChat: React.FC<channelChatProps> = ({
  channels,
  setSelectedChannel,
  setShowPopUpCreateChannel,
  setShowPopUpSearchChannels,
}) => {
  return (
    <>
      <div className="channelsListContainer">
        {channels?.map((channel, index) => {
          return (
            <div
              key={channel.id}
              className="channelContainer"
              onClick={() => {
                console.log(">>>>>>>>>>>>>>>>", channel.uri);
                setSelectedChannel(channel.id);
                console.log("<<<<<<<<<<<<<<<<", channel.uri);
              }}
            >
              <div className="imageContainer">
                <Image
                  className="channelImage"
                  // src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${channel.uri}`}
                  src={channel.uri}
                  width={80}
                  height={80}
                  alt="avatar"
                />
              </div>
              <div className="name_lastmsg">
                <p>
                  {channel.name.length > 10
                    ? `${channel.name.substring(0, 10)}..`
                    : channel.name}
                </p>
                <span>
                  {channel.roles.length}
                  {channel.roles.length < 2 ? " member" : " members"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div
        className="addChannelBtn"
        onClick={() => setShowPopUpCreateChannel(true)}
      >
        <AiOutlineUsergroupAdd />
      </div>
      <div
        className="searchChannelBtn"
        onClick={() => setShowPopUpSearchChannels(true)}
      >
        <GrChannel />
      </div>
    </>
  );
};

export default ChannelChat;
