import { ActionIcon, Box, Group, Textarea } from "@mantine/core";
import { IconArrowRight, IconMicrophone } from "@tabler/icons-react";

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSubmit: () => void;
  isLoading?: boolean;
}

const ChatInput = ({
  inputValue,
  setInputValue,
  handleSubmit,
  isLoading = false,
}: ChatInputProps) => {
  return (
    <Box
      bg="#fff"
      px={14}
      pt={10}
      pb={12}
      style={{
        borderTop: "1.5px solid #FFE4E7",
        flexShrink: 0,
      }}
    >
      <Group align="flex-end" gap={8} wrap="nowrap">
        <Textarea
          value={inputValue}
          onChange={(event) => setInputValue(event.currentTarget.value)}
          placeholder={isLoading ? "답변을 기다리는 중..." : "메시지를 입력하세요..."}
          autosize
          minRows={1}
          maxRows={4}
          disabled={isLoading}
          style={{ flex: 1 }}
          rightSection={<IconMicrophone size={18} color={isLoading ? "#DDB8C0" : "#C4909A"} />}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (!isLoading) handleSubmit();
            }
          }}
          styles={{
            input: {
              minHeight: 46,
              borderRadius: 26,
              border: "1.5px solid #FFE4E7",
              backgroundColor: isLoading ? "#FFF8F9" : "#FFF0F2",
              color: "#2D1A1E",
              fontSize: 14.5,
              lineHeight: 1.5,
              padding: "11px 42px 11px 14px",
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? "not-allowed" : "text",
            },
          }}
        />

        <ActionIcon
          size={46}
          radius="xl"
          variant="filled"
          color="pink"
          aria-label="메시지 전송"
          onClick={handleSubmit}
          disabled={isLoading}
          styles={{
            root: {
              flexShrink: 0,
              background: isLoading
                ? "#F0C0C8"
                : "linear-gradient(135deg, #FF8E9B 0%, #E84D5C 100%)",
              boxShadow: isLoading
                ? "none"
                : "0 4px 14px rgba(255, 107, 122, 0.42)",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
            },
          }}
        >
          <IconArrowRight size={21} color="white" />
        </ActionIcon>
      </Group>
    </Box>
  );
};

export default ChatInput;
