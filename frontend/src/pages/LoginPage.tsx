import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Container,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { saveAccessToken } from "@/lib/auth";
import { coralScale, gradient, shadow, surface, text } from "@/tokens/color";

type LoginForm = {
  id: string;
  pwd: string;
};

type LoginResponse = {
  message: string;
  access_token: string;
  token_type: string;
  user: unknown;
};

export default function LoginPage() {
  const [form, setForm] = useState<LoginForm>({ id: "", pwd: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (name: keyof LoginForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const loginId = form.id.trim();
    const loginPwd = form.pwd;

    if (!loginId || !loginPwd) {
      alert("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      const data = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        auth: false,
        json: {
          id: loginId,
          pwd: loginPwd,
        },
      });

      saveAccessToken(data.access_token);
      alert("로그인되었습니다.");
      navigate("/community", { replace: true });
    } catch (error) {
      console.error("로그인 실패:", error);

      const message =
        error instanceof Error
          ? error.message
          : "아이디 또는 비밀번호를 확인해주세요.";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(150deg, #fff5f6 0%, #ffe8ec 45%, #ffd6dd 100%)",
        display: "flex",
        alignItems: "center",
        padding: "48px 16px",
      }}
    >
      <Container size={420} w="100%">
        <Card p="xl" radius="xl" shadow="md" withBorder bg={surface.white}>
          <form onSubmit={handleSubmit}>
            <Stack gap="lg">
              <Stack gap={4} align="center">
                <Text size="44px" lh={1}>
                  🤱
                </Text>

                <Title order={2} ta="center" c={text.primary}>
                  ON<span style={{ color: coralScale[5] }}>.</span>AI 로그인
                </Title>

                <Text size="sm" c={text.secondary} ta="center">
                  로그인 후 커뮤니티와 챗봇을 사용할 수 있습니다.
                </Text>
              </Stack>

              <Stack gap="sm">
                <TextInput
                  label="아이디"
                  placeholder="아이디를 입력하세요"
                  value={form.id}
                  onChange={(e) => handleChange("id", e.currentTarget.value)}
                  required
                />

                <PasswordInput
                  label="비밀번호"
                  placeholder="비밀번호를 입력하세요"
                  value={form.pwd}
                  onChange={(e) => handleChange("pwd", e.currentTarget.value)}
                  required
                />
              </Stack>

              <Button
                type="submit"
                size="md"
                radius="xl"
                loading={loading}
                style={{ background: gradient.primary, boxShadow: shadow.btn }}
              >
                로그인
              </Button>

              <Button
                type="button"
                variant="subtle"
                color="coral"
                onClick={() => navigate("/signup")}
              >
                아직 계정이 없으신가요? 회원가입
              </Button>
            </Stack>
          </form>
        </Card>
      </Container>
    </Box>
  );
}
