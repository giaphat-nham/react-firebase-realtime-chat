import { useEffect, useState } from "react";
import "./list.css";
import AddChatForm from "./add-chat-form/AddChatForm";
import { useUserStore } from "../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";

const List = () => {
  const [chats, setChats] = useState([]);
  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();
  const [isAddingChat, setIsAddingChat] = useState(false);
  const [searchKey, setSearchKey] = useState("");

  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const items = res.data().chats;

        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data();

          return { ...item, user };
        });

        const chatData = await Promise.all(promises);

        setChats(
          chatData.sort((a, b) => {
            b.updatedAt - a.updatedAt;
          })
        );
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    userChats[chatIndex].isSeen = true;
    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (err) {
      console.log(err);
    }
  };

  const filteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(searchKey.toLowerCase())
  );

  return (
    <div className="list">
      <div className="user">
        <img src={currentUser.avatar || "./avatar.png"} alt="user avatar" />
        <p className="username">{currentUser.username}</p>
      </div>
      <div className="search">
        <div className="search-bar">
          <img src="./search.png" alt="search icon" />
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => {
              setSearchKey(e.target.value);
            }}
          />
        </div>
        <img
          className="btn-add-chat"
          src={isAddingChat ? "./minus.png" : "./plus.png"}
          alt="add chat button"
          onClick={() => {
            setIsAddingChat((prev) => !prev);
          }}
        />
      </div>
      <div className="chats">
        {filteredChats.map((chat) => (
          <div
            className={chat?.isSeen ? "chat" : "chat unseen"}
            key={chat.chatId}
            onClick={() => handleSelect(chat)}
          >
            <img src={chat.user.avatar || "./avatar.png"} alt="user avatar" />
            <div className="chat-info">
              <p className="username">
                {chat.user.username || "User not found"}
              </p>
              <p className="message">{chat.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>
      {isAddingChat ? <AddChatForm /> : ""}
    </div>
  );
};

export default List;
