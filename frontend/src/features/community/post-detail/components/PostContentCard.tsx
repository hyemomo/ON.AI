import { useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Image,
  Modal,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconEdit,
  IconHeart,
  IconMessageCircle,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { formatDateTime, toStaticUrl } from "@/lib/api";
import UserProfileAvatar from "@/components/UserProfileAvatar";
import { usePostLike } from "@/features/community/hooks/usePostLike";
import type { Post } from "@/features/community/post-detail/types/types";
import { border, coralScale, shadow, surface, text } from "@/tokens/color";

type PostContentCardProps = {
  post: Post;
  commentCount?: number;
  currentUsernum?: number;
  isDetailPage?: boolean;
  onDelete?: (postnum: number) => void | Promise<void>;
};

export default function PostContentCard({
  post,
  commentCount,
  currentUsernum,
  isDetailPage = false,
  onDelete,
}: PostContentCardProps) {
  const navigate = useNavigate();

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );

  const { liked, likeCount, toggleLike } = usePostLike({
    postnum: post.postnum,
    initialLiked: post.is_liked,
    initialLikeCount: post.like_count ?? 0,
  });

  const isOwner = currentUsernum === post.p_user;
  const displayCommentCount = commentCount ?? post.comment_count ?? 0;

  const imageUrls = post.image_urls ?? [];
  const visibleImageUrls = isDetailPage ? imageUrls : imageUrls.slice(0, 3);

  const isImageModalOpen = selectedImageIndex !== null;
  const selectedImageUrl =
    selectedImageIndex !== null ? imageUrls[selectedImageIndex] : null;

  const handleGoDetail = () => {
    if (isDetailPage) return;
    navigate(`/community/posts/${post.postnum}`);
  };

  const handleOpenImage = (index: number) => {
    if (!isDetailPage) return;
    setSelectedImageIndex(index);
  };

  const handleCloseImage = () => {
    setSelectedImageIndex(null);
  };

  const handlePrevImage = () => {
    if (selectedImageIndex === null || imageUrls.length <= 1) return;

    setSelectedImageIndex((prev) => {
      if (prev === null) return prev;
      return prev === 0 ? imageUrls.length - 1 : prev - 1;
    });
  };

  const handleNextImage = () => {
    if (selectedImageIndex === null || imageUrls.length <= 1) return;

    setSelectedImageIndex((prev) => {
      if (prev === null) return prev;
      return prev === imageUrls.length - 1 ? 0 : prev + 1;
    });
  };

  const handleLikeClick = async () => {
    await toggleLike();
  };

  const handleCommentClick = () => {
    if (isDetailPage) return;
    navigate(`/community/posts/${post.postnum}`);
  };

  return (
    <>
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
              <UserProfileAvatar
                profileImageUrl={post.profile_image_url}
                nickname={post.nickname}
                size={44}
              />

              <Stack gap={2}>
                <Text fw={800} c={text.primary}>
                  {post.nickname || "알 수 없음"}
                </Text>

                <Text size="xs" c={text.muted}>
                  {formatDateTime(post.p_created_at)}
                </Text>
              </Stack>
            </Group>

            {isOwner && isDetailPage && (
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
            onClick={handleGoDetail}
            style={{
              cursor: isDetailPage ? "default" : "pointer",
            }}
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
                  ...(isDetailPage
                    ? {}
                    : {
                        display: "-webkit-box",
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }),
                }}
              >
                {post.p_content}
              </Text>
            </Stack>
          </Box>

          {imageUrls.length > 0 && (
            <Group gap="xs" wrap="wrap">
              {visibleImageUrls.map((imageUrl, index) => (
                <Box
                  key={`${imageUrl}-${index}`}
                  component="button"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleOpenImage(index);
                  }}
                  style={{
                    width: isDetailPage ? 128 : 112,
                    height: isDetailPage ? 128 : 112,
                    padding: 0,
                    borderRadius: 14,
                    overflow: "hidden",
                    border: `1px solid ${border.default}`,
                    background: surface.subtle,
                    position: "relative",
                    cursor: isDetailPage ? "pointer" : "default",
                  }}
                >
                  <Image
                    src={toStaticUrl(imageUrl)}
                    alt="게시글 이미지"
                    width={isDetailPage ? 128 : 112}
                    height={isDetailPage ? 128 : 112}
                    fit="cover"
                    style={{
                      width: "100%",
                      height: "100%",
                      pointerEvents: "none",
                    }}
                  />

                  {!isDetailPage && index === 2 && imageUrls.length > 3 && (
                    <Box
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.45)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none",
                      }}
                    >
                      <Text c="white" fw={800}>
                        +{imageUrls.length - 3}
                      </Text>
                    </Box>
                  )}
                </Box>
              ))}
            </Group>
          )}

          <Divider color={border.default} />

          <Group justify="flex-start" gap="xs">
            <Button
              variant={liked ? "light" : "subtle"}
              color="coral"
              radius="xl"
              size="xs"
              leftSection={
                <IconHeart
                  size={14}
                  fill={liked ? coralScale[5] : "none"}
                  color={liked ? coralScale[5] : undefined}
                />
              }
              onClick={(event) => {
                event.stopPropagation();
                void handleLikeClick();
              }}
            >
              {likeCount}
            </Button>

            <Button
              variant="subtle"
              color="gray"
              radius="xl"
              size="xs"
              leftSection={<IconMessageCircle size={14} />}
              onClick={(event) => {
                event.stopPropagation();
                handleCommentClick();
              }}
            >
              {displayCommentCount}
            </Button>
          </Group>
        </Stack>
      </Card>

      <Modal
        opened={isImageModalOpen}
        onClose={handleCloseImage}
        centered
        size="xl"
        padding={0}
        withCloseButton={false}
        styles={{
          content: {
            background: "rgba(20, 20, 20, 0.96)",
            overflow: "hidden",
          },
          body: {
            padding: 0,
          },
        }}
      >
        <Box
          style={{
            position: "relative",
            width: "100%",
            minHeight: "72vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "52px 56px",
          }}
        >
          <ActionIcon
            variant="filled"
            color="dark"
            radius="xl"
            size="lg"
            onClick={handleCloseImage}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              zIndex: 3,
              background: "rgba(255,255,255,0.16)",
            }}
          >
            <IconX size={20} />
          </ActionIcon>

          {imageUrls.length > 1 && (
            <ActionIcon
              variant="filled"
              color="dark"
              radius="xl"
              size="xl"
              onClick={handlePrevImage}
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 3,
                background: "rgba(255,255,255,0.16)",
              }}
            >
              <IconChevronLeft size={26} />
            </ActionIcon>
          )}

          {selectedImageUrl && (
            <Image
              src={toStaticUrl(selectedImageUrl)}
              alt="확대된 게시글 이미지"
              fit="contain"
              style={{
                maxWidth: "100%",
                maxHeight: "72vh",
                objectFit: "contain",
              }}
            />
          )}

          {imageUrls.length > 1 && (
            <ActionIcon
              variant="filled"
              color="dark"
              radius="xl"
              size="xl"
              onClick={handleNextImage}
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 3,
                background: "rgba(255,255,255,0.16)",
              }}
            >
              <IconChevronRight size={26} />
            </ActionIcon>
          )}

          {imageUrls.length > 1 && selectedImageIndex !== null && (
            <Text
              size="sm"
              c="white"
              fw={700}
              style={{
                position: "absolute",
                bottom: 18,
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(255,255,255,0.16)",
                padding: "6px 12px",
                borderRadius: 999,
              }}
            >
              {selectedImageIndex + 1} / {imageUrls.length}
            </Text>
          )}
        </Box>
      </Modal>
    </>
  );
}
