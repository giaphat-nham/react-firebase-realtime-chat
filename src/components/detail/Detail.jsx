import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { auth, db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import "./detail.css";

const Detail = () => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } =
    useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user) return;
    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="detail">
      <div className="receiver-info">
        <img src={user?.avatar || "./avatar.png"} alt="receiver avatar" />
        <p className="username">{user?.username || "User not found"}</p>
      </div>
      <div className="buttons-group">
        <button className="danger" onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "You're blocked!"
            : isReceiverBlocked
            ? "User blocked!"
            : "Block User"}
        </button>
        <button
          onClick={() => {
            auth.signOut();
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Detail;
