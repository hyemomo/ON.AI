import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { IconArrowLeft, IconSend } from "@tabler/icons-react";
import AppLayout from "@/components/AppLayout";
import { apiFetch } from "@/lib/api";
import {
  border,
  coralScale,
  gradient,
  shadow,
  surface,
  text,
} from "@/tokens/color";
import type {
  Comment,
  MyPageUser,
  Post,
} from "@/features/community/post-detail/types/types";
import PostContentCard from "@/features/community/post-detail/components/PostContentCard";
import CommentItem from "@/features/community/post-detail/components/CommentItem";

type PostDetailResponse = {
  post: Post;
};

type CommentsResponse = {
  comments: Comment[];
};

export default function PostDetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  const postnum = params.postnum;

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<MyPageUser | null>(null);

  useEffect(() => {
    if (!postnum) return;

    let isMounted = true;

    const loadPostDetail = async () => {
      try {
        const [userData, postData, commentData] = await Promise.all([
          apiFetch<MyPageUser>("/mypage/me"),
          apiFetch<PostDetailResponse>(`/community/posts/${postnum}`),
          apiFetch<CommentsResponse>(`/community/comments/post/${postnum}`),
        ]);

        if (!isMounted) return;

        setCurrentUser(userData);
        setPost(postData.post);
        setComments(commentData.comments ?? []);
      } catch (error) {
        console.error(error);

        if (!isMounted) return;

        alert("게시글을 불러오지 못했습니다.");
        navigate("/community");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadPostDetail();

    return () => {
      isMounted = false;
    };
  }, [postnum, navigate]);

  const fetchComments = async () => {
    if (!postnum) return;

    const data = await apiFetch<CommentsResponse>(
      `/community/comments/post/${postnum}`,
    );

    setComments(data.comments ?? []);
  };

  const handleDeletePost = async (targetPostnum: number) => {
    const ok = window.confirm("게시글을 삭제하시겠습니까?");
    if (!ok) return;

    try {
      await apiFetch(`/community/posts/${targetPostnum}`, {
        method: "DELETE",
      });

      alert("게시글이 삭제되었습니다.");
      navigate("/community");
    } catch (error) {
      console.error(error);
      alert("게시글 삭제에 실패했습니다.");
    }
  };

  const handleSubmitComment = async () => {
    if (!postnum) return;
    if (!commentText.trim()) return;

    try {
      await apiFetch("/community/comments/", {
        method: "POST",
        json: {
          c_content: commentText.trim(),
          c_post: Number(postnum),
        },
      });

      setCommentText("");
      await fetchComments();

      setPost((prev) =>
        prev
          ? {
              ...prev,
              comment_count: prev.comment_count + 1,
            }
          : prev,
      );
    } catch (error) {
      console.error(error);
      alert("댓글 등록에 실패했습니다.");
    }
  };

  const handleUpdateComment = async (commentnum: number, content: string) => {
    try {
      await apiFetch(`/community/comments/${commentnum}`, {
        method: "PUT",
        json: {
          c_content: content,
        },
      });

      await fetchComments();
    } catch (error) {
      console.error(error);
      alert("댓글 수정에 실패했습니다.");
    }
  };

  const handleDeleteComment = async (commentnum: number) => {
    try {
      await apiFetch(`/community/comments/${commentnum}`, {
        method: "DELETE",
      });

      await fetchComments();

      setPost((prev) =>
        prev
          ? {
              ...prev,
              comment_count: Math.max(prev.comment_count - 1, 0),
            }
          : prev,
      );
    } catch (error) {
      console.error(error);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <Box style={{ minHeight: "100vh", background: surface.bg }}>
          <Container size="md" py="xl">
            <Card p="xl" radius="xl" withBorder>
              <Text ta="center" c={text.muted}>
                게시글을 불러오는 중입니다...
              </Text>
            </Card>
          </Container>
        </Box>
      </AppLayout>
    );
  }

  if (!post) {
    return (
      <AppLayout>
        <Box style={{ minHeight: "100vh", background: surface.bg }}>
          <Container size="md" py="xl">
            <Card p="xl" radius="xl" withBorder>
              <Text ta="center" c={text.muted}>
                게시글을 찾을 수 없습니다.
              </Text>
            </Card>
          </Container>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box style={{ minHeight: "100vh", background: surface.bg }}>
        <Container size="md" py="xl">
          <Stack gap="lg">
            <Button
              variant="subtle"
              color="coral"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate("/community")}
              w="fit-content"
            >
              커뮤니티로 돌아가기
            </Button>

            <PostContentCard
              post={post}
              commentCount={comments.length}
              currentUsernum={currentUser?.usernum}
              onDelete={handleDeletePost}
            />

            <Card p="xl" radius="xl" withBorder>
              <Group justify="space-between" mb="lg">
                <Text fw={700} size="md" c={text.primary}>
                  댓글{" "}
                  <Text component="span" c={coralScale[5]}>
                    {comments.length}
                  </Text>
                </Text>
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
                        onClick={() => void handleSubmitComment()}
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
                {comments.length > 0 ? (
                  comments.map((comment, idx) => (
                    <Box key={comment.commentnum}>
                      <CommentItem
                        comment={comment}
                        currentUsernum={currentUser?.usernum}
                        onUpdate={handleUpdateComment}
                        onDelete={handleDeleteComment}
                      />

                      {idx < comments.length - 1 && (
                        <Divider color={border.default} mt="lg" />
                      )}
                    </Box>
                  ))
                ) : (
                  <Text ta="center" size="sm" c={text.muted}>
                    아직 댓글이 없습니다.
                  </Text>
                )}
              </Stack>
            </Card>
          </Stack>
        </Container>
      </Box>
    </AppLayout>
  );
}
