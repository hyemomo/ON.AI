import type { Post } from '@/features/community/post-detail/types/types';
import { Avatar, Badge, Box, Button, Card, Divider, Group, Stack, Text } from '@mantine/core';
import React, { useState } from "react";
import { coralScale,  text, border, gradient } from "@/tokens/color";
import { IconFlame, IconHeart, IconHeartFilled, IconMessageCircle, IconShare3 } from '@tabler/icons-react';

const PostContentCard = ({ post }: { post: Post }) => {
  const [liked, setLiked] = useState(post.liked ?? false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <Card
      p="lg"
      style={{
        cursor: "pointer",
        borderColor: post.isHot ? coralScale[2] : border.default,
      }}
    >
      {/* HOT 배지 스트립 */}
      {post.isHot && (
        <Card.Section
          style={{
            background: gradient.primary,
            padding: "4px 16px",
            marginBottom: 16,
          }}
        >
          <Group gap={6}>
            <IconFlame size={12} color="white" />
            <Text
              size="xs"
              fw={700}
              c="white"
              style={{ letterSpacing: "0.06em" }}
            >
              HOT
            </Text>
          </Group>
        </Card.Section>
      )}

      {/* 헤더 */}
      <Group justify="space-between" mb="sm">
        <Group gap="sm">
          <Avatar
            radius="xl"
            size={38}
            style={{ border: `1.5px solid ${border.default}` }}
          >
            {post.emoji}
          </Avatar>
          <Stack gap={2}>
            <Group gap={6}>
              <Text size="sm" fw={600} c={text.primary}>
                {post.author}
              </Text>
              {post.authorLevel && (
                <Badge size="xs" color="coral" variant="light">
                  {post.authorLevel}
                </Badge>
              )}
            </Group>
            <Text size="xs" c={text.muted}>
              {post.childAge} · {post.timeAgo}
            </Text>
          </Stack>
        </Group>
        <Badge size="sm" color={post.categoryColor} variant="light">
          {post.category}
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
        {post.title}
      </Text>
      <Text
        size="sm"
        fw={300}
        c={text.secondary}
        mb="sm"
        lineClamp={2}
        style={{ lineHeight: 1.7 }}
      >
        {post.body}
      </Text>

      {/* 이미지 */}
      {post.images && (
        <Group gap="xs" mb="sm">
          {post.images.map((img, i) => (
            <Box
              key={i}
              style={{
                width: 80,
                height: 80,
                borderRadius: 12,
                background: coralScale[1],
                border: `1px solid ${border.default}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
              }}
            >
              {img}
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
          onClick={toggleLike}
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
          {post.comments}
        </Button>
        <Button
          variant="subtle"
          size="xs"
          color="gray"
          leftSection={<IconShare3 size={14} />}
          style={{ fontWeight: 500, color: text.muted }}
        >
          공유
        </Button>
        <Box style={{ flex: 1 }} />
        <Text size="xs" c={text.muted}>
          조회 {post.views.toLocaleString()}
        </Text>
      </Group>
    </Card>
  );
};
export default PostContentCard;
