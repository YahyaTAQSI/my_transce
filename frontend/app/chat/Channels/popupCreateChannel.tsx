"use client";
import React, { ChangeEvent, FormEvent, useState } from "react";
import Image from "next/image";
import { IoCameraReverse } from "react-icons/io5";
import { MdOutlineCancel } from "react-icons/md";
import "./channelChat.css";
import { useRecoilValue } from "recoil";
import { userToken } from "@/app/Atoms/userToken";

interface popupProps {
  userId: number;
  setShowPopUpCreateChannel: React.Dispatch<React.SetStateAction<boolean>>;
}

const PopupCreateChannel: React.FC<popupProps> = ({
  userId,
  setShowPopUpCreateChannel,
}) => {
  const [selectedChannelPicture, setSelectedChannelPicture] = useState(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/channelDefaultImage.png`
  );

  const [name, setName] = useState("");
  const [status, setStatus] = useState("PUBLIC");
  const [topic, setTopic] = useState("");
  const [code, setCode] = useState(8888);
  const [file, setFile] = useState<File | null>(null);

  const userTok = useRecoilValue(userToken);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", status);
    formData.append("code", code.toString());
    formData.append("topic", topic);
    console.log("formData: ", formData);
    if (file) formData.append("uri", file);

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/channelss?userId=${userId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userTok}`,
      },
      body: formData,
    }).then(() => {
      setShowPopUpCreateChannel(false);
      setSelectedChannelPicture("/channelDefaultImage.png");
      setName("");
      setStatus("PUBLIC");
      setTopic("");
      setCode(8888);
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);
    if (selectedFile) {
      const imageUrl = URL.createObjectURL(selectedFile);
      setSelectedChannelPicture(imageUrl);
    }
  };

  const handleStatusChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStatus(e.target.value);
  };

  return (
    <div className="popupContainer">
      <button
        className="cancelBtn"
        onClick={() => {
          setShowPopUpCreateChannel(false);
        }}
      >
        <MdOutlineCancel />
      </button>
      <h3>create channel</h3>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="imageContainer">
          <Image
            className="img"
            src={selectedChannelPicture}
            width={130}
            height={130}
            alt=""
          />
          <div className="chooseImageBtn">
            <label htmlFor="file-upload" className="">
              <IoCameraReverse />
            </label>
            <input
              required
              type="file"
              id="file-upload"
              className="custom-file-input"
              accept="image/*"
              onChange={(e) => {
                handleChange(e);
              }}
            />
          </div>
        </div>
        <div className="nameInput">
          <label htmlFor="channelName">channel name</label>
          <input
            required
            type="text"
            name="name"
            id="channelName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="name"
          />
        </div>
        <div className="topicInput">
          <label htmlFor="channeltopic">channel topic</label>
          <input
            required
            type="text"
            name="topic"
            id="channeltopic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="topic"
          />
        </div>
        <div className="channelType">
          <div>
            <input
              type="radio"
              id="public"
              value="PUBLIC"
              checked={status === "PUBLIC"}
              onChange={handleStatusChange}
            />
            <label htmlFor="public">public</label>
          </div>
          <div>
            <input
              type="radio"
              id="private"
              value="PRIVATE"
              checked={status === "PRIVATE"}
              onChange={handleStatusChange}
            />
            <label htmlFor="private">private</label>
          </div>
          <div>
            <input
              type="radio"
              id="protected"
              value="PROTECTED"
              checked={status === "PROTECTED"}
              onChange={handleStatusChange}
            />
            <label htmlFor="protected">protected</label>
          </div>
          {status == "PROTECTED" ? (
            <input
              required
              maxLength={4}
              type="number"
              name="code"
              value={code}
              onKeyDown={(e) => e.key === "." && e.preventDefault()}
              onChange={(e) => {
                if (e.target.value.length < 5) setCode(+e.target.value);
              }}
              className="protectedPassword"
              placeholder="code"
            />
          ) : (
            ""
          )}
        </div>
        <button className="createChannelBtn" type="submit">
          create
        </button>
      </form>
    </div>
  );
};

export default PopupCreateChannel;
