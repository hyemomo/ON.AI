import ChatAvatar from "@/features/chat/components/chatAvatar";
import type { ChatMessage } from "@/features/chat/types/chat.type";
import { Group, Paper, Stack, Text } from "@mantine/core";

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === "user";

  return (
    <Group
      justify={isUser ? "flex-end" : "flex-start"}
      align="flex-end"
      gap={8}
    >
      {!isUser && <ChatAvatar />}

      <Stack gap={4} align={isUser ? "flex-end" : "flex-start"} maw="78%">
        <Paper
          px={14}
          py={10}
          radius="lg"
          withBorder={!isUser}
          style={{
            whiteSpace: "pre-line",
            wordBreak: "keep-all",
            lineHeight: 1.63,
            fontSize: 14.5,
            color: isUser ? "#fff" : "#2D1A1E",
            background: isUser
              ? "linear-gradient(135deg, #FF8E9B 0%, #E84D5C 100%)"
              : "#fff",
            borderColor: "#FFE4E7",
            borderBottomRightRadius: isUser ? 5 : 18,
            borderBottomLeftRadius: isUser ? 18 : 5,
            boxShadow: isUser
              ? "0 4px 14px rgba(255, 107, 122, 0.34)"
              : "0 1px 6px rgba(255, 107, 122, 0.07)",
          }}
        >
          {message.content}
        </Paper>

        <Text size="xs" c="#C4909A" px={4}>
          {message.time}
        </Text>
      </Stack>
    </Group>
  );
};
export default MessageBubble;
