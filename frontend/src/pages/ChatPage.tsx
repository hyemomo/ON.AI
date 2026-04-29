
// src/pages/ChatPage.tsx
import { useEffect, useRef, useState } from 'react';
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Indicator,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';
import {
  IconArrowRight,
  IconChevronLeft,
  IconDotsVertical,
  IconMicrophone,
  IconUser,
} from '@tabler/icons-react';

type ChatMessage = {
  id: string;
  role: "ai" | "user";
  content: string;
  time: string;
};

const quickQuestions = ['🌡️ 열이 나요', '🥣 이유식', '😴 수면 루틴', '📏 성장 발달'];

const extraActions = ['📷 사진', '📋 증상 체크', '📚 가이드', '📅 성장 기록'];
const initialMessages: ChatMessage[] = [
  {
    id: "initial-ai-1",
    role: "ai",
    content: "안녕하세요! 저는 ON.AI 육아 도우미예요 🌸",
    time: "오전 9:21",
  },
  {
    id: "initial-ai-2",
    role: "ai",
    content: "오늘 어떤 것이 궁금하신가요?",
    time: "오전 9:21",
  },
  {
    id: "initial-user-1",
    role: "user",
    content: "아이가 밤새 38.5도 열이 나요. 어떻게 해야 할까요?",
    time: "오전 9:22",
  },
];
const aiReplies = [
  '네, 이 경우엔 조금 더 지켜보시는 게 좋을 것 같아요 😊',
  '14개월 기준으로 안내드릴게요. 수분 섭취와 아이 컨디션을 함께 확인해주세요.',
  '좋은 질문이에요! 아이의 나이, 체온, 마지막 약 복용 시간을 같이 보면 더 정확해요 🌸',
  '수분 보충이 중요해요. 물이나 전해질 음료를 조금씩 자주 주세요 🥤',
  '열이 계속 오르거나 아이가 처지는 모습이 있으면 소아과 방문을 추천드려요.',
];
const createMessageId = () => crypto.randomUUID();
function getCurrentTime() {
  const now = new Date();
  const hour = now.getHours();
  const minute = String(now.getMinutes()).padStart(2, '0');
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour > 12 ? hour - 12 : hour || 12;

  return `${period} ${displayHour}:${minute}`;
}

function ChatAvatar() {
  return (
    <Avatar
      size={32}
      radius="xl"
      styles={{
        root: {
          background: 'linear-gradient(135deg, #FF8E9B, #E84D5C)',
          boxShadow: '0 3px 10px rgba(255, 107, 122, 0.28)',
        },
      }}
    >
      <IconUser size={17} color="white" />
    </Avatar>
  );
}

