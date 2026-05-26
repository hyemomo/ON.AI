import {
  Box,
  Button,
  Card,
  Container,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { colors } from "@/tokens/color";

const hobbyOptions = [
  "⚽ 축구",
  "🏀 농구",
  "🏸 배드민턴",
  "🏃 러닝",
  "💪 운동",
  "🚶 산책",
  "🧘 요가",
  "📖 독서",
  "✍️ 일기",
  "☕ 카페",
  "🍳 요리",
  "🥐 베이킹",
  "🎬 영화",
  "🎧 음악",
  "🎤 노래",
  "🎮 게임",
  "📷 사진",
  "🎨 그림",
  "🧶 공예",
  "🌱 식물 키우기",
  "✈️ 여행",
  "🏕️ 캠핑",
  "🛍️ 쇼핑",
  "🐶 반려동물",
];

export default function InterestStep() {
  const navigate = useNavigate();
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState("");

  const handleSubmit = async () => {
    const finalInterests = [
      ...interests,
      ...customInterest
        .split(" ")
        .map((item) => item.trim())
        .filter(Boolean),
    ];

    await fetch("http://127.0.0.1:8000/mypage/me/interests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({
        interests: finalInterests.join(" "),
      }),
    });

    navigate("/");
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
                부모님의 취미를 선택해주세요
              </Title>

              <Text
                mt={8}
                size="sm"
                style={{
                  color: colors.text.secondary,
                }}
              >
                비슷한 관심사를 가진 부모님들과 더 쉽게 소통할 수 있어요.
              </Text>
            </Box>

            <Group gap="sm">
              {hobbyOptions.map((hobby) => {
                const selected = interests.includes(hobby);

                return (
                  <Button
                    key={hobby}
                    type="button"
                    variant="light"
                    radius="xl"
                    onClick={() => {
                      setInterests((prev) =>
                        selected
                          ? prev.filter((item) => item !== hobby)
                          : [...prev, hobby],
                      );
                    }}
                    style={{
                      background: selected
                        ? colors.gradient.primary
                        : colors.surface.subtle,
                      color: selected
                        ? colors.surface.white
                        : colors.text.primary,
                      border: `1px solid ${
                        selected ? "transparent" : colors.border.default
                      }`,
                      fontWeight: 700,
                    }}
                  >
                    {hobby}
                  </Button>
                );
              })}
            </Group>

            <TextInput
              label="기타 취미"
              placeholder="예: 캠핑 베이킹 사진"
              value={customInterest}
              onChange={(e) => setCustomInterest(e.currentTarget.value)}
              styles={inputStyles}
            />

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
                완료
              </Button>
            </Group>
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
