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

import { colors } from "@/tokens/color";

type LoginForm = {
  id: string;
  pwd: string;
};

export default function LoginPage() {
  const [form, setForm] = useState<LoginForm>({
    id: "",
    pwd: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (name: keyof LoginForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("로그인 실패");
      }

      const data = await response.json();
      console.log("로그인 성공:", data);

      alert("로그인되었습니다.");
    } catch (error) {
      console.error(error);
      alert("아이디 또는 비밀번호를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: colors.gradient.bg,
        padding: "56px 16px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container size={420} w="100%">
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
          <Stack gap="lg">
            <Box ta="center">
              <Title
                order={2}
                style={{
                  color: colors.text.primary,
                  fontWeight: 800,
                }}
              >
                ON.AI 로그인
              </Title>

              <Text
                mt={8}
                size="sm"
                style={{
                  color: colors.text.secondary,
                }}
              >
                아이디와 비밀번호를 입력해주세요.
              </Text>
            </Box>

            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label="아이디"
                  placeholder="아이디를 입력하세요"
                  value={form.id}
                  onChange={(e) => handleChange("id", e.target.value)}
                  required
                  styles={inputStyles}
                />

                <PasswordInput
                  label="비밀번호"
                  placeholder="비밀번호를 입력하세요"
                  value={form.pwd}
                  onChange={(e) => handleChange("pwd", e.target.value)}
                  required
                  styles={inputStyles}
                />

                <Button
                  type="submit"
                  loading={loading}
                  fullWidth
                  radius="xl"
                  size="md"
                  mt="sm"
                  style={{
                    background: colors.gradient.primary,
                    boxShadow: colors.shadow.btn,
                    fontWeight: 700,
                  }}
                >
                  로그인
                </Button>

                <Text
                  ta="center"
                  size="sm"
                  style={{
                    color: colors.text.secondary,
                  }}
                >
                  아직 계정이 없나요?{" "}
                  <a
                    href="/signup"
                    style={{
                      color: colors.coral[600],
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    회원가입
                  </a>
                </Text>
              </Stack>
            </form>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
}

const inputStyles = {
  label: {
    color: colors.text.primary,
    fontWeight: 700,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface.subtle,
    borderColor: colors.border.default,
    color: colors.text.primary,
  },
};