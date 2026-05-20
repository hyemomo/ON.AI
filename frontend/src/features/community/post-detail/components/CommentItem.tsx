import type { Comment } from "@/features/community/post-detail/types/types";
import { border, coralScale, text } from "@/tokens/color";
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Group,
  Indicator,
  Menu,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconDots,
  IconEdit,
  IconFlag,
  IconHeart,
  IconHeartFilled,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";

const CommentItem = ({ comment }: { comment: Comment }) => {
  const [liked, setLiked] = useState(comment.liked ?? false);
  const [likeCount, setLikeCount] = useState(comment.likes);

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <Box>
      <Group align="flex-start" gap="sm" pl={0}>
        <Indicator
          color="green"
          size={8}
          offset={3}
          position="bottom-end"
          disabled={!comment.isAuthor}
        >
          <Avatar
            size={36}
            radius="xl"
            style={{
              border: `1.5px solid ${border.default}`,
              flexShrink: 0,
            }}
          >
            {comment.emoji}
          </Avatar>
        </Indicator>

        <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
          {/* 작성자 정보 */}
          <Group gap={8} justify="space-between">
            <Group gap={6}>
              <Text size="sm" fw={600} c={text.primary}>
                {comment.author}
              </Text>

              {comment.authorLevel && (
                <Badge size="xs" color="coral" variant="light">
                  {comment.authorLevel}
                </Badge>
              )}

              {comment.isAuthor && (
                <Badge size="xs" color="teal" variant="filled">
                  작성자
                </Badge>
              )}

              <Text size="xs" c={text.muted}>
                {comment.childAge} · {comment.timeAgo}
              </Text>
            </Group>

            {/* 더보기 메뉴 */}
            <Menu shadow="md" radius="md" width={140}>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" size="sm" radius="xl">
                  <IconDots size={14} color={text.muted} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown style={{ borderColor: border.default }}>
                <Menu.Item leftSection={<IconFlag size={13} />} >
                  <Text size="xs">신고하기</Text>
                </Menu.Item>

                {comment.isAuthor && (
                  <>
                    <Menu.Item leftSection={<IconEdit size={13} />}>
                      <Text size="xs">수정하기</Text>
                    </Menu.Item>

                    <Menu.Item
                      leftSection={<IconTrash size={13} />}
                      color="red"
                    >
                      <Text size="xs">삭제하기</Text>
                    </Menu.Item>
                  </>
                )}
              </Menu.Dropdown>
            </Menu>
          </Group>

          {/* 댓글 본문 */}
          <Text
            size="sm"
            fw={300}
            c={text.secondary}
            style={{ lineHeight: 1.7 }}
          >
            {comment.body}
          </Text>

          {/* 액션 */}
          <Group gap="xs">
            <Button
              variant="subtle"
              size="xs"
              color={liked ? "coral" : "gray"}
              leftSection={
                liked ? <IconHeartFilled size={12} /> : <IconHeart size={12} />
              }
              onClick={handleLike}
              px={8}
              style={{
                fontWeight: 500,
                height: 28,
                color: liked ? coralScale[6] : text.muted,
              }}
            >
              {likeCount}
            </Button>
          </Group>
        </Stack>
      </Group>
    </Box>
  );
};

export default CommentItem;
