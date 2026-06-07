import {
  ActionIcon,
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
import {
  IconEdit,
  IconHeart,
  IconMessageCircle,
  IconTrash,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { formatDateTime, toStaticUrl } from "@/lib/api";
import type { Post } from "@/features/community/post-detail/types/types";
import { border, shadow, surface, text } from "@/tokens/color";

type PostContentCardProps = {
  post: Post;
  commentCount?: number;
  currentUsernum?: number;
  onDelete?: (postnum: number) => void | Promise<void>;
};

export default function PostContentCard({
  post,
  commentCount,
  currentUsernum,
  onDelete,
}: PostContentCardProps) {
  const navigate = useNavigate();

  const isOwner = currentUsernum === post.p_user;
  const displayCommentCount = commentCount ?? post.comment_count ?? 0;
  const profileImageSrc = toStaticUrl(post.profile_image_url);

  return (
    <Card
      p="xl"
      radius="xl"
      withBorder
      style={{
        background: surface.white,
        borderColor: border.default,
        boxShadow: shadow.card,
      }}
    >
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group gap="sm" align="center">
            <Avatar
              src={profileImageSrc}
              radius="xl"
              size={44}
              color="coral"
              style={{
                border: `1.5px solid ${border.default}`,
                flexShrink: 0,
              }}
            >
              {post.nickname?.[0] ?? "?"}
            </Avatar>

            <Stack gap={2}>
              <Text fw={800} c={text.primary}>
                {post.nickname || "알 수 없음"}
              </Text>

              <Group gap={6}>
                <Text size="xs" c={text.muted}>
                  {formatDateTime(post.p_created_at)}
                </Text>

                <Text size="xs" c={text.muted}>
                  ·
                </Text>

                <Text size="xs" c={text.muted}>
                  {post.p_region_tag}
                </Text>
              </Group>
            </Stack>
          </Group>

          {isOwner && (
            <Group gap={4}>
              <ActionIcon
                variant="subtle"
                color="gray"
                radius="xl"
                onClick={() =>
                  navigate(`/community/posts/${post.postnum}/edit`)
                }
              >
                <IconEdit size={16} color={text.muted} />
              </ActionIcon>

              <ActionIcon
                variant="subtle"
                color="red"
                radius="xl"
                onClick={() => void onDelete?.(post.postnum)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          )}
        </Group>

        <Group gap="xs">
          <Badge color="coral" variant="light">
            {post.p_category_tag}
          </Badge>

          <Badge color="gray" variant="light">
            {post.p_region_tag}
          </Badge>
        </Group>

        <Box
          onClick={() => navigate(`/community/posts/${post.postnum}`)}
          style={{ cursor: "pointer" }}
        >
          <Stack gap="sm">
            <Text fw={800} size="lg" c={text.primary} lh={1.35}>
              {post.p_title}
            </Text>

            <Text
              size="sm"
              c={text.secondary}
              style={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.7,
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {post.p_content}
            </Text>
          </Stack>
        </Box>

        {post.image_urls?.length > 0 && (
          <Group gap="xs" wrap="wrap">
            {post.image_urls.slice(0, 3).map((imageUrl, index) => (
              <Box
                key={`${imageUrl}-${index}`}
                style={{
                  width: 112,
                  height: 112,
                  borderRadius: 14,
                  overflow: "hidden",
                  border: `1px solid ${border.default}`,
                  background: surface.subtle,
                  position: "relative",
                }}
              >
                <Image
                  src={toStaticUrl(imageUrl)}
                  alt="게시글 이미지"
                  width={112}
                  height={112}
                  fit="cover"
                />

                {index === 2 && post.image_urls.length > 3 && (
                  <Box
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.45)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text c="white" fw={800}>
                      +{post.image_urls.length - 3}
                    </Text>
                  </Box>
                )}
              </Box>
            ))}
          </Group>
        )}

        <Divider color={border.default} />

        <Group justify="space-between">
          <Group gap="xs">
            <Button
              variant="subtle"
              color="coral"
              radius="xl"
              size="xs"
              leftSection={<IconHeart size={14} />}
            >
              {post.like_count ?? 0}
            </Button>

            <Button
              variant="subtle"
              color="gray"
              radius="xl"
              size="xs"
              leftSection={<IconMessageCircle size={14} />}
            >
              {displayCommentCount}
            </Button>
          </Group>

          <Button
            size="xs"
            radius="xl"
            variant="light"
            color="coral"
            onClick={() => navigate(`/community/posts/${post.postnum}`)}
            style={{
              boxShadow: shadow.card,
            }}
          >
            자세히 보기
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
