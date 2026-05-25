import type { Comment } from "@/features/community/post-detail/types/types";
import { border, text } from "@/tokens/color";
import {
  ActionIcon,
  Avatar,
  Box,
  Group,
  Menu,
  Stack,
  Text,
} from "@mantine/core";
import { IconDots, IconEdit, IconFlag, IconTrash } from "@tabler/icons-react";

const CommentItem = ({ comment }: { comment: Comment }) => {
  return (
    <Box>
      <Group align="flex-start" gap="sm" pl={0}>
        <Avatar
          size={36}
          radius="xl"
          style={{
            border: `1.5px solid ${border.default}`,
            flexShrink: 0,
          }}
        >
          {comment.nickname?.[0] ?? "?"}
        </Avatar>

        <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
          <Group gap={8} justify="space-between">
            <Group gap={6}>
              <Text size="sm" fw={600} c={text.primary}>
                {comment.nickname}
              </Text>

              <Text size="xs" c={text.muted}>
                {comment.c_created_at}
              </Text>
            </Group>

            <Menu shadow="md" radius="md" width={140}>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" size="sm" radius="xl">
                  <IconDots size={14} color={text.muted} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown style={{ borderColor: border.default }}>
                <Menu.Item leftSection={<IconFlag size={13} />}>
                  <Text size="xs">신고하기</Text>
                </Menu.Item>

                <Menu.Item leftSection={<IconEdit size={13} />}>
                  <Text size="xs">수정하기</Text>
                </Menu.Item>

                <Menu.Item leftSection={<IconTrash size={13} />} color="red">
                  <Text size="xs">삭제하기</Text>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>

          <Text
            size="sm"
            fw={300}
            c={text.secondary}
            style={{ lineHeight: 1.7 }}
          >
            {comment.c_content}
          </Text>
        </Stack>
      </Group>
    </Box>
  );
};

export default CommentItem;