function TypingIndicator() {
  return (
    <Group align="flex-end" gap={8}>
      <ChatAvatar />

      <Paper
        px={16}
        py={13}
        radius="lg"
        withBorder
        style={{
          borderColor: '#FFE4E7',
          borderBottomLeftRadius: 5,
          boxShadow: '0 1px 6px rgba(255, 107, 122, 0.07)',
        }}
      >
        <Group gap={5}>
          {[0, 1, 2].map((dot) => (
            <Box
              key={dot}
              w={7}
              h={7}
              style={{
                borderRadius: '50%',
                backgroundColor: dot === 0 ? '#FFAAB3' : dot === 1 ? '#FF8E9B' : '#FF6B7A',
              }}
            />
          ))}
        </Group>
      </Paper>
    </Group>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <Group justify={isUser ? 'flex-end' : 'flex-start'} align="flex-end" gap={8}>
      {!isUser && <ChatAvatar />}

      <Stack gap={4} align={isUser ? 'flex-end' : 'flex-start'} maw="78%">
        <Paper
          px={14}
          py={10}
          radius="lg"
          withBorder={!isUser}
          style={{
            whiteSpace: 'pre-line',
            wordBreak: 'keep-all',
            lineHeight: 1.63,
            fontSize: 14.5,
            color: isUser ? '#fff' : '#2D1A1E',
            background: isUser
              ? 'linear-gradient(135deg, #FF8E9B 0%, #E84D5C 100%)'
              : '#fff',
            borderColor: '#FFE4E7',
            borderBottomRightRadius: isUser ? 5 : 18,
            borderBottomLeftRadius: isUser ? 18 : 5,
            boxShadow: isUser
              ? '0 4px 14px rgba(255, 107, 122, 0.34)'
              : '0 1px 6px rgba(255, 107, 122, 0.07)',
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
}

const ChatPage=()=> {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: 'smooth',
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
    setInputValue('');
    setIsTyping(true);

    window.setTimeout(() => {
      const randomReply = aiReplies[Math.floor(Math.random() * aiReplies.length)];

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
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 상단 헤더 */}
      <Group
        h={64}
        px={16}
        gap={10}
        bg="#fff"
        style={{
          borderBottom: '1px solid #FFE4E7',
          flexShrink: 0,
        }}
      >
        <ActionIcon
          variant="light"
          radius="xl"
          size={36}
          color="pink"
          aria-label="뒤로가기"
          styles={{
            root: {
              border: '1.5px solid #FFE4E7',
              backgroundColor: '#FFF0F2',
            },
          }}
        >
          <IconChevronLeft size={19} color="#E84D5C" />
        </ActionIcon>

        <Indicator
          color="green"
          size={11}
          offset={4}
          position="bottom-end"
          withBorder
        >
          <Avatar
            size={42}
            radius="xl"
            styles={{
              root: {
                background: 'linear-gradient(135deg, #FF8E9B, #E84D5C)',
                boxShadow: '0 3px 10px rgba(255, 107, 122, 0.3)',
              },
            }}
          >
            <IconUser size={24} color="white" />
          </Avatar>
        </Indicator>

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={700} c="#2D1A1E">
            ON.AI 도우미
          </Text>

          <Badge
            size="xs"
            radius="xl"
            color="green"
            variant="light"
            styles={{
              root: {
                border: '1px solid #A0E8BC',
              },
            }}
          >
            온라인
          </Badge>
        </Box>

        <ActionIcon
          variant="subtle"
          radius="xl"
          size={36}
          color="pink"
          aria-label="더보기"
        >
          <IconDotsVertical size={19} color="#C4909A" />
        </ActionIcon>
      </Group>

      {/* 채팅 영역 */}
      <ScrollArea
        viewportRef={viewportRef}
        style={{ flex: 1 }}
        styles={{
          viewport: {
            padding: '14px 14px 8px',
            background:
              'radial-gradient(ellipse at top right, rgba(255,174,179,.12) 0%, transparent 55%), radial-gradient(ellipse at bottom left, rgba(255,214,218,.15) 0%, transparent 55%), #FFF8F8',
          },
          scrollbar: {
            display: 'none',
          },
        }}
      >
        <Stack gap={10}>
          <Divider
            label="오늘"
            labelPosition="center"
            styles={{
              label: {
                color: '#C4909A',
                backgroundColor: 'rgba(255, 228, 231, 0.8)',
                border: '1px solid #FFE4E7',
                borderRadius: 999,
                padding: '3px 12px',
                fontSize: 11,
              },
            }}
          />

          {messages.slice(0, 2).map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          <Group gap={7} pl={38} style={{ flexWrap: 'wrap' }}>
            {quickQuestions.map((question) => (
              <Button
                key={question}
                variant="light"
                radius="xl"
                size="xs"
                color="pink"
                onClick={() => sendMessage(question)}
                styles={{
                  root: {
                    backgroundColor: '#fff',
                    border: '1.5px solid #FFAAB3',
                    color: '#E84D5C',
                    boxShadow: '0 1px 6px rgba(255, 107, 122, 0.1)',
                    fontWeight: 500,
                  },
                }}
              >
                {question}
              </Button>
            ))}
          </Group>

          {messages.slice(2, 4).map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          <Card
            withBorder
            radius="lg"
            p={16}
            ml={38}
            maw="84%"
            styles={{
              root: {
                borderColor: '#FFE4E7',
                boxShadow: '0 2px 12px rgba(255, 107, 122, 0.08)',
              },
            }}
          >
            <Text size="sm" fw={700} c="#2D1A1E" mb={10}>
              🌡️ 지금 바로 확인해요
            </Text>

            <Stack gap={0}>
              {[
                '해열제 복용 여부 및 마지막 복용 시간',
                '수분 섭취 충분한지 확인',
                '39°C 이상으로 올라가는지 확인',
                '경련, 심한 보채기, 발진 여부',
              ].map((item) => (
                <Group
                  key={item}
                  gap={9}
                  align="flex-start"
                  py={6}
                  style={{
                    borderBottom: item.includes('발진') ? 'none' : '1px solid #FFE4E7',
                  }}
                >
                  <Box
                    mt={7}
                    w={7}
                    h={7}
                    style={{
                      borderRadius: '50%',
                      flexShrink: 0,
                      background: 'linear-gradient(135deg, #FF8E9B, #E84D5C)',
                    }}
                  />
                  <Text size="sm" c="#7A4A52" lh={1.55}>
                    {item}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Card>

          {messages.slice(4).map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isTyping && <TypingIndicator />}
        </Stack>
      </ScrollArea>

      {/* 입력 영역 */}
      <Box
        bg="#fff"
        px={14}
        pt={10}
        pb={12}
        style={{
          borderTop: '1.5px solid #FFE4E7',
          flexShrink: 0,
        }}
      >
        <Group gap={6} mb={10} wrap="nowrap" style={{ overflowX: 'auto' }}>
          {extraActions.map((action) => (
            <Button
              key={action}
              variant="light"
              radius="xl"
              size="xs"
              color="pink"
              styles={{
                root: {
                  flexShrink: 0,
                  backgroundColor: '#FFF0F2',
                  border: '1.5px solid #FFE4E7',
                  color: '#7A4A52',
                  fontWeight: 500,
                },
              }}
            >
              {action}
            </Button>
          ))}
        </Group>

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
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSubmit();
              }
            }}
            styles={{
              input: {
                minHeight: 46,
                borderRadius: 26,
                border: '1.5px solid #FFE4E7',
                backgroundColor: '#FFF0F2',
                color: '#2D1A1E',
                fontSize: 14.5,
                lineHeight: 1.5,
                padding: '11px 42px 11px 14px',
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
                background: 'linear-gradient(135deg, #FF8E9B 0%, #E84D5C 100%)',
                boxShadow: '0 4px 14px rgba(255, 107, 122, 0.42)',
              },
            }}
          >
            <IconArrowRight size={21} color="white" />
          </ActionIcon>
        </Group>
      </Box>
    </Box>
  );
}
export default ChatPage;