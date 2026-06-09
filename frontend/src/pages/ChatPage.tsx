import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Group,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";

import AppLayout from "@/components/AppLayout";
import { apiFetch } from "@/lib/api";
import type { ChatMessage, ChatMode } from "@/features/chat/types/chat.type";
import { initialMessages } from "@/features/chat/mocks/chat.mock";
import { sendChatMessage } from "@/features/chat/api/chatApi";
import { createMessageId } from "@/features/chat/utils/createMessageId";
import { getCurrentTime } from "@/features/chat/utils/formatChatTime";
import MessageBubble from "@/features/chat/components/MessageBubble";
import ChatHeader from "@/features/chat/components/ChatHeader";
import TypingIndicator from "@/features/chat/components/TypingIndicator";
import ChatInput from "@/features/chat/components/ChatInput";

const CHAT_STORAGE_KEY = "onai_chat_messages";
const CHAT_MODE_STORAGE_KEY = "onai_chat_mode";
const CHAT_POLICY_CATEGORY_STORAGE_KEY = "onai_chat_policy_category";
const CHAT_MODE_START_INDEX_STORAGE_KEY = "onai_chat_mode_start_index";

const MODE_OPTIONS: {
  mode: ChatMode;
  label: string;
  icon: string;
  color: string;
}[] = [
  { mode: "policy", label: "복지정책", icon: "📋", color: "#4A90E2" },
  { mode: "parenting", label: "육아방법", icon: "👶", color: "#5CB85C" },
  { mode: "first_aid", label: "응급처치", icon: "🚑", color: "#E84D5C" },
  { mode: "counseling", label: "상담", icon: "💬", color: "#9B59B6" },
];

const POLICY_CATEGORY_OPTIONS: {
  value: string;
  label: string;
  icon: string;
}[] = [
  { value: "임신출산", label: "임신출산", icon: "🤰" },
  { value: "양육돌봄", label: "양육돌봄", icon: "👶" },
  { value: "시설주거", label: "시설주거", icon: "🏠" },
  { value: "교육취업", label: "교육취업", icon: "💼" },
  { value: "금융법률", label: "금융법률", icon: "⚖️" },
  { value: "생활편의", label: "생활편의", icon: "🎫" },
];

interface UserProfile {
  parents_name?: string;
  region?: string;
  parents_mbti?: string | null;
  children?: { child_birth: string; child_gender: string }[];
  interests?: { interest_name: string }[];
}

function calcAge(birthStr: string): number {
  const today = new Date();
  const birth = new Date(birthStr);

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

function buildUserContext(profile: UserProfile, mode: string): string {
  const lines: string[] = [];

  if (profile.parents_name) {
    lines.push(`사용자 이름: ${profile.parents_name}`);
  }

  if (
    (mode === "policy" || mode === "first_aid" || mode === "") &&
    profile.region
  ) {
    lines.push(`거주 지역: ${profile.region}`);
  }

  if (
    ["policy", "parenting", "first_aid", ""].includes(mode) &&
    profile.children?.length
  ) {
    const childDesc = profile.children
      .map(
        (child) => `만 ${calcAge(child.child_birth)}세 ${child.child_gender}`,
      )
      .join(", ");

    lines.push(`자녀: ${childDesc}`);
  }

  if (mode === "counseling") {
    if (profile.parents_mbti) {
      lines.push(`MBTI: ${profile.parents_mbti}`);
    }

    if (profile.interests?.length) {
      lines.push(
        `관심사: ${profile.interests
          .map((interest) => interest.interest_name)
          .join(", ")}`,
      );
    }
  }

  return lines.join(" / ");
}

function getSavedMessages(): ChatMessage[] {
  const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);

  if (!savedMessages) {
    return initialMessages;
  }

  try {
    const parsedMessages = JSON.parse(savedMessages) as ChatMessage[];

    if (!Array.isArray(parsedMessages) || parsedMessages.length === 0) {
      return initialMessages;
    }

    return parsedMessages;
  } catch (error) {
    console.error("저장된 챗봇 대화를 불러오지 못했습니다.", error);
    localStorage.removeItem(CHAT_STORAGE_KEY);

    return initialMessages;
  }
}

