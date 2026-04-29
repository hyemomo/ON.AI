import { Avatar } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";

const ChatAvatar = () => {
  return (
    <Avatar
      size={32}
      radius="xl"
      styles={{
        root: {
          background: "linear-gradient(135deg, #FF8E9B, #E84D5C)",
          boxShadow: "0 3px 10px rgba(255, 107, 122, 0.28)",
        },
      }}
    >
      <IconUser size={17} color="white" />
    </Avatar>
  );
};
export default ChatAvatar;
