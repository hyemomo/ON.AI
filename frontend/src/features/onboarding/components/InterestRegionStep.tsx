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
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { colors } from "@/tokens/color";

const REGION_LIST = [
  "서울시", "부산시", "대구시", "인천시", "광주시",
  "대전시", "울산시", "세종시", "경기도", "강원도",
  "충청북도", "충청남도", "전북", "전라남도", "경상북도",
  "경상남도", "제주도",
];

export default function InterestRegionStep() {
  const navigate = useNavigate();
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region]
    );
  };

  const handleSubmit = async () => {
    await fetch("http://127.0.0.1:8000/mypage/me/interest-regions", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({ interest_regions: selectedRegions }),
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
                관심 지역 선택
              </Title>

              <Text
                mt={8}
                size="sm"
                style={{
                  color: colors.text.secondary,
                }}
              >
                관심 있는 지역의 커뮤니티 소식을 받아볼 수 있어요.
              </Text>
            </Box>

            <Group gap="sm">
              {REGION_LIST.map((region) => {
                const selected = selectedRegions.includes(region);
                return (
                  <Button
                    key={region}
                    type="button"
                    variant="light"
                    radius="xl"
                    onClick={() => toggleRegion(region)}
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
                    {region}
                  </Button>
                );
              })}
            </Group>

            {selectedRegions.length > 0 && (
              <Text size="sm" style={{ color: colors.text.secondary }}>
                선택된 지역: {selectedRegions.join(", ")}
              </Text>
            )}

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
        </Card>
      </Container>
    </Box>
  );
}
