import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Image,
  Stack,
  Text,
} from "@mantine/core";
import React from "react";
import { text, border } from "@/tokens/color";
import {
  IconHeart,
  IconHeartFilled,
  IconMessageCircle,
} from "@tabler/icons-react";
import type { Post } from '@/features/community/post-detail/types/types';
import { useNavigate } from 'react-router-dom';
import { usePostLike } from '@/features/community/hooks/usePostLike';

const PostContentCard = ({
  post,
  commentCount,
}: {
  post: Post;
  commentCount?: number;
}) => {
  const { liked, likeCount, toggleLike } = usePostLike({
    postnum: post.postnum,
    initialLiked: post.is_liked,
    initialLikeCount: post.like_count,
  });
  const navigate = useNavigate();
  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike();
  };
  const handleClickCard = () => {
    navigate(`/community/posts/${post.postnum}`);
  };
  return (
    <Card
      onClick={handleClickCard}
      p="lg"
      withBorder
      style={{
        cursor: "pointer",
        borderColor: border.default,
      }}
    >
      {/* 헤더 */}
      <Group justify="space-between" mb="sm">
        <Group gap="sm">
          <Avatar
            radius="xl"
            size={38}
            style={{ border: `1.5px solid ${border.default}` }}
          >
            {post.nickname?.[0] ?? "?"}
          </Avatar>

          <Stack gap={2}>
            <Text size="sm" fw={600} c={text.primary}>
              {post.nickname}
            </Text>

            <Text size="xs" c={text.muted}>
              {post.p_region_tag} · {post.p_created_at}
            </Text>
          </Stack>
        </Group>

        <Badge size="sm" color="coral" variant="light">
          {post.p_category_tag}
        </Badge>
      </Group>

      {/* 본문 */}
      <Text
        fw={600}
        size="md"
        mb={6}
        c={text.primary}
        style={{ lineHeight: 1.45, letterSpacing: "-0.15px" }}
      >
        {post.p_title}
      </Text>

      <Text
        size="sm"
        fw={300}
        c={text.secondary}
        mb="sm"
        lineClamp={2}
        style={{ lineHeight: 1.7 }}
      >
        {post.p_content}
      </Text>

      {/* 이미지 */}
      {post.image_urls.length > 0 && (
        <Group gap="xs" mb="sm">
          {post.image_urls.map((imageUrl, index) => (
            <Box
              key={index}
              style={{
                width: 80,
                height: 80,
                borderRadius: 12,
                overflow: "hidden",
                border: `1px solid ${border.default}`,
              }}
            >
              <Image
                src={imageUrl}
                alt={`게시글 이미지 ${index + 1}`}
                width={80}
                height={80}
                fit="cover"
              />
            </Box>
          ))}
        </Group>
      )}

      <Divider color={border.default} mb="sm" />

      {/* 액션 */}
      <Group gap="xs">
        <Button
          variant="subtle"
          size="xs"
          color={liked ? "coral" : "gray"}
          leftSection={
            liked ? <IconHeartFilled size={14} /> : <IconHeart size={14} />
          }
          onClick={handleToggleLike}
          style={{ fontWeight: 500 }}
        >
          {likeCount}
        </Button>
        <Button
          variant="subtle"
          size="xs"
          color="gray"
          leftSection={<IconMessageCircle size={14} />}
          style={{ fontWeight: 500, color: text.muted }}
        >
          {commentCount ?? post.comment_count}
        </Button>

        <Box style={{ flex: 1 }} />

        <Text size="xs" c={text.muted}>
          작성자 #{post.p_user}
        </Text>
      </Group>
    </Card>
  );
};

export default PostContentCard;
