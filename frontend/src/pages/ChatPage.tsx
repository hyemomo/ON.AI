import { useEffect, useRef, useState } from "react";
import { Box, Button, Divider, Group, ScrollArea, Stack, Text } from "@mantine/core";

import type { ChatMessage, ChatMode } from "@/features/chat/types/chat.type";
import { initialMessages } from "@/features/chat/mocks/chat.mock";
import { sendChatMessage } from "@/features/chat/api/chatApi";
import { createMessageId } from "@/features/chat/utils/createMessageId";
import { getCurrentTime } from "@/features/chat/utils/formatChatTime";
import MessageBubble from "@/features/chat/components/MessageBubble";
import ChatHeader from "@/features/chat/components/ChatHeader";
import TypingIndicator from "@/features/chat/components/TypingIndicator";
import ChatInput from "@/features/chat/components/ChatInput";

const MODE_OPTIONS: { mode: ChatMode; label: string; icon: string; color: string }[] = [
  { mode: "policy",     label: "복지정책",  icon: "📋", color: "#4A90E2" },
  { mode: "parenting",  label: "육아방법",  icon: "👶", color: "#5CB85C" },
  { mode: "first_aid",  label: "응급처치",  icon: "🚑", color: "#E84D5C" },
  { mode: "counseling", label: "상담",      icon: "💬", color: "#9B59B6" },
];

const ChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<ChatMode | null>(null);
  const [modeStartIndex, setModeStartIndex] = useState(0);

  const viewportRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: "smooth",
    });
  };

  const sendMessage = (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmedText,
      time: getCurrentTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    sendChatMessage(trimmedText, messages.slice(modeStartIndex), mode ?? "")
      .then(({ reply, category, is_fallback, sources }) => {
        const aiMessage: ChatMessage = {
          id: createMessageId(),
          role: "ai",
          content: reply,
          time: getCurrentTime(),
          category,
          is_fallback,
          sources,
        };
        setMessages((cur) => [...cur, aiMessage]);
      })
      .catch(() => {
        const errorMessage: ChatMessage = {
          id: createMessageId(),
          role: "ai",
          content: "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
          time: getCurrentTime(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      })
      .finally(() => {
        setIsTyping(false);
      });
  };

  const handleSubmit = () => {
    sendMessage(inputValue);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <Box
      h="100dvh"
      bg="#FFF8F8"
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <ChatHeader />
      {/* 채팅 영역 */}
      <ScrollArea
        viewportRef={viewportRef}
        style={{ flex: 1 }}
        styles={{
          viewport: {
            padding: "14px 14px 8px",
            background:
              "radial-gradient(ellipse at top right, rgba(255,174,179,.12) 0%, transparent 55%), radial-gradient(ellipse at bottom left, rgba(255,214,218,.15) 0%, transparent 55%), #FFF8F8",
          },
          scrollbar: {
            display: "none",
          },
        }}
      >
        <Stack gap={10}>
          <Divider
            label="오늘"
            labelPosition="center"
            styles={{
              label: {
                color: "#C4909A",
                backgroundColor: "rgba(255, 228, 231, 0.8)",
                border: "1px solid #FFE4E7",
                borderRadius: 999,
                padding: "3px 12px",
                fontSize: 11,
              },
            }}
          />

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* 카테고리 선택 버튼 — 아직 선택 전이고 타이핑 중이 아닐 때만 표시 */}
          {!mode && !isTyping && (
            <Box pl={44}>
              <Text size="xs" c="#C4909A" mb={8}>
                어떤 도움이 필요하신가요?
              </Text>
              <Group gap={8} wrap="wrap">
                {MODE_OPTIONS.map((opt) => (
                  <Button
                    key={opt.mode}
                    size="xs"
                    variant="outline"
                    radius="xl"
                    onClick={() => {
                      setMode(opt.mode);
                      setModeStartIndex(messages.length);
                    }}
                    styles={{
                      root: {
                        borderColor: opt.color,
                        color: opt.color,
                        "&:hover": { backgroundColor: `${opt.color}15` },
                      },
                    }}
                  >
                    {opt.icon} {opt.label}
                  </Button>
                ))}
              </Group>
            </Box>
          )}

          {/* 선택된 카테고리 표시 + 변경 버튼 */}
          {mode && !isTyping && (
            <Box pl={44}>
              <Group gap={6} align="center">
                <Text size="xs" c="#C4909A">
                  {MODE_OPTIONS.find((o) => o.mode === mode)?.icon}{" "}
                  <strong>{MODE_OPTIONS.find((o) => o.mode === mode)?.label}</strong> 모드로 답변드릴게요
                </Text>
                <Button
                  size="xs"
                  variant="subtle"
                  color="gray"
                  radius="xl"
                  p={4}
                  h="auto"
                  onClick={() => {
                    setMode(null);
                    setModeStartIndex(messages.length);
                  }}
                  style={{ fontSize: 11 }}
                >
                  새 대화
                </Button>
              </Group>
            </Box>
          )}

          {isTyping && <TypingIndicator />}
        </Stack>
      </ScrollArea>

      <ChatInput
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSubmit={handleSubmit}
      />
    </Box>
  );
};
export default ChatPage;
