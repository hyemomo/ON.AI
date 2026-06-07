import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Progress,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import {
  IconCheck,
  IconMessageCircle,
  IconSend,
  IconUserHeart,
  IconX,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { apiFetch, formatDateTime } from "@/lib/api";
import {
  border,
  coralScale,
  gradient,
  shadow,
  surface,
  text,
} from "@/tokens/color";

type MatchingUser = {
  usernum: number;
  nickname: string;
  parents_mbti: string | null;
  region: string;
};

type Recommendation = {
  user: MatchingUser;
  match_score: number;
  common_interests: string[];
  common_interest_regions: string[];
  ai_reason: string;
};

type RecommendationListResponse = {
  message: string;
  total: number;
  recommendations: Recommendation[];
};

type MatchingRequest = {
  request_id: number;
  requester: MatchingUser;
  receiver: MatchingUser;
  status: string;
  message: string | null;
  created_at: string;
  responded_at: string | null;
};

type MatchingRequestListResponse = {
  message: string;
  total: number;
  requests: MatchingRequest[];
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

type MatchAcceptResponse = {
  match_id: number;
  matched_user: MatchingUser;
  chat_room_id: number | null;
  created_at: string;
};

type FriendTab = "recommendations" | "requests" | "chats";

const DEFAULT_MESSAGE =
  "안녕하세요! AI 추천에서 육아 관심사와 지역이 비슷하게 나와서 친해지고 싶어요.";

export default function FriendFindPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<FriendTab>("recommendations");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<MatchingRequest[]>(
    [],
  );
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [sentRequestUsernums, setSentRequestUsernums] = useState<number[]>([]);
  const [requestMessages, setRequestMessages] = useState<
    Record<number, string>
  >({});
  const [loading, setLoading] = useState(true);

  const matchedUsernums = chatRooms.map((room) => room.other_user.usernum);

  const fetchReceivedRequests = async () => {
    const data = await apiFetch<MatchingRequestListResponse>(
      "/matching/requests/received",
    );

    setReceivedRequests(data.requests ?? []);
  };

  const fetchSentRequests = async () => {
    const data = await apiFetch<MatchingRequestListResponse>(
      "/matching/requests/sent",
    );

    const pendingUsernums = (data.requests ?? [])
      .filter((request) => request.status === "PENDING")
      .map((request) => request.receiver.usernum);

    setSentRequestUsernums(pendingUsernums);
  };

  const fetchChatRooms = async () => {
    const data = await apiFetch<ChatRoomListResponse>("/chats/rooms");
    setChatRooms(data.rooms ?? []);
  };

  useEffect(() => {
    let isMounted = true;

    const loadFriendFindData = async () => {
      try {
        const [
          recommendationData,
          receivedRequestData,
          sentRequestData,
          chatRoomData,
        ] = await Promise.all([
          apiFetch<RecommendationListResponse>("/matching/recommendations"),
          apiFetch<MatchingRequestListResponse>("/matching/requests/received"),
          apiFetch<MatchingRequestListResponse>("/matching/requests/sent"),
          apiFetch<ChatRoomListResponse>("/chats/rooms"),
        ]);

        if (!isMounted) return;

        setRecommendations(recommendationData.recommendations ?? []);
        setReceivedRequests(receivedRequestData.requests ?? []);
        setChatRooms(chatRoomData.rooms ?? []);

        const pendingUsernums = (sentRequestData.requests ?? [])
          .filter((request) => request.status === "PENDING")
          .map((request) => request.receiver.usernum);

        setSentRequestUsernums(pendingUsernums);

        const initialMessages: Record<number, string> = {};
        (recommendationData.recommendations ?? []).forEach((item) => {
          initialMessages[item.user.usernum] = DEFAULT_MESSAGE;
        });

        setRequestMessages(initialMessages);
      } catch (error) {
        console.error(error);

        if (!isMounted) return;

        alert("친구찾기 정보를 불러오지 못했습니다.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadFriendFindData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChangeRequestMessage = (usernum: number, message: string) => {
    setRequestMessages((prev) => ({
      ...prev,
      [usernum]: message,
    }));
  };

  const handleSendRequest = async (receiverUsernum: number) => {
    const message = requestMessages[receiverUsernum]?.trim() || DEFAULT_MESSAGE;

    try {
      await apiFetch("/matching/requests", {
        method: "POST",
        json: {
          receiver_usernum: receiverUsernum,
          message,
        },
      });

      alert("친해져요 요청을 보냈습니다.");
      await fetchSentRequests();
    } catch (error) {
      console.error(error);
      alert("요청 보내기에 실패했습니다.");
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      const data = await apiFetch<MatchAcceptResponse>(
        `/matching/requests/${requestId}/accept`,
        {
          method: "POST",
        },
      );

      await Promise.all([
        fetchReceivedRequests(),
        fetchSentRequests(),
        fetchChatRooms(),
      ]);

      if (data.chat_room_id) {
        const goChat = window.confirm(
          "매칭 완료! 바로 대화를 시작하시겠습니까?",
        );

        if (goChat) {
          navigate(`/friends/chat/${data.chat_room_id}`);
        }
      } else {
        alert("매칭 완료! 채팅 탭에서 대화를 시작해보세요.");
      }
    } catch (error) {
      console.error(error);
      alert("요청 수락에 실패했습니다.");
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      await apiFetch(`/matching/requests/${requestId}/reject`, {
        method: "POST",
      });

      alert("요청을 거절했습니다.");
      await fetchReceivedRequests();
    } catch (error) {
      console.error(error);
      alert("요청 거절에 실패했습니다.");
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
          size="md"
          h="100%"
          py="md"
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Stack gap="md" h="100%" style={{ minHeight: 0, overflow: "hidden" }}>
            <Box style={{ flexShrink: 0 }}>
              <Stack gap={4}>
                <Group gap="sm">
                  <IconUserHeart size={30} color={coralScale[5]} />
                  <Title order={2} c={text.primary}>
                    친구찾기
                  </Title>
                </Group>

                <Text size="sm" c={text.secondary}>
                  AI 추천을 보고 직접 친해져요 요청을 보내보세요.
                </Text>
              </Stack>
            </Box>

            <Box style={{ flexShrink: 0 }}>
              <SegmentedControl
                fullWidth
                color="coral"
                radius="xl"
                value={activeTab}
                onChange={(value) => setActiveTab(value as FriendTab)}
                data={[
                  { label: "추천 친구", value: "recommendations" },
                  { label: "받은 요청", value: "requests" },
                  { label: "채팅", value: "chats" },
                ]}
              />
            </Box>

            <ScrollArea
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
                  paddingRight: 4,
                },
                scrollbar: {
                  display: "none",
                },
              }}
            >
              <Stack gap="md" pb="md">
                {loading && (
                  <Card p="xl">
                    <Text ta="center" c={text.muted}>
                      친구찾기 정보를 불러오는 중입니다...
                    </Text>
                  </Card>
                )}

                {!loading && activeTab === "recommendations" && (
                  <>
                    {recommendations.length > 0 ? (
                      recommendations.map((item) => {
                        const isPending = sentRequestUsernums.includes(
                          item.user.usernum,
                        );
                        const isMatched = matchedUsernums.includes(
                          item.user.usernum,
                        );

                        return (
                          <Card
                            key={item.user.usernum}
                            p="lg"
                            radius="xl"
                            withBorder
                          >
                            <Stack gap="md">
                              <Group justify="space-between" align="flex-start">
                                <Stack gap={4}>
                                  <Text fw={800} size="lg" c={text.primary}>
                                    {item.user.nickname}
                                  </Text>

                                  <Group gap="xs">
                                    <Badge color="coral" variant="light">
                                      {item.user.region}
                                    </Badge>

                                    {item.user.parents_mbti && (
                                      <Badge color="pink" variant="light">
                                        {item.user.parents_mbti}
                                      </Badge>
                                    )}
                                  </Group>
                                </Stack>

                                <Stack gap={3} align="flex-end">
                                  <Text fw={800} c={coralScale[6]}>
                                    {item.match_score}점
                                  </Text>

                                  <Progress
                                    value={item.match_score}
                                    color="coral"
                                    w={100}
                                    radius="xl"
                                  />
                                </Stack>
                              </Group>

                              <Divider color={border.default} />

                              <Stack gap="xs">
                                <Text size="sm" fw={700} c={text.primary}>
                                  AI 추천 이유
                                </Text>

                                <Text size="sm" c={text.secondary}>
                                  {item.ai_reason}
                                </Text>
                              </Stack>

                              <Group gap="xs" wrap="wrap">
                                {item.common_interests.map((interest) => (
                                  <Badge
                                    key={interest}
                                    color="coral"
                                    variant="light"
                                  >
                                    {interest}
                                  </Badge>
                                ))}

                                {item.common_interest_regions.map((region) => (
                                  <Badge
                                    key={region}
                                    color="gray"
                                    variant="light"
                                  >
                                    {region}
                                  </Badge>
                                ))}
                              </Group>

                              {!isMatched && !isPending && (
                                <Textarea
                                  label="요청 메시지"
                                  autosize
                                  minRows={2}
                                  maxRows={4}
                                  value={
                                    requestMessages[item.user.usernum] ??
                                    DEFAULT_MESSAGE
                                  }
                                  onChange={(e) =>
                                    handleChangeRequestMessage(
                                      item.user.usernum,
                                      e.currentTarget.value,
                                    )
                                  }
                                  placeholder="친해져요 요청과 함께 보낼 메시지를 입력하세요."
                                />
                              )}

                              <Button
                                radius="xl"
                                disabled={isPending || isMatched}
                                leftSection={
                                  isMatched ? (
                                    <IconMessageCircle size={16} />
                                  ) : (
                                    <IconSend size={16} />
                                  )
                                }
                                onClick={() =>
                                  void handleSendRequest(item.user.usernum)
                                }
                                style={{
                                  background:
                                    isPending || isMatched
                                      ? undefined
                                      : gradient.primary,
                                  boxShadow:
                                    isPending || isMatched
                                      ? undefined
                                      : shadow.btn,
                                }}
                              >
                                {isMatched
                                  ? "이미 친해진 유저입니다"
                                  : isPending
                                    ? "요청 대기중"
                                    : "친해져요!"}
                              </Button>
                            </Stack>
                          </Card>
                        );
                      })
                    ) : (
                      <Card p="xl" radius="xl" withBorder>
                        <Text ta="center" c={text.muted}>
                          추천 친구가 없습니다.
                        </Text>
                      </Card>
                    )}
                  </>
                )}

                {!loading && activeTab === "requests" && (
                  <>
                    {receivedRequests.length > 0 ? (
                      receivedRequests.map((request) => (
                        <Card
                          key={request.request_id}
                          p="lg"
                          radius="xl"
                          withBorder
                        >
                          <Stack gap="md">
                            <Group justify="space-between" align="flex-start">
                              <Stack gap={4}>
                                <Text fw={800} size="lg" c={text.primary}>
                                  {request.requester.nickname}
                                </Text>

                                <Group gap="xs">
                                  <Badge color="coral" variant="light">
                                    {request.requester.region}
                                  </Badge>

                                  {request.requester.parents_mbti && (
                                    <Badge color="pink" variant="light">
                                      {request.requester.parents_mbti}
                                    </Badge>
                                  )}
                                </Group>
                              </Stack>

                              <Text size="xs" c={text.muted}>
                                {formatDateTime(request.created_at)}
                              </Text>
                            </Group>

                            <Text size="sm" c={text.secondary}>
                              {request.message || "친해지고 싶어요!"}
                            </Text>

                            {request.status === "PENDING" ? (
                              <Group grow>
                                <Button
                                  radius="xl"
                                  color="coral"
                                  leftSection={<IconCheck size={16} />}
                                  onClick={() =>
                                    void handleAcceptRequest(request.request_id)
                                  }
                                  style={{ background: gradient.primary }}
                                >
                                  수락
                                </Button>

                                <Button
                                  radius="xl"
                                  color="gray"
                                  variant="light"
                                  leftSection={<IconX size={16} />}
                                  onClick={() =>
                                    void handleRejectRequest(request.request_id)
                                  }
                                >
                                  거절
                                </Button>
                              </Group>
                            ) : (
                              <Badge
                                w="fit-content"
                                color="gray"
                                variant="light"
                              >
                                {request.status}
                              </Badge>
                            )}
                          </Stack>
                        </Card>
                      ))
                    ) : (
                      <Card p="xl" radius="xl" withBorder>
                        <Text ta="center" c={text.muted}>
                          받은 친해져요 요청이 없습니다.
                        </Text>
                      </Card>
                    )}
                  </>
                )}

                {!loading && activeTab === "chats" && (
                  <>
                    {chatRooms.length > 0 ? (
                      chatRooms.map((room) => (
                        <Card
                          key={room.room_id}
                          p="lg"
                          radius="xl"
                          withBorder
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            navigate(`/friends/chat/${room.room_id}`)
                          }
                        >
                          <Group justify="space-between">
                            <Stack gap={4}>
                              <Text fw={800} c={text.primary}>
                                {room.other_user.nickname}
                              </Text>

                              <Group gap="xs">
                                <Badge color="coral" variant="light">
                                  {room.other_user.region}
                                </Badge>

                                {room.other_user.parents_mbti && (
                                  <Badge color="pink" variant="light">
                                    {room.other_user.parents_mbti}
                                  </Badge>
                                )}
                              </Group>

                              <Text size="xs" c={text.muted}>
                                마지막 대화{" "}
                                {room.last_message_at
                                  ? formatDateTime(room.last_message_at)
                                  : "아직 메시지가 없습니다."}
                              </Text>
                            </Stack>

                            <Button
                              radius="xl"
                              color="coral"
                              variant="light"
                              leftSection={<IconMessageCircle size={16} />}
                            >
                              대화하기
                            </Button>
                          </Group>
                        </Card>
                      ))
                    ) : (
                      <Card p="xl" radius="xl" withBorder>
                        <Text ta="center" c={text.muted}>
                          아직 생성된 채팅방이 없습니다. 친해져요 요청을
                          수락하면 채팅방이 자동 생성됩니다.
                        </Text>
                      </Card>
                    )}
                  </>
                )}
              </Stack>
            </ScrollArea>
          </Stack>
        </Container>
      </Box>
    </AppLayout>
  );
}
