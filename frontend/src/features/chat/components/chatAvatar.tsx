import { Avatar } from "@mantine/core";
import onaiChatAvatar from "@/assets/images/onai-chat-avatar.png";
import { border } from "@/tokens/color";

type ChatAvatarProps = {
  size?: number;
};

const ChatAvatar = ({ size = 34 }: ChatAvatarProps) => {
  return (
    <Avatar
      src={onaiChatAvatar}
      alt="ON.AI 챗봇 캐릭터"
      size={size}
      radius="xl"
      styles={{
        root: {
          background: "#FFFFFF",
          border: `1px solid ${border.default}`,
          boxShadow: "0 3px 10px rgba(255, 107, 122, 0.12)",
          overflow: "hidden",
        },
        image: {
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          transform: "translateY(3px) scale(1.1)",
          transformOrigin: "center center",
        },
      }}
    />
  );
};

export default ChatAvatar;
