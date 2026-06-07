import { Box, Button, Container, Stack, Text, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { coralScale, gradient, shadow, text } from "@/tokens/color";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Box
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(150deg, #fff5f6 0%, #ffe8ec 45%, #ffd6dd 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      <Container size="xs" w="100%">
        <Stack align="center" gap="xl">
          <Stack align="center" gap={8}>
            <Text size="64px" lh={1}>
              🤱
            </Text>

            <Title
              order={1}
              ta="center"
              style={{
                fontSize: "clamp(56px, 12vw, 84px)",
                fontWeight: 900,
                letterSpacing: "-3px",
                color: text.primary,
              }}
            >
              ON<span style={{ color: coralScale[5] }}>.</span>AI
            </Title>

            <Text ta="center" c={text.secondary} size="md" maw={360}>
              아이뿐만 아니라, 부모도 함께 돌보는 AI 육아 케어 서비스
            </Text>
          </Stack>

          <Stack w="100%" gap="sm">
            <Button
              size="lg"
              radius="xl"
              onClick={() => navigate("/login")}
              style={{ background: gradient.primary, boxShadow: shadow.btn }}
            >
              로그인
            </Button>

            <Button
              size="lg"
              radius="xl"
              variant="white"
              color="coral"
              onClick={() => navigate("/signup")}
            >
              회원가입
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
