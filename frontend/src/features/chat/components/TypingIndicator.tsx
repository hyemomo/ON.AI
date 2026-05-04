import ChatAvatar from "@/features/chat/components/chatAvatar";
import { Box, Group, Paper } from "@mantine/core";

const TypingIndicator = () => {
  return (
    <Group align="flex-end" gap={8}>
      <ChatAvatar />

      <Paper
        px={16}
        py={13}
        radius="lg"
        withBorder
        style={{
          borderColor: "#FFE4E7",
          borderBottomLeftRadius: 5,
          boxShadow: "0 1px 6px rgba(255, 107, 122, 0.07)",
        }}
      >
        <Group gap={5}>
          {[0, 1, 2].map((dot) => (
            <Box
              key={dot}
              w={7}
              h={7}
              style={{
                borderRadius: "50%",
                backgroundColor:
                  dot === 0 ? "#FFAAB3" : dot === 1 ? "#FF8E9B" : "#FF6B7A",
              }}
            />
          ))}
        </Group>
      </Paper>
    </Group>
  );
};
export default TypingIndicator;
