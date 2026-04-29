import { useEffect, useRef, useState } from "react";
import { Box, Divider, ScrollArea, Stack } from "@mantine/core";

import type { ChatMessage } from "@/features/chat/types/chat.type";
import { aiReplies, initialMessages } from "@/features/chat/mocks/chat.mock";
import { createMessageId } from "@/features/chat/utils/createMessageId";
import { getCurrentTime } from "@/features/chat/utils/formatChatTime";
import MessageBubble from "@/features/chat/components/MessageBubble";
import ChatHeader from "@/features/chat/components/ChatHeader";
import TypingIndicator from "@/features/chat/components/TypingIndicator";
import ChatInput from "@/features/chat/components/ChatInput";

const ChatPage = () => {
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

    window.setTimeout(() => {
      const randomReply =
        aiReplies[Math.floor(Math.random() * aiReplies.length)];

      const aiMessage: ChatMessage = {
        id: createMessageId() + 1,
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
