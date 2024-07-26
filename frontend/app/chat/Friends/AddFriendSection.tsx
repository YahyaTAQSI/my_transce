"use client";

import { useEffect, useRef, useState } from "react";

import { TiUserAdd } from "react-icons/ti";
import { useRecoilValue } from "recoil";
import { userToken } from "@/app/Atoms/userToken";
import AddFriend from "./AddFriend";
import { loggedUser } from "@/app/Atoms/logged";

interface AddFriendInterface {
  className: string;
}
import { usePathname } from "next/navigation";
import { useSocket } from "@/app/SubChildrens";
const AddFriendSection = () => {
  const pathname = usePathname();
  const [addFriend, setAddFriend] = useState(false);

  const addFriendsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addFriendsRef.current &&
        !addFriendsRef.current.contains(event.target as Node)
      )
        setAddFriend(false);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [addFriendsRef]);

  // /profile

  const userTok = useRecoilValue(userToken);
  const userL = useRecoilValue(loggedUser);

  const [input, setInput] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const filteredUsers = allUsers.filter((user: any) =>
    user?.username.toLowerCase().includes(input.toLowerCase())
  );
  const addFriendClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const getAllusers = async () => {
    if (!addFriend) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/friends/allusers/${userL}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userTok}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      setAllUsers(data);
    } catch (error) {
      console.log("add friend error addFriendSection.tsx");
    }
  };
  useEffect(() => {
    getAllusers();
  }, [addFriend]);

  const { socket } = useSocket();
  useEffect(() => {
    if (!socket) return;
    const updateFriends = (friend: any) => {
      getAllusers();
    };

    socket.on("update_All_Users", updateFriends);
    return () => {
      socket.off("update_All_Users");
    };
  });

  return (
    <div
      ref={addFriendsRef}
      onClick={() => setAddFriend((prev) => !prev)}
      className={`add_friend ${addFriend && `show_the_big_div`} `}
    >
      {addFriend ? (
        <div
          onClick={addFriendClick}
          className={`add_friend_container ${pathname === "/profile" && "big_one"
            }`}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            placeholder="Add friend"
          />

          <div className="searchedFriends">
            {filteredUsers?.map((user: any) => (
              <AddFriend key={user.uid} user={user} />
            ))}
          </div>
        </div>
      ) : (
        <TiUserAdd />
      )}
    </div>
  );
};
export default AddFriendSection;
