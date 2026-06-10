import { useState } from "react";
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import type { Comment } from "@/features/community/post-detail/types/types";
import { formatDateTime } from "@/lib/api";
import UserProfileAvatar from "@/components/UserProfileAvatar";
import { border, coralScale, surface, text } from "@/tokens/color";

type CommentItemProps = {
  comment: Comment;
  currentUsernum?: number;
  onUpdate: (commentnum: number, content: string) => Promise<void>;
  onDelete: (commentnum: number) => Promise<void>;
};

export default function CommentItem({
  comment,
  currentUsernum,
  onUpdate,
  onDelete,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.c_content);
  const [loading, setLoading] = useState(false);

  const isOwner = currentUsernum === comment.c_user;

  const handleUpdate = async () => {
    if (!editContent.trim()) return;

    try {
      setLoading(true);
      await onUpdate(comment.commentnum, editContent.trim());
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert("댓글 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm("댓글을 삭제하시겠습니까?");
    if (!ok) return;

    try {
      setLoading(true);
      await onDelete(comment.commentnum);
    } catch (error) {
      console.error(error);
      alert("댓글 삭제에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Group align="flex-start" gap="sm" pl={0}>
        <UserProfileAvatar
          profileImageUrl={comment.profile_image_url}
          nickname={comment.nickname}
          size={38}
        />

        <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
          <Group gap={8} justify="space-between">
            <Group gap={6}>
              <Text size="sm" fw={700} c={text.primary}>
                {comment.nickname || "알 수 없음"}
              </Text>

              <Text size="xs" c={text.muted}>
                {formatDateTime(comment.c_created_at)}
              </Text>
            </Group>

            {isOwner && !isEditing && (
              <Group gap={4}>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  radius="xl"
                  onClick={() => setIsEditing(true)}
                >
                  <IconEdit size={14} color={text.muted} />
                </ActionIcon>

                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  radius="xl"
                  loading={loading}
                  onClick={() => void handleDelete()}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Group>
            )}
          </Group>

          {isEditing ? (
            <Stack gap="xs">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.currentTarget.value)}
                autosize
                minRows={2}
                styles={{
                  input: {
                    borderColor: border.default,
                    background: surface.white,
                    fontSize: 14,
                  },
                }}
              />

              <Group justify="flex-end" gap="xs">
                <Button
                  size="xs"
                  variant="subtle"
                  color="gray"
                  onClick={() => {
                    setEditContent(comment.c_content);
                    setIsEditing(false);
                  }}
                >
                  취소
                </Button>

                <Button
                  size="xs"
                  color="coral"
                  loading={loading}
                  disabled={!editContent.trim()}
                  onClick={() => void handleUpdate()}
                  style={{ background: coralScale[5] }}
                >
                  저장
                </Button>
              </Group>
            </Stack>
          ) : (
            <Text
              size="sm"
              fw={300}
              c={text.secondary}
              style={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}
            >
              {comment.c_content}
            </Text>
          )}
        </Stack>
      </Group>
    </Box>
  );
}
