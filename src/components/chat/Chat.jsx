import { useEffect, useState, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import "./chat.css";
import { useUserStore } from "../../lib/userStore";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState();
  const [isEmojiOpened, setIsEmojiOpened] = useState(false);
  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  const handleMessageInput = (e) => {
    setMessage(e.target.value);
  };

  const handleEmojiClick = (e) => {
    setMessage((prev) => prev + e.emoji);
  };

  const handleSend = async (e) => {
    if (message === "") return;

    try {
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text: message,
          createdAt: new Date(),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          userChatsData.chats[chatIndex].lastMessage = message;
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (err) {
      console.log(err);
    } finally {
      setMessage("");
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="conversation">
      <div className="receiver">
        <img src={user?.avatar || "./avatar.png"} alt="receiver avatar" />
        <p className="username">{user?.username || "User not found"}</p>
      </div>
      <div className="conversation-details">
        {chat?.messages?.map((message) => (
          <div
            className={
              message?.senderId != user?.id ? "message own" : "message"
            }
            key={message?.createdAt}
          >
            {message?.senderId == user.id && (
              <img src={user?.avatar || "./avatar.png"} alt="receiver avatar" />
            )}
            <div className="message-content">
              <p className="texts">{message?.text}</p>
              {/* <span>{message}</span> */}
            </div>
          </div>
        ))}

        <div ref={endRef}></div>
      </div>
      <div className="message-operator">
        <input
          type="text"
          placeholder="Type your message"
          value={message}
          onChange={(e) => handleMessageInput(e)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt="add emoji icon"
            onClick={() => {
              setIsEmojiOpened((prev) => !prev);
            }}
          />
          <div className="picker">
            <EmojiPicker
              open={isEmojiOpened}
              onEmojiClick={(e) => handleEmojiClick(e)}
            />
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
