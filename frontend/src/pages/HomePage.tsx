import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import { colors } from "@/tokens/color";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: colors.gradient.bg,
        display: "flex",
        alignItems: "center",
        padding: "40px 16px",
      }}
    >
      <Container size="sm" w="100%">
        <Card
          radius="xl"
          p="xl"
          withBorder
          style={{
            backgroundColor: colors.surface.white,
            borderColor: colors.border.default,
            boxShadow: colors.shadow.cardHover,
          }}
        >
          <Stack gap="xl" align="center">
            <Box ta="center">
              <Title
                order={1}
                style={{
                  color: colors.text.primary,
                  fontWeight: 900,
                  fontSize: "36px",
                }}
              >
                ON.AI
              </Title>

              <Text
                mt="sm"
                size="md"
                style={{
                  color: colors.text.secondary,
                  lineHeight: 1.6,
                }}
              >
                육아 고민을 나누고, 필요한 정보를 함께 찾아가는 공간입니다.
              </Text>
            </Box>

            <Group w="100%" grow>
              <Button
                size="lg"
                radius="xl"
                onClick={() => navigate("/chat")}
                style={{
                  background: colors.gradient.primary,
                  boxShadow: colors.shadow.btn,
                  fontWeight: 700,
                }}
              >
                챗봇 시작하기
              </Button>

              <Button
                size="lg"
                radius="xl"
                variant="light"
                onClick={() => navigate("/community")}
                styles={{
                  root: {
                    backgroundColor: colors.coral[50],
                    color: colors.coral[700],
                    border: `1px solid ${colors.border.strong}`,
                    fontWeight: 700,
                  },
                }}
              >
                커뮤니티 가기
              </Button>
            </Group>

            <Text
              size="sm"
              ta="center"
              style={{
                color: colors.text.muted,
              }}
            >
              로그인 후 챗봇과 커뮤니티 기능을 사용할 수 있어요.
            </Text>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
}
