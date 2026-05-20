import { useState } from "react";
import {
  AppShell,
  Container,
  Group,
  Stack,
  Text,
  Badge,
  Avatar,
  Button,
  ActionIcon,
  Textarea,
  Card,
  Divider,
  Box,
  Paper,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconSend,
} from "@tabler/icons-react";
import {
  coralScale,
  surface,
  text,
  border,
  shadow,
  gradient,
} from "@/tokens/color";
import type {
  Comment,
  Post,
} from "@/features/community/post-detail/types/types";
import {
  COMMENTS,
  POST,
} from "@/features/community/post-detail/mocks/mockData";
import PostContentCard from "@/features/community/post-detail/components/PostContentCard";
import CommentItem from "@/features/community/post-detail/components/CommentItem";

interface PostDetailPageProps {
  post?: Post;
  onBack?: () => void;
}

export default function PostDetailPage({
  post = POST,
  onBack,
}: PostDetailPageProps) {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>(COMMENTS);

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    const newComment: Comment = {
      id: Date.now(),
      author: "김지연",
      authorLevel: "레벨 5",
      emoji: "🌸",
      childAge: "14개월",
      timeAgo: "방금",
      body: commentText,
      likes: 0,
      isAuthor: true,
    };
    setComments((prev) => [newComment, ...prev]);
    setCommentText("");
  };

  return (
    <Box style={{ minHeight: "100vh", background: surface.bg }}>
      <AppShell header={{ height: 62 }} padding={0}>
        <AppShell.Header
          style={{
            background: "rgba(255,248,248,0.92)",
            backdropFilter: "blur(16px)",
            borderBottom: `1px solid ${border.default}`,
          }}
        >
          <Container size="xl" h="100%">
            <Group h="100%" justify="space-between">
              <ActionIcon
                variant="subtle"
                color="coral"
                size={36}
                radius="xl"
                onClick={onBack}
                style={{
                  border: `1.5px solid ${border.default}`,
                  background: surface.subtle,
                }}
              >
                <IconArrowLeft size={16} color={coralScale[6]} />
              </ActionIcon>
            </Group>
          </Container>
        </AppShell.Header>

        <AppShell.Main>
          <Container size="md">
            <Stack gap="lg">
              <PostContentCard post={post} />
              <Card p="xl">
                <Group justify="space-between" mb="lg">
                  <Text fw={700} size="md" c={text.primary}>
                    댓글
                    <Text component="span" c={coralScale[5]}>
                      {comments.length}
                    </Text>
                  </Text>
                  <Badge color="coral" variant="light" size="sm">
                    최신순
                  </Badge>
                </Group>

                {/* 댓글 입력 */}
                <Paper
                  p="md"
                  radius="lg"
                  mb="xl"
                  style={{
                    background: surface.subtle,
                    border: `1.5px solid ${border.default}`,
                  }}
                >
                  <Group align="flex-start" gap="sm">
                    <Avatar
                      size={36}
                      radius="xl"
                      style={{
                        border: `1.5px solid ${border.default}`,
                        flexShrink: 0,
                      }}
                    >
                    김
                    </Avatar>
                    <Stack gap="sm" style={{ flex: 1 }}>
                      <Textarea
                        id="comment-input"
                        placeholder="따뜻한 댓글을 남겨보세요 🌸"
                        radius="md"
                        size="sm"
                        minRows={3}
                        autosize
                        value={commentText}
                        onChange={(e) => setCommentText(e.currentTarget.value)}
                        styles={{
                          input: {
                            borderColor: border.default,
                            background: surface.white,
                            fontSize: 14,
                            "&:focus": { borderColor: coralScale[3] },
                          },
                        }}
                      />
                      <Group justify="space-between" align="center">
                        <Text size="xs" c={text.muted}>
                          {commentText.length} / 500자
                        </Text>
                        <Button
                          size="sm"
                          color="coral"
                          radius="md"
                          rightSection={<IconSend size={13} />}
                          disabled={!commentText.trim()}
                          onClick={handleSubmitComment}
                          style={{
                            background: commentText.trim()
                              ? gradient.primary
                              : undefined,
                            border: "none",
                            boxShadow: commentText.trim() ? shadow.btn : "none",
                          }}
                        >
                          댓글 등록
                        </Button>
                      </Group>
                    </Stack>
                  </Group>
                </Paper>

                <Divider color={border.default} mb="lg" />

                {/* 댓글 목록 */}
                <Stack gap="xl">
                  {comments.map((comment, idx) => (
                    <Box key={comment.id}>
                      <CommentItem comment={comment} />
                      {idx < comments.length - 1 && (
                        <Divider color={border.default} mt="lg" />
                      )}
                    </Box>
                  ))}
                </Stack>
              </Card>

              {/* ── 관련 게시글 ── */}
              {/* <Card p="xl">
                <Text fw={700} size="md" c={text.primary} mb="md">
                  비슷한 게시글
                </Text>
                <Stack gap="sm">
                  {[
                    {
                      title: "15개월 아이 열 자주 나는데 정상인가요?",
                      comments: 34,
                      category: "🌡️ 건강",
                    },
                    {
                      title: "해열제 종류별 차이점 정리해봤어요",
                      comments: 58,
                      category: "🌡️ 건강",
                    },
                    {
                      title: "ON.AI 처음 써봤는데 진짜 신기해요!",
                      comments: 21,
                      category: "💬 육아 고민",
                    },
                  ].map((item, i) => (
                    <Paper
                      key={i}
                      p="sm"
                      radius="md"
                      style={{
                        border: `1.5px solid ${border.default}`,
                        cursor: "pointer",
                        transition: "all 160ms ease-out",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = border.strong;
                        e.currentTarget.style.background = coralScale[0];
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = border.default;
                        e.currentTarget.style.background = surface.white;
                      }}
                    >
                      <Group justify="space-between">
                        <Group gap="sm">
                          <Badge size="xs" color="green" variant="light">
                            {item.category}
                          </Badge>
                          <Text
                            size="sm"
                            fw={500}
                            c={text.primary}
                            lineClamp={1}
                          >
                            {item.title}
                          </Text>
                        </Group>
                        <Group gap={4} style={{ flexShrink: 0 }}>
                          <IconMessageCircle size={12} color={text.muted} />
                          <Text size="xs" c={text.muted}>
                            {item.comments}
                          </Text>
                        </Group>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              </Card> */}
            </Stack>
          </Container>
        </AppShell.Main>
      </AppShell>
    </Box>
  );
}
