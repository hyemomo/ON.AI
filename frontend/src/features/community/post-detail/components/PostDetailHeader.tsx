import {
  AppShell,
  Container,
  Group,
  Text,
  ActionIcon,
  Breadcrumbs,
  Anchor,
  Menu,
  Tooltip,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconBookmark,
  IconBookmarkFilled,
  IconShare3,
  IconDots,
  IconFlag,
} from "@tabler/icons-react";

import type { Post } from "@/features/community/post-detail/types/types";
import { coralScale, surface, text, border } from "@/tokens/color";

interface PostDetailHeaderProps {
  post: Post;
  bookmarked: boolean;
  onBack?: () => void;
  onBookmark: () => void;
}

export function PostDetailHeader({
  post,
  bookmarked,
  onBack,
  onBookmark,
}: PostDetailHeaderProps) {
  return (
    <AppShell.Header
      style={{
        background: "rgba(255,248,248,0.92)",
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${border.default}`,
      }}
    >
      <Container size="xl" h="100%">
        <Group h="100%" justify="space-between">
          <Group gap="sm">
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

            <Breadcrumbs
              separator="›"
              separatorMargin={6}
              styles={{ separator: { color: text.muted } }}
            >
              <Anchor
                size="sm"
                c={text.muted}
                style={{ textDecoration: "none" }}
              >
                커뮤니티
              </Anchor>
              <Anchor
                size="sm"
                c={text.muted}
                style={{ textDecoration: "none" }}
              >
                건강·증상
              </Anchor>
              <Text
                size="sm"
                c={text.primary}
                fw={500}
                lineClamp={1}
                style={{ maxWidth: 240 }}
              >
                {post.p_title}
              </Text>
            </Breadcrumbs>
          </Group>

          <Group gap="xs">
            <Tooltip label="북마크" radius="md">
              <ActionIcon
                variant="subtle"
                size={36}
                radius="xl"
                onClick={onBookmark}
                style={{
                  border: `1.5px solid ${border.default}`,
                  background: surface.subtle,
                }}
              >
                {bookmarked ? (
                  <IconBookmarkFilled size={16} color={coralScale[5]} />
                ) : (
                  <IconBookmark size={16} color={text.muted} />
                )}
              </ActionIcon>
            </Tooltip>

            <Tooltip label="공유" radius="md">
              <ActionIcon
                variant="subtle"
                size={36}
                radius="xl"
                style={{
                  border: `1.5px solid ${border.default}`,
                  background: surface.subtle,
                }}
              >
                <IconShare3 size={16} color={text.muted} />
              </ActionIcon>
            </Tooltip>

            <Menu shadow="md" radius="md" width={150}>
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  size={36}
                  radius="xl"
                  style={{
                    border: `1.5px solid ${border.default}`,
                    background: surface.subtle,
                  }}
                >
                  <IconDots size={16} color={text.muted} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown style={{ borderColor: border.default }}>
                <Menu.Item leftSection={<IconFlag size={13} />} color="gray">
                  <Text size="sm">신고하기</Text>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Container>
    </AppShell.Header>
  );
}
