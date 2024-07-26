"use client";
import React, { useState, useEffect } from "react";
import "./store.css";
import "../globals.css";
import Image from "next/image";
import { TbShoppingBag } from "react-icons/tb";
import { FaRegSmileBeam } from "react-icons/fa";
import { FaBagShopping } from "react-icons/fa6";
import { userToken } from "@/app/Atoms/userToken";
import { useRecoilState, useRecoilValue } from "recoil";
import { loggedUser } from "../Atoms/logged";

interface itemsInterface {
  description: string;
  id: number;
  img: string;
  type: string;
  name: string;
  power: string;
  price: number;
  owned: boolean;
  choosed: boolean;
}

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
  wallet: number;
}

const Store = () => {
  const [loading, setLoading] = useState(true);
  const userTok = useRecoilValue(userToken);
  const [popUpCannotBuy, setPopUpCannotBuy] = useState(false);
  const [choosedArticle, setChoosedArticle] = useState<itemsInterface>();
  const [prevchoosedArticle, setPrevChoosedArticle] =
    useState<itemsInterface>();
  const [items, setItems] = useState<itemsInterface[]>();
  const [selectedCategory, setselectedCategory] = useState("all");
  const [userData, setUserData] = useState<dataInterface>();
  const userId = useRecoilValue(loggedUser);
  const [playerPoints, setPlayerPoints] = useState<number>(0);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    const fetchedData = async () => {
      console.log("test");
      try {
        const responseUser = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${userTok}`,
              "Content-Type": "application/json",
            },
          }
        );
        const dataofUser = await responseUser.json();
        setPlayerPoints(dataofUser.wallet);
        console.log("data of user : ", dataofUser);
        setUserData(dataofUser);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/useritems?userId=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${userTok}`,
              "Content-Type": "application/json",
            },
          }
        );
        let data: itemsInterface[] = await response.json();
        console.log("DATA:", data);
        data = data.filter((e) => e.type == "paddle" || e.type == "avatar");
        setChoosedArticle(data[0]);

        let oldestChoosedArticle: any = data.find((e) => e.choosed == true);
        setPrevChoosedArticle(oldestChoosedArticle?.id);
        console.log("_______>>>", data);
        setItems(data);
      } catch (err) {
        console.error(">>>", err);
      }
    };

    fetchedData();
  }, []);

  const handleBuyArticle = async (
    id: number | undefined,
    price: number | undefined
  ) => {
    console.log(
      ">>>>playerPoints:",
      playerPoints,
      "   >>>>>choosedArticle?.price:",
      choosedArticle?.price
    );
    if (choosedArticle?.price && playerPoints < choosedArticle?.price) {
      setPopUpCannotBuy(!popUpCannotBuy);
      setTimeout(() => {
        setPopUpCannotBuy(false);
      }, 5000);
    } else {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/useritems`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userTok}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          itemId: id,
          choosed: false,
        }),
      })
        .then((res) => {
          console.log(">>>>>>>>>>>>>>>baaa3>>>>>>>>>>", res);
          setUserData((prevData: any) => ({
            ...prevData,
            wallet: prevData.wallet - (price ?? 0),
          }));
          const updatedItems = items?.map((item) => {
            if (item.id === id) {
              return {
                ...item,
                owned: true,
              };
            }
            return item;
          });
          console.log("?????????? => updatedItems =>", updatedItems);
          setItems(updatedItems);
          const updatedchoosedArticle: any = {
            ...choosedArticle,
            owned: true,
          };
          setChoosedArticle(updatedchoosedArticle);
          setPlayerPoints(playerPoints - (price ?? 0));
        })
        .catch((errorResponse) => {
          throw new Error(
            `Failed to POST data. Error: ${errorResponse.message}`
          );
        });
    }
  };

  const handleChooseArticle = async (id: number) => {
    console.log("choosedArticle?.name => ", prevchoosedArticle);
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/useritems`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userTok}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        itemId: id,
        // choosed: true,
        // oldId: prevchoosedArticle?.id || "undefined",
        // oldType: prevchoosedArticle?.type || "undefined",
        type: choosedArticle?.type, //++
        // avatar: choosedArticle?.img, //++
        img: choosedArticle?.img, //++
      }),
    })
      .then(() => {
        console.log("?????????? => ITEMS =>", items);

        const updatedItems = items?.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              choosed: true,
            };
          }
          return { ...item, choosed: false };
        });
        console.log("?????????? => updatedItems =>", updatedItems);
        setItems(updatedItems);
        const updatedchoosedArticle: any = {
          ...choosedArticle,
          choosed: true,
        };

        setChoosedArticle(updatedchoosedArticle);
      })
      .catch((errorResponse) => {
        throw new Error(`Failed to POST data. Error: ${errorResponse.message}`);
      });
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
        <div className="all">
          {popUpCannotBuy && (
            <span className="popUpCannotBuy">
              Your wallet balance is insufficient <br />
              to buy this article <br />
              Try winning more matches to increase <br />
              your wallet balance <br /> <FaRegSmileBeam className="smily" />{" "}
            </span>
          )}
          <h2>
            Store <FaBagShopping className="shop-icon" />
          </h2>
          <div className="storeContainer">
            <div className="choosedArticle">
              <Image
                src={
                  choosedArticle
                    ? choosedArticle.type === "avatar"
                      ? `${choosedArticle.img}`
                      : `${choosedArticle.img}`
                    : ""
                }
                width={200}
                height={200}
                alt=""
              />
              <p className="name">{choosedArticle?.name}</p>
              <p className="description">{choosedArticle?.description}</p>
              <div className="price">
                {choosedArticle?.owned ? (
                  <>
                    <p>{choosedArticle?.price} $</p>
                    <p>
                      {choosedArticle?.choosed ? (
                        "choosed"
                      ) : (
                        <button
                          onClick={() => handleChooseArticle(choosedArticle.id)}
                        >
                          choose
                        </button>
                      )}
                    </p>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      handleBuyArticle(
                        choosedArticle?.id,
                        choosedArticle?.price
                      );
                    }}
                  >
                    Buy Now {choosedArticle?.price}$
                  </button>
                )}
              </div>
            </div>
            <div className="allArticles">
              <div className="select">
                <div>
                  <label htmlFor="articlesType">Choose Article </label>
                  <select
                    title=""
                    name="articlesType"
                    id="articlesType"
                    value={selectedCategory}
                    onChange={(e) => setselectedCategory(e.target.value)}
                  >
                    <option value="all">all</option>
                    <option value="avatars">avatars</option>
                    <option value="paddles">paddles</option>
                  </select>
                </div>
                <p className="player-points"> {userData?.wallet} $</p>
              </div>
              <div className="articles">
                {items?.map((article) => {
                  if (
                    (selectedCategory == "avatars" ||
                      selectedCategory == "all") &&
                    article.type == "avatar"
                  ) {
                    return (
                      <div
                        key={article.id}
                        onClick={() => setChoosedArticle(article)}
                      >
                        <Image
                          className="img"
                          src={`${article.img && article.img}`}
                          alt="avatar"
                          width={200}
                          height={200}
                        />
                        {article.owned ? (
                          ""
                        ) : (
                          <span className="notOwnedPrice">
                            {article.price} $
                          </span>
                        )}
                      </div>
                    );
                  } else if (
                    article.type == "paddle" &&
                    (selectedCategory == "paddles" || selectedCategory == "all")
                  ) {
                    return (
                      <div
                        key={article.id}
                        onClick={() => setChoosedArticle(article)}
                      >
                        <Image
                          className="img"
                          src={`${article.img}`}
                          alt="paddle"
                          width={200}
                          height={200}
                        />
                        {article.owned ? (
                          ""
                        ) : (
                          <span className="notOwnedPrice">
                            {article.price} $
                          </span>
                        )}
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Store;
