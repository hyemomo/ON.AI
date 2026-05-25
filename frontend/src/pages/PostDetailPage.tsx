import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AppShell,
  Container,
  Group,
  Stack,
  Text,
  Badge,
  Button,
  ActionIcon,
  Textarea,
  Card,
  Divider,
  Box,
  Paper,
} from "@mantine/core";
import { IconArrowLeft, IconSend } from "@tabler/icons-react";
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
import PostContentCard from "@/features/community/post-detail/components/PostContentCard";
import CommentItem from "@/features/community/post-detail/components/CommentItem";

interface PostDetailResponse {
  post: Post;
}

export default function PostDetailPage() {
  const navigate = useNavigate();
  const params = useParams();

  const postnum = params.postnum as string;

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);

  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `http://127.0.0.1:8000/community/posts/${postnum}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data: PostDetailResponse = await response.json();

        if (!response.ok) {
          throw new Error("게시글 상세 조회 실패");
        }

        setPost(data.post);
      } catch (error) {
        console.error(error);
        alert("게시글을 불러오지 못했습니다.");
        navigate("/community");
      } finally {
        setLoading(false);
      }
    };

    if (postnum) {
      fetchPostDetail();
    }
  }, [postnum, navigate]);

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

  if (loading) {
    return (
      <Box style={{ minHeight: "100vh", background: surface.bg }}>
        <Container size="md" py="xl">
          <Card p="xl">
            <Text ta="center" c={text.muted}>
              게시글을 불러오는 중입니다...
            </Text>
          </Card>
        </Container>
      </Box>
    );
  }

  if (!post) {
    return (
      <Box style={{ minHeight: "100vh", background: surface.bg }}>
        <Container size="md" py="xl">
          <Card p="xl">
            <Text ta="center" c={text.muted}>
              게시글을 찾을 수 없습니다.
            </Text>
          </Card>
        </Container>
      </Box>
    );
  }

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
onClick={() => navigate(-1)}
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
                    댓글{" "}
                    <Text component="span" c={coralScale[5]}>
                      {comments.length}
                    </Text>
                  </Text>

                  <Badge color="coral" variant="light" size="sm">
                    최신순
                  </Badge>
                </Group>

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
            </Stack>
          </Container>
        </AppShell.Main>
      </AppShell>
    </Box>
  );
}