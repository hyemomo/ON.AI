import { useEffect, useRef, useState } from "react";
import {
  Box,
  Card,
  Container,
  Divider,
  ScrollArea,
  Stack,
} from "@mantine/core";
import AppLayout from "@/components/AppLayout";
import type { ChatMessage } from "@/features/chat/types/chat.type";
import { aiReplies, initialMessages } from "@/features/chat/mocks/chat.mock";
import { createMessageId } from "@/features/chat/utils/createMessageId";
import { getCurrentTime } from "@/features/chat/utils/formatChatTime";
import MessageBubble from "@/features/chat/components/MessageBubble";
import ChatHeader from "@/features/chat/components/ChatHeader";
import TypingIndicator from "@/features/chat/components/TypingIndicator";
import ChatInput from "@/features/chat/components/ChatInput";
import { border, surface } from "@/tokens/color";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: "smooth",
    });
  };

  const sendMessage = (messageText: string) => {
    const trimmedText = messageText.trim();
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

    window.setTimeout(() => {
      const randomReply =
        aiReplies[Math.floor(Math.random() * aiReplies.length)];

      const aiMessage: ChatMessage = {
        id: createMessageId(),
        role: "ai",
        content: randomReply,
        time: getCurrentTime(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1200);
  };

  const handleSubmit = () => {
    sendMessage(inputValue);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <AppLayout>
      <Box
        style={{
          height: "calc(100vh - 134px)",
          background: surface.bg,
          overflow: "hidden",
        }}
      >
        <Container
          size="sm"
          h="100%"
          py="md"
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Card
            p={0}
            radius="xl"
            withBorder
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              background: "#FFF8F8",
              borderColor: border.default,
            }}
          >
            <Box style={{ flexShrink: 0 }}>
              <ChatHeader />
            </Box>

            <ScrollArea
              viewportRef={viewportRef}
              style={{
                flex: 1,
                minHeight: 0,
              }}
              styles={{
                root: {
                  flex: 1,
                  minHeight: 0,
                },
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

                {isTyping && <TypingIndicator />}
              </Stack>
            </ScrollArea>

            <Box
              style={{
                flexShrink: 0,
                borderTop: `1px solid ${border.default}`,
                background: "rgba(255,255,255,0.95)",
              }}
            >
              <ChatInput
                inputValue={inputValue}
                setInputValue={setInputValue}
                handleSubmit={handleSubmit}
              />
            </Box>
          </Card>
        </Container>
      </Box>
    </AppLayout>
  );
}
