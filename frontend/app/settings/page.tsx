"use client";
import React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { IoMdAdd } from "react-icons/io";
import { IoCameraReverse } from "react-icons/io5";
import { FaLock } from "react-icons/fa";
import "../store/store.css";
import "./settings.css";
import { userToken } from "@/app/Atoms/userToken";
import { useRecoilState, useRecoilValue } from "recoil";
import { loggedUser } from "../Atoms/logged";
import { FaImages } from "react-icons/fa6";
import { FaArrowLeft } from "react-icons/fa";
import { twoFA } from "../Atoms/_If_2fa";
import { userAvatar } from "../Atoms/userAvatar";

interface dataInterface {
  avatar: string;
  banner: string;
  username: string;
  email: string;
  oldPassword: string;
  newPassword: string;
  confirmedPassword: string;
  bio: string;
  twoFA: boolean;
  strategy: string;
  wallet: number;
}

interface itemsInterface {
  description: string;
  id: number;
  img: string;
  type: string;
  name: string;
  power: string;
  price: string;
  choosed: boolean;
  owned: boolean;
}

interface User {
  username?: string;
  email?: string;
  bio?: string;
  twoFA?: boolean;
  oldPassword?: string;
  newPassword?: string;
  confirmedPassword?: string;
}

//${process.env.NEXT_PUBLIC_BACKEND_URL}/image.jpeg
const Settings = () => {
  const [ArticlesType, setArticlesType] = useState("");
  const [showArticlesPopup, setShowArticlesPopup] = useState(false);
  const [twofa, setTwofa] = useRecoilState(twoFA);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<dataInterface>();
  const [errors, setErrors] = useState<string>("");
  const [qrImage, setQrImage] = useState<string>("");
  const [avatarsAndPaddles, setAvatarsAndPaddles] =
    useState<itemsInterface[]>();
  const userTok = useRecoilValue(userToken);
  const userId = useRecoilValue(loggedUser);
  const [userAV, setUserAV] = useRecoilState(userAvatar);

  //${process.env.NEXT_PUBLIC_BACKEND_URL}/users/2 if no 2 the backend does not return an error
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    const fetchedData = async () => {
      try {
        const avatarsAndPaddlesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/useritems?userId=${userId}`, //remove the id in the response
          {
            headers: {
              Authorization: `Bearer ${userTok}`,
              "Content-Type": "application/json",
            },
          }
        );

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${userTok}`,
            "Content-Type": "application/json",
          },
        });
        const avatarsAndPaddlesData = await avatarsAndPaddlesResponse.json();
        const d = await response.json();
        console.log("D >>>>> ", d);
        /******** */
        setData(d);
        setUserAV(d?.avatar);

        setAvatarsAndPaddles(avatarsAndPaddlesData);
        getNewQrCode(d);
        console.log("data", d);
        console.log("avatarsAndPaddles", avatarsAndPaddlesData);
      } catch (err) {
        console.error("settings error >>>>>>", err);
      }
    };

    fetchedData();
  }, [showArticlesPopup]);

  // useEffect(() => {
  //           console.log("D >>>>> ", data);

  //     bringQrImage(data?.twoFA);

  // }, [data])

  function changeInputValue(
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    switch (name) {
      case "username":
        setData((data) => ({
          ...(data as dataInterface),
          username: value,
        }));
        break;
      case "email":
        setData((data) => ({
          ...(data as dataInterface),
          email: value,
        }));
        break;
      case "oldPassword":
        setData((data) => ({
          ...(data as dataInterface),
          oldPassword: value,
        }));
        break;
      case "newPassword":
        setData((data) => ({
          ...(data as dataInterface),
          newPassword: value,
        }));
        break;
      case "confirmedPassword":
        setData((data) => ({
          ...(data as dataInterface),
          confirmedPassword: value,
        }));
        break;
      case "bio":
        setData((data) => ({
          ...(data as dataInterface),
          bio: value,
        }));
        break;
      default:
        break;
    }
  }

  const saveUpdatewBtn = async () => {
    console.log("????", data);
    try {
      setErrors("");
      if (
        data?.newPassword == "" &&
        data?.confirmedPassword == "" &&
        data?.oldPassword == ""
      ) {
      } else {
        if (
          data?.newPassword == "" ||
          data?.confirmedPassword == "" ||
          data?.oldPassword == ""
        ) {
          setErrors("fill the 3 password fileds to change it !");
          return;
        } else if (data?.newPassword !== data?.confirmedPassword) {
          setErrors("you didn't confirm your password well ! ");
          return;
        }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${userTok}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatar: data?.avatar,
          banner: data?.banner,
          username: data?.username,
          email: data?.email,
          oldPassword: data?.oldPassword,
          newPassword: data?.newPassword,
          confirmedPassword: data?.confirmedPassword,
          bio: data?.bio,
          twoFA: data?.twoFA,
        }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        setErrors((prev) => prev + "\n" + errorResponse.message);
        throw new Error(
          `Failed to patch data. Error: ${errorResponse.message}`
        );
      }
      setErrors("");
    } catch (err) {
      console.error("SS ERR>>>", err);
    }
  };

  const saveUpdatewBtn2 = async () => {
    try {
      setErrors("");
      if (
        data?.newPassword == "" &&
        data?.confirmedPassword == "" &&
        data?.oldPassword == ""
      ) {
      } else {
        if (
          data?.newPassword == "" ||
          data?.confirmedPassword == "" ||
          data?.oldPassword == ""
        ) {
          setErrors("fill the 3 password fileds to change it !");
          return;
        } else if (data?.newPassword !== data?.confirmedPassword) {
          setErrors("you didn't confirm your password well ! ");
          return;
        }
      }

      const body: Partial<User> = {
        username: data?.username,
        email: data?.email,
        bio: data?.bio,
        twoFA: data?.twoFA,
      };

      if (data?.oldPassword && data.oldPassword !== "") {
        body.oldPassword = data.oldPassword;
        body.newPassword = data.newPassword;
        body.confirmedPassword = data.confirmedPassword;
      }
      console.log(body);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${userTok}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...body }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        setErrors((prev) => prev + "\n" + errorResponse.message);
        throw new Error(
          `Failed to patch data. Error: ${errorResponse.message}`
        );
      }
      setErrors("");
    } catch (err) {
      console.error("SS ERR>>>", err);
    }
  };

  const getNewQrCode = async (data: any) => {
    if (data.twoFA) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/2fa/turn-on`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userTok}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: userId,
          email: data.email,
        }),
      });
      const data_ = await response.text();
      setQrImage(data_);
    }
  };

  const bringQrImage = async (data: any) => {
    console.log("data   ", data);
    if (!data.twoFA) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/2fa/turn-on`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userTok}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: userId,
          email: data.email,
        }),
      });
      const data_ = await response.text();
      setQrImage(data_);
      console.log(data_);
    } else {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${userTok}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          twoFASecret: "",
          twoFA: false,
        }),
      });
    }
  };

  const changeImageInTheServer = async (
    id: number,
    img: string,
    type: string
  ) => {
    try {
      if (type == "avatar") {
        setData((data) => ({
          ...(data as dataInterface),
          avatar: img,
        }));
      } else if (type == "banner") {
        setData((data) => ({
          ...(data as dataInterface),
          banner: img,
        }));
      }
      // const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/useritems`, {
      //   method: "PATCH",
      //   headers: {
      //     Authorization: `Bearer ${userTok}`,
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     userId: userId,
      //     itemId: id,
      //     choosed: true,
      //   }),
      // });
      // if (!response.ok) {
      //   const errorResponse = await response.json();
      //   throw new Error(`Failed to PATCH data. Error: ${errorResponse.message}`);
      // }
      setLoading(true);
      setTimeout(() => setLoading(false), 1000);
      setShowArticlesPopup(false);
      const response =
        type == "avatar"
          ? await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/useritems`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${userTok}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              itemId: id,
              userId: userId,
              // choosed: true,
              type: type,
              img: img,
            }),
          })
          : await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${userTok}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              banner: img,
            }),
          });
      if (!response.ok) {
        const errorResponse = await response.json();
        setErrors("Something went wrong !");
        throw new Error(
          `Failed to patch data. Error: ${errorResponse.message}`
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("changed");
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload/${userId}?type=${ArticlesType}`, {
        method: "POST",
        body: formData,
      })
        .then((res) => {
          setShowArticlesPopup(false);
        })
        .catch((error) => {
          setErrors("something went wrong ! try again.");
        });
    }
  };

  return (
    <>
      {loading ? (
        <div className="container">
          <div className="bat">
            <div className="handle">
              <div className="inner"></div>
            </div>
            <div className="front"></div>
          </div>
          <div className="ball"></div>
        </div>
      ) : (
        <>
          {showArticlesPopup ? (
            // <Popup
            //   Type={ArticlesType}
            //   Articles={player_data.avatarsAndPaddles}
            //   setShowArticlesPopup={setShowArticlesPopup}
            //   setProfileImage={setProfileImage}
            //   setProfileBanner={setProfileBanner}
            // />
            <>
              <div className="choosedItemsList">
                {avatarsAndPaddles?.map((e) => {
                  return e.type == ArticlesType ? (
                    e.type == "avatar" && e.owned && !e.choosed ? (
                      <div
                        key={e.id}
                        className="item"
                        onClick={() =>
                          changeImageInTheServer(e.id, e.img, "avatar")
                        }
                      >
                        <Image
                          className="img"
                          src={`${e.img}`}
                          width={200}
                          height={200}
                          alt="IMG"
                        />
                        <p>{e.name}</p>
                      </div>
                    ) : e.type == "banner" && !e.choosed ? (
                      <div
                        key={e.id}
                        className="item"
                        style={{ backgroundColor: "transparent" }}
                        onClick={() =>
                          changeImageInTheServer(e.id, e.img, "banner")
                        }
                      >
                        <Image
                          className="img"
                          style={{
                            borderRadius: 0,
                            width: "100%",
                            height: "60%",
                          }}
                          src={`${e.img}`}
                          width={200}
                          height={200}
                          alt="IMG"
                        />
                      </div>
                    ) : (
                      ""
                    )
                  ) : (
                    ""
                  );
                })}
              </div>
              <div className="uploadAndCancel">
                <label htmlFor="file-upload" className="custom-file-upload">
                  Upload Image <FaImages />
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                <button
                  className="cancel"
                  onClick={() => {
                    setArticlesType("");
                    setShowArticlesPopup(false);
                  }}
                >
                  <FaArrowLeft /> Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="settings-container">
              <div
                className="banner"
                style={{
                  backgroundImage: `url('${data?.banner}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="image-holder">
                  <div>
                    <Image
                      className="profile-image"
                      src={`${data?.avatar || `${process.env.NEXT_PUBLIC_BACKEND_URL}/default.png`
                        }`}
                      width={192}
                      height={192}
                      alt="Profile Picture"
                    />
                  </div>
                  <button
                    className="btn-change-profile"
                    onClick={() => {
                      setLoading(true);
                      setTimeout(() => setLoading(false), 1000);
                      setArticlesType("avatar");
                      setShowArticlesPopup(true);
                    }}
                  >
                    <IoCameraReverse className="camera" />
                  </button>
                </div>
                <div className="button-holder">
                  <button
                    className="addBannerBtn"
                    onClick={() => {
                      setLoading(true);
                      setTimeout(() => setLoading(false), 1000);
                      setArticlesType("banner");
                      setShowArticlesPopup(true);
                    }}
                  >
                    <IoMdAdd className="plus-icon" />
                  </button>
                </div>
              </div>
              <div className="inputs-and-2fa">
                <div className="inputs">
                  <>
                    <label htmlFor="username">username</label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      placeholder="Username"
                      className="username"
                      value={data?.username}
                      onChange={(e) => changeInputValue(e)}
                    />
                  </>
                  <>
                    <label htmlFor="label">email</label>
                    <input
                      type="text"
                      name="email"
                      id="email"
                      placeholder="Email"
                      className="email"
                      value={data?.email}
                      onChange={(e) => changeInputValue(e)}
                    />
                  </>
                  <>
                    <label htmlFor="label">Bio</label>
                    <textarea
                      rows={4}
                      placeholder="Bio"
                      className="username"
                      name="bio"
                      value={data?.bio}
                      onChange={(e) => changeInputValue(e)}
                    />
                  </>
                  {data?.strategy == "local" && (
                    <>
                      <>
                        <label htmlFor="label">password</label>
                        <input
                          id="password"
                          type="password"
                          name="oldPassword"
                          placeholder="old Password"
                          className="Password"
                          value={data?.oldPassword}
                          onChange={(e) => changeInputValue(e)}
                        />
                      </>
                      <>
                        <label htmlFor="label">new password</label>
                        <input
                          id="newpassword"
                          type="password"
                          name="newPassword"
                          placeholder="new Password"
                          className="Password"
                          value={data?.newPassword}
                          onChange={(e) => changeInputValue(e)}
                        />
                      </>
                      <>
                        <label htmlFor="confirmpassword">
                          confirm password
                        </label>
                        <input
                          id="confirmpassword"
                          type="password"
                          name="confirmedPassword"
                          placeholder="confirm Password"
                          className="Password"
                          value={data?.confirmedPassword}
                          onChange={(e) => changeInputValue(e)}
                        />
                      </>
                    </>
                  )}
                  <pre className="errorsMsg">{errors}</pre>
                </div>
                <div className="twofa">
                  <h4>
                    Set Up Two Factor Authentication <FaLock />
                  </h4>
                  <div>
                    {data?.twoFA == true && (
                      <Image
                        src={qrImage}
                        alt="Qr code"
                        width={200}
                        height={200}
                      />
                    )}
                    <button
                      onClick={() => {
                        setTwofa(!data?.twoFA);
                        setData((data) => ({
                          ...(data as dataInterface),
                          twoFA: !data?.twoFA,
                        }));
                        bringQrImage(data);
                      }}
                      className={data?.twoFA ? "redbc" : "greenbc"}
                    >
                      {data?.twoFA ? "Disable 2FA" : "Enable 2FA"}
                    </button>
                  </div>
                </div>
              </div>
              <button className="saveUpdates" onClick={saveUpdatewBtn2}>
                Save Updates
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Settings;
