import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconArrowLeft, IconSend } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import UserProfileAvatar from "@/components/UserProfileAvatar";
import { apiFetch } from "@/lib/api";
import type { MyPageUser } from "@/features/community/post-detail/types/types";
import { border, coralScale, gradient, surface, text } from "@/tokens/color";

type MatchingUser = {
  usernum: number;
  nickname: string;
  parents_mbti: string | null;
  region: string;
  profile_image_url?: string | null;
};

type ChatMessage = {
  message_id: number;
  room_id: number;
  sender: MatchingUser;
  content: string;
  is_read: boolean;
  created_at: string;
};

type ChatMessageListResponse = {
  message: string;
  total: number;
  messages: ChatMessage[];
};

type ChatRoom = {
  room_id: number;
  match_id: number;
  other_user: MatchingUser;
  created_at: string;
  last_message_at: string | null;
};

type ChatRoomListResponse = {
  message: string;
  total: number;
  rooms: ChatRoom[];
};

function getDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const targetDate = date.toDateString();
  const todayDate = today.toDateString();
  const yesterdayDate = yesterday.toDateString();

  if (targetDate === todayDate) return "오늘";
  if (targetDate === yesterdayDate) return "어제";

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function getTimeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function isSameDate(a?: string, b?: string) {
  if (!a || !b) return false;

  const firstDate = new Date(a);
  const secondDate = new Date(b);

  if (Number.isNaN(firstDate.getTime()) || Number.isNaN(secondDate.getTime())) {
    return false;
  }

  return firstDate.toDateString() === secondDate.toDateString();
}

function isSameSender(a?: ChatMessage, b?: ChatMessage) {
  if (!a || !b) return false;
  return a.sender.usernum === b.sender.usernum;
}

