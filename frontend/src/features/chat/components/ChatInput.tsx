import { ActionIcon, Box, Group, Textarea } from "@mantine/core";
import { IconArrowRight, IconMicrophone } from "@tabler/icons-react";

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSubmit: () => void;
}
const ChatInput = ({
  inputValue,
  setInputValue,
  handleSubmit,
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
          placeholder="메시지를 입력하세요..."
          autosize
          minRows={1}
          maxRows={4}
          style={{ flex: 1 }}
          rightSection={<IconMicrophone size={18} color="#C4909A" />}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSubmit();
            }
          }}
          styles={{
            input: {
              minHeight: 46,
              borderRadius: 26,
              border: "1.5px solid #FFE4E7",
              backgroundColor: "#FFF0F2",
              color: "#2D1A1E",
              fontSize: 14.5,
              lineHeight: 1.5,
              padding: "11px 42px 11px 14px",
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
          styles={{
            root: {
              flexShrink: 0,
              background: "linear-gradient(135deg, #FF8E9B 0%, #E84D5C 100%)",
              boxShadow: "0 4px 14px rgba(255, 107, 122, 0.42)",
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
