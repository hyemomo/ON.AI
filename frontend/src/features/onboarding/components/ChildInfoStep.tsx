import {
  Box,
  Button,
  Card,
  Container,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { colors } from "@/tokens/color";

export default function ChildInfoStep() {
  const navigate = useNavigate();

  const [children, setChildren] = useState([
    {
      child_name: "",
      child_birth: "",
      child_gender: "",
    },
  ]);

  const handleChange = (
    index: number,
    key: keyof (typeof children)[number],
    value: string,
  ) => {
    setChildren((prev) =>
      prev.map((child, i) =>
        i === index ? { ...child, [key]: value } : child,
      ),
    );
  };

  const addChild = () => {
    setChildren((prev) => [
      ...prev,
      {
        child_name: "",
        child_birth: "",
        child_gender: "",
      },
    ]);
  };

  const handleSubmit = async () => {
    await fetch("http://127.0.0.1:8000/mypage/me/children", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({ children }),
    });

    navigate("/onboarding/interests");
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: colors.gradient.bg,
        padding: "56px 16px",
      }}
    >
      <Container size="sm">
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
                자녀 정보 입력
              </Title>

              <Text
                mt={8}
                size="sm"
                style={{
                  color: colors.text.secondary,
                }}
              >
                맞춤 육아 정보를 제공하기 위해 자녀 정보를 입력해주세요.
              </Text>
            </Box>

            <Stack gap="md">
              {children.map((child, index) => (
                <Card
                  key={index}
                  radius="lg"
                  p="md"
                  withBorder
                  style={{
                    backgroundColor: colors.surface.subtle,
                    borderColor: colors.border.default,
                  }}
                >
                  <Stack gap="md">
                    <Text
                      size="sm"
                      style={{
                        color: colors.text.primary,
                        fontWeight: 700,
                      }}
                    >
                      자녀 {index + 1}
                    </Text>

                    <TextInput
                      label="자녀 이름"
                      placeholder="자녀 이름을 입력하세요"
                      value={child.child_name}
                      onChange={(e) =>
                        handleChange(index, "child_name", e.currentTarget.value)
                      }
                      required
                      styles={inputStyles}
                    />

                    <TextInput
                      label="자녀 생년월일"
                      type="date"
                      value={child.child_birth}
                      onChange={(e) =>
                        handleChange(
                          index,
                          "child_birth",
                          e.currentTarget.value,
                        )
                      }
                      required
                      styles={inputStyles}
                    />

                    <Select
                      label="자녀 성별"
                      placeholder="성별을 선택하세요"
                      data={[
                        { value: "male", label: "남아" },
                        { value: "female", label: "여아" },
                      ]}
                      value={child.child_gender}
                      onChange={(value) =>
                        handleChange(index, "child_gender", value ?? "")
                      }
                      required
                      styles={inputStyles}
                    />
                  </Stack>
                </Card>
              ))}

              <Button
                variant="light"
                radius="xl"
                onClick={addChild}
                style={{
                  color: colors.text.primary,
                  fontWeight: 700,
                }}
              >
                자녀 추가
              </Button>

              <Group justify="center" mt="md">
                <Button
                  onClick={handleSubmit}
                  fullWidth
                  radius="xl"
                  size="md"
                  style={{
                    background: colors.gradient.primary,
                    boxShadow: colors.shadow.btn,
                    fontWeight: 700,
                  }}
                >
                  다음
                </Button>
              </Group>
            </Stack>
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
    backgroundColor: colors.surface.white,
    borderColor: colors.border.default,
    color: colors.text.primary,
  },
};
