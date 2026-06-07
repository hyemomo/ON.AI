import { Avatar, Badge, Box, Group, Stack, Text } from "@mantine/core";
import { IconMessageCircleHeart } from "@tabler/icons-react";
import { border, coralScale, surface, text } from "@/tokens/color";

export default function ChatHeader() {
  return (
    <Box
      px="lg"
      py="md"
      style={{
        background: surface.white,
        borderBottom: `1px solid ${border.default}`,
      }}
    >
      <Group justify="space-between" align="center">
        <Group gap="sm">
          <Avatar
            radius="xl"
            color="coral"
            size={44}
            style={{
              border: `1.5px solid ${border.default}`,
            }}
          >
            <IconMessageCircleHeart size={24} />
          </Avatar>

          <Stack gap={2}>
            <Group gap="xs">
              <Text fw={800} size="md" c={text.primary}>
                ON.AI 챗봇
              </Text>

              <Badge color="coral" variant="light" size="sm">
                AI 상담
              </Badge>
            </Group>

            <Text size="xs" c={text.muted}>
              육아 고민을 편하게 이야기해보세요.
            </Text>
          </Stack>
        </Group>

        <Box
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: coralScale[5],
            boxShadow: "0 0 0 4px rgba(255, 111, 118, 0.14)",
          }}
        />
      </Group>
    </Box>
  );
}
