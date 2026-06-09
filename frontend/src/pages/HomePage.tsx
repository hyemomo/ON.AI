import {
  Box,
  Button,
  Container,
  Image,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import onaiCharacter from "@/assets/images/onai-character.png";
import { coralScale, gradient, shadow, text } from "@/tokens/color";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Box
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 50% 20%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.42) 28%, rgba(255,255,255,0) 50%), linear-gradient(150deg, #fff7f8 0%, #ffe9ed 48%, #ffd7df 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "36px 16px",
        overflow: "hidden",
      }}
    >
      <Container size="xs" w="100%">
        <Stack align="center" gap="xl">
          <Stack align="center" gap={12}>
            <Box
              style={{
                position: "relative",
                width: "min(360px, 86vw)",
                height: "min(330px, 78vw)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                aria-hidden="true"
                style={{
                  position: "absolute",
                  bottom: 20,
                  width: "62%",
                  height: 24,
                  borderRadius: "999px",
                  background: "rgba(122, 74, 82, 0.12)",
                  filter: "blur(14px)",
                  transform: "scaleX(1.08)",
                }}
              />

              <Box
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 28,
                  right: 28,
                  width: 14,
                  height: 14,
                  borderRadius: "999px",
                  background: "rgba(255, 171, 64, 0.55)",
                }}
              />

              <Box
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 76,
                  left: 26,
                  width: 10,
                  height: 10,
                  borderRadius: "999px",
                  background: "rgba(255, 107, 122, 0.42)",
                }}
              />

              <Box
                aria-hidden="true"
                style={{
                  position: "absolute",
                  right: 8,
                  bottom: 92,
                  width: 9,
                  height: 9,
                  borderRadius: "999px",
                  background: "rgba(105, 194, 166, 0.48)",
                }}
              />

              <Image
                src={onaiCharacter}
                alt="ON.AI 대표 캐릭터"
                fit="contain"
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  filter: "drop-shadow(0 18px 20px rgba(122, 74, 82, 0.14))",
                }}
              />
            </Box>

            <Stack align="center" gap={8}>
              <Title
                order={1}
                ta="center"
                style={{
                  fontSize: "clamp(60px, 13vw, 88px)",
                  fontWeight: 900,
                  letterSpacing: "-3px",
                  color: text.primary,
                  lineHeight: 0.95,
                }}
              >
                ON<span style={{ color: coralScale[5] }}>.</span>AI
              </Title>

              <Text ta="center" c={text.secondary} size="md" maw={360}>
                아이뿐만 아니라, 부모도 함께 돌보는 AI 육아 케어 서비스
              </Text>
            </Stack>
          </Stack>

          <Stack w="100%" gap="sm">
            <Button
              size="lg"
              radius="xl"
              onClick={() => navigate("/login")}
              style={{
                background: gradient.primary,
                boxShadow: shadow.btn,
              }}
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