function getSavedMode(): ChatMode | null {
  const savedMode = localStorage.getItem(CHAT_MODE_STORAGE_KEY);

  if (
    savedMode === "policy" ||
    savedMode === "parenting" ||
    savedMode === "first_aid" ||
    savedMode === "counseling"
  ) {
    return savedMode;
  }

  return null;
}

function getSavedPolicyCategory(): string | null {
  return localStorage.getItem(CHAT_POLICY_CATEGORY_STORAGE_KEY);
}

function getSavedModeStartIndex(): number {
  const savedModeStartIndex = localStorage.getItem(
    CHAT_MODE_START_INDEX_STORAGE_KEY,
  );

  if (!savedModeStartIndex) {
    return 0;
  }

  const parsedIndex = Number(savedModeStartIndex);

  if (Number.isNaN(parsedIndex) || parsedIndex < 0) {
    return 0;
  }

  return parsedIndex;
}

function clearSavedChatState() {
  localStorage.removeItem(CHAT_STORAGE_KEY);
  localStorage.removeItem(CHAT_MODE_STORAGE_KEY);
  localStorage.removeItem(CHAT_POLICY_CATEGORY_STORAGE_KEY);
  localStorage.removeItem(CHAT_MODE_START_INDEX_STORAGE_KEY);
}

const ChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    getSavedMessages(),
  );
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<ChatMode | null>(() => getSavedMode());
  const [policyCategory, setPolicyCategory] = useState<string | null>(() =>
    getSavedPolicyCategory(),
  );
  const [modeStartIndex, setModeStartIndex] = useState(() =>
    getSavedModeStartIndex(),
  );
  const [userProfile, setUserProfile] = useState<UserProfile>({});

  const viewportRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (mode) {
      localStorage.setItem(CHAT_MODE_STORAGE_KEY, mode);
    } else {
      localStorage.removeItem(CHAT_MODE_STORAGE_KEY);
    }
  }, [mode]);

  useEffect(() => {
    if (policyCategory) {
      localStorage.setItem(CHAT_POLICY_CATEGORY_STORAGE_KEY, policyCategory);
    } else {
      localStorage.removeItem(CHAT_POLICY_CATEGORY_STORAGE_KEY);
    }
  }, [policyCategory]);

  useEffect(() => {
    localStorage.setItem(
      CHAT_MODE_START_INDEX_STORAGE_KEY,
      String(modeStartIndex),
    );
  }, [modeStartIndex]);

  useEffect(() => {
    let isMounted = true;

    const loadUserProfile = async () => {
      try {
        const data = await apiFetch<UserProfile>("/mypage/me");

        if (!isMounted) return;

        setUserProfile(data);
      } catch (error) {
        console.error("마이페이지 정보를 불러오지 못했습니다.", error);
      }
    };

    void loadUserProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const scrollToBottom = () => {
    const viewport = viewportRef.current;

    if (!viewport) return;

    viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
  };

  const scrollToLastMessage = () => {
    lastMessageRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const resetChat = () => {
    clearSavedChatState();
    setMessages(initialMessages);
    setMode(null);
    setPolicyCategory(null);
    setModeStartIndex(0);
    setInputValue("");
    setIsTyping(false);
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

    sendChatMessage(
      trimmedText,
      messages.slice(modeStartIndex),
      mode ?? "",
      mode === "policy" ? (policyCategory ?? "") : "",
      buildUserContext(userProfile, mode ?? ""),
    )
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
      .catch((error) => {
        console.error("챗봇 응답 오류:", error);

        const errorMessage: ChatMessage = {
          id: createMessageId(),
          role: "ai",
          content:
            "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
          time: getCurrentTime(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      })
      .finally(() => {
        setIsTyping(false);
      });
  };

  const handleSubmit = (overrideValue?: string) => {
    sendMessage(overrideValue ?? inputValue);
  };

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    if (lastMessage?.role === "ai") {
      scrollToLastMessage();
    } else {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  useEffect(() => {
    scrollToBottom();
  }, [mode, policyCategory]);

  const selectedPolicyCategoryLabel =
    POLICY_CATEGORY_OPTIONS.find((option) => option.value === policyCategory)
      ?.label ?? "전체";

  return (
    <AppLayout>
      <Box
        h="calc(100dvh - 150px)"
        bg="#FFF8F8"
        style={{
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <ChatHeader />

        <ScrollArea
          viewportRef={viewportRef}
          style={{ flex: 1 }}
          styles={{
            viewport: {
              padding: "14px 14px 8px",
              background:
                "radial-gradient(ellipse at top right, rgba(255,174,179,.12) 0%, transparent 55%), radial-gradient(ellipse at bottom left, rgba(255,214,218,.15) 0%, transparent 55%), #FFF8F8",
            },
            scrollbar: { display: "none" },
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

            {messages.map((message, index) => (
              <div
                key={message.id}
                ref={index === messages.length - 1 ? lastMessageRef : null}
              >
                <MessageBubble message={message} />
              </div>
            ))}

            {!mode && !isTyping && (
              <Box pl={44}>
                <Text size="xs" c="#C4909A" mb={8}>
                  어떤 도움이 필요하신가요?
                </Text>

                <Group gap={8} wrap="wrap">
                  {MODE_OPTIONS.map((option) => (
                    <Button
                      key={option.mode}
                      size="xs"
                      variant="outline"
                      radius="xl"
                      onClick={() => {
                        setMode(option.mode);
                        setPolicyCategory(null);
                        setModeStartIndex(messages.length);
                      }}
                      styles={{
                        root: {
                          borderColor: option.color,
                          color: option.color,
                        },
                      }}
                    >
                      {option.icon} {option.label}
                    </Button>
                  ))}
                </Group>
              </Box>
            )}

            {mode === "policy" && policyCategory === null && !isTyping && (
              <Box pl={44}>
                <Text size="xs" c="#C4909A" mb={8}>
                  📋 어떤 분야의 정책이 궁금하신가요?
                </Text>

                <Group gap={8} wrap="wrap">
                  {POLICY_CATEGORY_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      size="xs"
                      variant="outline"
                      radius="xl"
                      onClick={() => setPolicyCategory(option.value)}
                      styles={{
                        root: {
                          borderColor: "#4A90E2",
                          color: "#4A90E2",
                        },
                      }}
                    >
                      {option.icon} {option.label}
                    </Button>
                  ))}
                </Group>
              </Box>
            )}

            {mode &&
              (mode !== "policy" || policyCategory !== null) &&
              !isTyping && (
                <Box pl={44}>
                  <Group gap={6} align="center">
                    <Text size="xs" c="#C4909A">
                      {
                        MODE_OPTIONS.find((option) => option.mode === mode)
                          ?.icon
                      }{" "}
                      <strong>
                        {
                          MODE_OPTIONS.find((option) => option.mode === mode)
                            ?.label
                        }
                      </strong>
                      {mode === "policy" && policyCategory !== null && (
                        <>
                          {" "}
                          · <strong>{selectedPolicyCategoryLabel}</strong>
                        </>
                      )}{" "}
                      모드로 답변드릴게요
                    </Text>

                    <Button
                      size="xs"
                      variant="subtle"
                      color="gray"
                      radius="xl"
                      p={4}
                      h="auto"
                      onClick={resetChat}
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
          isLoading={isTyping}
          placeholder={
            !mode ? "모드를 선택하거나 바로 질문하세요..." : undefined
          }
        />
      </Box>
    </AppLayout>
  );
};

export default ChatPage;