export default function FriendChatPage() {
  const params = useParams();
  const roomId = params.roomId;
  const navigate = useNavigate();

  const viewport = useRef<HTMLDivElement>(null);

  const [currentUser, setCurrentUser] = useState<MyPageUser | null>(null);
  const [otherUser, setOtherUser] = useState<MatchingUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    let isMounted = true;

    const loadInitialData = async () => {
      try {
        const [me, roomData, messageData] = await Promise.all([
          apiFetch<MyPageUser>("/mypage/me"),
          apiFetch<ChatRoomListResponse>("/chats/rooms"),
          apiFetch<ChatMessageListResponse>(`/chats/rooms/${roomId}/messages`),
        ]);

        if (!isMounted) return;

        const currentRoom = (roomData.rooms ?? []).find(
          (room) => String(room.room_id) === String(roomId),
        );

        setCurrentUser(me);
        setOtherUser(currentRoom?.other_user ?? null);
        setMessages(messageData.messages ?? []);
      } catch (error) {
        console.error(error);

        if (!isMounted) return;

        alert("채팅방 정보를 불러오지 못했습니다.");
        navigate("/friends?tab=chats", { replace: true });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [roomId, navigate]);

  useEffect(() => {
    viewport.current?.scrollTo({
      top: viewport.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const fetchMessages = async () => {
    if (!roomId) return;

    const data = await apiFetch<ChatMessageListResponse>(
      `/chats/rooms/${roomId}/messages`,
    );

    setMessages(data.messages ?? []);
  };

  const handleSendMessage = async () => {
    if (!roomId) return;
    if (!content.trim()) return;

    try {
      setSending(true);

      await apiFetch(`/chats/rooms/${roomId}/messages`, {
        method: "POST",
        json: {
          content: content.trim(),
        },
      });

      setContent("");
      await fetchMessages();
    } catch (error) {
      console.error(error);
      alert("메시지 전송에 실패했습니다.");
    } finally {
      setSending(false);
    }
  };

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
          <Stack gap="sm" h="100%" style={{ overflow: "hidden" }}>
            <Button
              variant="subtle"
              color="coral"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate("/friends?tab=chats", { replace: true })}
              w="fit-content"
              style={{ flexShrink: 0 }}
            >
              채팅 목록
            </Button>

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
                background: "linear-gradient(180deg, #fff8f8 0%, #fff1f3 100%)",
              }}
            >
              <Box
                px="lg"
                py="md"
                style={{
                  flexShrink: 0,
                  background: "rgba(255,255,255,0.9)",
                  borderBottom: `1px solid ${border.default}`,
                }}
              >
                <Group justify="space-between">
                  <Group gap="sm" align="center">
                    <UserProfileAvatar
                      profileImageUrl={otherUser?.profile_image_url}
                      nickname={otherUser?.nickname}
                      size={44}
                    />

                    <Stack gap={0}>
                      <Text fw={800} size="md" c={text.primary}>
                        {otherUser?.nickname ?? "대화 상대"}
                      </Text>

                      {otherUser ? (
                        <Text size="xs" c={text.muted}>
                          {otherUser.region}
                          {otherUser.parents_mbti
                            ? ` · ${otherUser.parents_mbti}`
                            : ""}
                        </Text>
                      ) : (
                        <Text size="xs" c={text.muted}>
                          상대방 정보를 불러오는 중입니다.
                        </Text>
                      )}
                    </Stack>
                  </Group>
                </Group>
              </Box>

              <ScrollArea
                viewportRef={viewport}
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
                    padding: "18px 16px 12px",
                  },
                  scrollbar: {
                    display: "none",
                  },
                }}
              >
                <Stack gap={6}>
                  {loading ? (
                    <Text ta="center" c={text.muted} size="sm">
                      메시지를 불러오는 중입니다...
                    </Text>
                  ) : messages.length > 0 ? (
                    messages.map((message, index) => {
                      const previousMessage = messages[index - 1];
                      const nextMessage = messages[index + 1];

                      const isMine =
                        currentUser?.usernum === message.sender.usernum;

                      const shouldShowDate =
                        index === 0 ||
                        !isSameDate(
                          previousMessage?.created_at,
                          message.created_at,
                        );

                      const shouldShowName =
                        !isMine &&
                        (!previousMessage ||
                          !isSameSender(previousMessage, message) ||
                          !isSameDate(
                            previousMessage.created_at,
                            message.created_at,
                          ));

                      const isLastInSenderGroup =
                        !nextMessage ||
                        !isSameSender(message, nextMessage) ||
                        !isSameDate(message.created_at, nextMessage.created_at);

                      return (
                        <Stack key={message.message_id} gap={4}>
                          {shouldShowDate && (
                            <Divider
                              my="sm"
                              label={getDateLabel(message.created_at)}
                              labelPosition="center"
                              styles={{
                                label: {
                                  color: text.muted,
                                  backgroundColor: "rgba(255,255,255,0.8)",
                                  border: `1px solid ${border.default}`,
                                  borderRadius: 999,
                                  padding: "3px 12px",
                                  fontSize: 11,
                                },
                              }}
                            />
                          )}

                          {shouldShowName && (
                            <Group justify="flex-start" pl={44}>
                              <Text size="xs" fw={700} c={text.secondary}>
                                {message.sender.nickname}
                              </Text>
                            </Group>
                          )}

                          <Group
                            justify={isMine ? "flex-end" : "flex-start"}
                            align="flex-end"
                            gap={6}
                          >
                            {!isMine && (
                              <Box
                                style={{
                                  visibility: shouldShowName
                                    ? "visible"
                                    : "hidden",
                                  width: 32,
                                  height: 32,
                                  flexShrink: 0,
                                }}
                              >
                                <UserProfileAvatar
                                  profileImageUrl={
                                    message.sender.profile_image_url
                                  }
                                  nickname={message.sender.nickname}
                                  size={32}
                                />
                              </Box>
                            )}

                            {isMine && isLastInSenderGroup && (
                              <Text
                                size="10px"
                                c={text.muted}
                                style={{ marginBottom: 2 }}
                              >
                                {getTimeLabel(message.created_at)}
                              </Text>
                            )}

                            <Box
                              style={{
                                maxWidth: "72%",
                                padding: "9px 13px",
                                borderRadius: isMine
                                  ? "18px 18px 4px 18px"
                                  : "18px 18px 18px 4px",
                                background: isMine
                                  ? gradient.primary
                                  : "#FFFFFF",
                                color: isMine ? "#FFFFFF" : text.primary,
                                boxShadow: isMine
                                  ? "0 6px 14px rgba(255, 111, 118, 0.22)"
                                  : "0 4px 12px rgba(0,0,0,0.06)",
                                border: isMine
                                  ? "none"
                                  : `1px solid ${border.default}`,
                              }}
                            >
                              <Text
                                size="sm"
                                style={{
                                  whiteSpace: "pre-wrap",
                                  lineHeight: 1.55,
                                  wordBreak: "break-word",
                                }}
                              >
                                {message.content}
                              </Text>
                            </Box>

                            {!isMine && isLastInSenderGroup && (
                              <Text
                                size="10px"
                                c={text.muted}
                                style={{ marginBottom: 2 }}
                              >
                                {getTimeLabel(message.created_at)}
                              </Text>
                            )}
                          </Group>
                        </Stack>
                      );
                    })
                  ) : (
                    <Stack align="center" gap="xs" py="xl">
                      <Text size="lg" fw={800} c={text.primary}>
                        아직 메시지가 없습니다.
                      </Text>

                      <Text size="sm" c={text.muted} ta="center">
                        첫 인사를 보내 대화를 시작해보세요.
                      </Text>
                    </Stack>
                  )}
                </Stack>
              </ScrollArea>

              <Box
                p="md"
                style={{
                  flexShrink: 0,
                  background: "rgba(255,255,255,0.95)",
                  borderTop: `1px solid ${border.default}`,
                }}
              >
                <Group gap="sm" align="flex-end">
                  <TextInput
                    placeholder={
                      otherUser?.nickname
                        ? `${otherUser.nickname}님에게 메시지 보내기`
                        : "메시지를 입력하세요"
                    }
                    value={content}
                    onChange={(e) => setContent(e.currentTarget.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void handleSendMessage();
                      }
                    }}
                    radius="xl"
                    size="md"
                    style={{ flex: 1 }}
                    styles={{
                      input: {
                        background: surface.subtle,
                        borderColor: border.default,
                      },
                    }}
                  />

                  <Button
                    radius="xl"
                    color="coral"
                    loading={sending}
                    disabled={!content.trim()}
                    rightSection={<IconSend size={16} />}
                    onClick={() => void handleSendMessage()}
                    style={{
                      background: content.trim() ? coralScale[5] : undefined,
                    }}
                  >
                    전송
                  </Button>
                </Group>
              </Box>
            </Card>
          </Stack>
        </Container>
      </Box>
    </AppLayout>
  );
}
