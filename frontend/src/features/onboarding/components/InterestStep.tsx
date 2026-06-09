import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";

import { REGION_OPTIONS } from "@/features/auth/constants/region";
import { colors } from "@/tokens/color";

const MAX_INTEREST_REGION_COUNT = 5;
const MAX_INTEREST_COUNT = 3;

const PENDING_SIGNUP_KEY = "onai_pending_signup";
const PENDING_CHILD_KEY = "onai_pending_child";
const PENDING_INTERESTS_KEY = "onai_pending_interests";

const INTEREST_CATEGORIES = {
  육아: ["육아 고민", "아이 발달", "수면 교육", "식습관", "놀이 활동"],
  교육: ["책 읽기", "한글 교육", "영어 교육", "체험 학습"],
  생활: ["집밥", "산책", "카페", "절약"],
  교류: ["동네 친구", "육아친구", "정보 공유", "공감 대화", "키즈카페 동행"],
};

const regionOptions = REGION_OPTIONS as Record<string, string[]>;
const REGION_PROVINCES = Object.keys(regionOptions);
const INTEREST_CATEGORY_NAMES = Object.keys(INTEREST_CATEGORIES);

function getProvinceDistricts(province: string) {
  const districts = regionOptions[province] ?? [];

  if (districts.length === 0) {
    return [province];
  }

  return districts.map((district) => `${province} ${district}`);
}

function getInterestItems(category: string) {
  return (
    INTEREST_CATEGORIES[category as keyof typeof INTEREST_CATEGORIES] ?? []
  );
}

function hasRequiredPreviousData() {
  return (
    !!sessionStorage.getItem(PENDING_SIGNUP_KEY) &&
    !!sessionStorage.getItem(PENDING_CHILD_KEY)
  );
}

export default function InterestStep() {
  const navigate = useNavigate();

  const [interestRegions, setInterestRegions] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [selectedRegionProvince, setSelectedRegionProvince] = useState(
    REGION_PROVINCES[0] ?? "",
  );
  const [selectedInterestCategory, setSelectedInterestCategory] = useState(
    INTEREST_CATEGORY_NAMES[0] ?? "",
  );

  const selectedProvinceDistricts = getProvinceDistricts(
    selectedRegionProvince,
  );
  const selectedInterestItems = getInterestItems(selectedInterestCategory);

  useEffect(() => {
    if (!hasRequiredPreviousData()) {
      alert("회원가입 정보를 찾을 수 없습니다. 다시 회원가입을 진행해주세요.");
      navigate("/signup", { replace: true });
    }
  }, [navigate]);

  const handleToggleInterestRegion = (region: string) => {
    setInterestRegions((prev) => {
      if (prev.includes(region)) {
        return prev.filter((item) => item !== region);
      }

      if (prev.length >= MAX_INTEREST_REGION_COUNT) {
        alert(
          `관심지역은 최대 ${MAX_INTEREST_REGION_COUNT}개까지 선택할 수 있습니다.`,
        );
        return prev;
      }

      return [...prev, region];
    });
  };

  const handleToggleInterest = (interest: string) => {
    setInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((item) => item !== interest);
      }

      if (prev.length >= MAX_INTEREST_COUNT) {
        alert(`관심사는 최대 ${MAX_INTEREST_COUNT}개까지 선택할 수 있습니다.`);
        return prev;
      }

      return [...prev, interest];
    });
  };

  const goNext = (nextInterestRegions: string[], nextInterests: string[]) => {
    sessionStorage.setItem(
      PENDING_INTERESTS_KEY,
      JSON.stringify({
        interest_regions: nextInterestRegions,
        interests: nextInterests,
      }),
    );

    navigate("/onboarding/profile-image");
  };

  const handleSubmit = () => {
    goNext(interestRegions, interests);
  };

  const handleSkip = () => {
    goNext([], []);
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: colors.gradient.bg,
        padding: "56px 16px",
      }}
    >
      <Container size="md">
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
              <Text
                size="xs"
                fw={800}
                style={{
                  color: colors.text.muted,
                  letterSpacing: 1.2,
                }}
              >
                STEP 2 / 3
              </Text>

              <Title
                order={2}
                mt={6}
                style={{
                  color: colors.text.primary,
                  fontWeight: 800,
                }}
              >
                관심사와 관심지역 선택
              </Title>

              <Text
                mt={8}
                size="sm"
                style={{
                  color: colors.text.secondary,
                }}
              >
                비슷한 관심사를 가진 부모님을 추천하는 데 활용됩니다. 건너뛸 수
                있고, 나중에 마이페이지에서 수정할 수 있습니다.
              </Text>
            </Box>

            <Card
              radius="lg"
              p="md"
              withBorder
              style={{
                backgroundColor: colors.surface.subtle,
                borderColor: colors.border.default,
              }}
            >
              <Stack gap="md">
                <Group justify="space-between">
                  <Stack gap={2}>
                    <Text fw={800} style={{ color: colors.text.primary }}>
                      관심지역
                    </Text>

                    <Text size="xs" style={{ color: colors.text.muted }}>
                      최대 {MAX_INTEREST_REGION_COUNT}개까지 선택할 수 있습니다.
                    </Text>
                  </Stack>

                  <Text size="xs" style={{ color: colors.text.muted }}>
                    {interestRegions.length} / {MAX_INTEREST_REGION_COUNT}
                  </Text>
                </Group>

                <Group align="stretch" gap="md" wrap="nowrap">
                  <Card
                    withBorder
                    radius="lg"
                    p="xs"
                    style={{ width: 180, flexShrink: 0 }}
                  >
                    <ScrollArea h={260}>
                      <Stack gap={4}>
                        {REGION_PROVINCES.map((province) => {
                          const isActive = selectedRegionProvince === province;

                          return (
                            <Button
                              key={province}
                              fullWidth
                              size="xs"
                              radius="md"
                              variant={isActive ? "light" : "subtle"}
                              color="coral"
                              onClick={() =>
                                setSelectedRegionProvince(province)
                              }
                              styles={{
                                label: {
                                  width: "100%",
                                  justifyContent: "flex-start",
                                },
                              }}
                            >
                              {province}
                            </Button>
                          );
                        })}
                      </Stack>
                    </ScrollArea>
                  </Card>

                  <Card withBorder radius="lg" p="xs" style={{ flex: 1 }}>
                    <ScrollArea h={260}>
                      <Group gap="xs" wrap="wrap">
                        {selectedProvinceDistricts.map((region) => {
                          const isSelected = interestRegions.includes(region);

                          return (
                            <Button
                              key={region}
                              size="xs"
                              radius="xl"
                              variant={isSelected ? "filled" : "light"}
                              color="coral"
                              onClick={() => handleToggleInterestRegion(region)}
                            >
                              {region}
                            </Button>
                          );
                        })}
                      </Group>
                    </ScrollArea>
                  </Card>
                </Group>

                {interestRegions.length > 0 && (
                  <Group gap="xs" wrap="wrap">
                    {interestRegions.map((region) => (
                      <Badge key={region} color="coral" variant="filled">
                        {region}
                      </Badge>
                    ))}
                  </Group>
                )}
              </Stack>
            </Card>

            <Card
              radius="lg"
              p="md"
              withBorder
              style={{
                backgroundColor: colors.surface.subtle,
                borderColor: colors.border.default,
              }}
            >
              <Stack gap="md">
                <Group justify="space-between">
                  <Stack gap={2}>
                    <Text fw={800} style={{ color: colors.text.primary }}>
                      관심사
                    </Text>

                    <Text size="xs" style={{ color: colors.text.muted }}>
                      최대 {MAX_INTEREST_COUNT}개까지 선택할 수 있습니다.
                    </Text>
                  </Stack>

                  <Text size="xs" style={{ color: colors.text.muted }}>
                    {interests.length} / {MAX_INTEREST_COUNT}
                  </Text>
                </Group>

                <Group align="stretch" gap="md" wrap="nowrap">
                  <Card
                    withBorder
                    radius="lg"
                    p="xs"
                    style={{ width: 180, flexShrink: 0 }}
                  >
                    <ScrollArea h={220}>
                      <Stack gap={4}>
                        {INTEREST_CATEGORY_NAMES.map((category) => {
                          const isActive =
                            selectedInterestCategory === category;

                          return (
                            <Button
                              key={category}
                              fullWidth
                              size="xs"
                              radius="md"
                              variant={isActive ? "light" : "subtle"}
                              color="coral"
                              onClick={() =>
                                setSelectedInterestCategory(category)
                              }
                              styles={{
                                label: {
                                  width: "100%",
                                  justifyContent: "flex-start",
                                },
                              }}
                            >
                              {category}
                            </Button>
                          );
                        })}
                      </Stack>
                    </ScrollArea>
                  </Card>

                  <Card withBorder radius="lg" p="xs" style={{ flex: 1 }}>
                    <ScrollArea h={220}>
                      <Group gap="xs" wrap="wrap">
                        {selectedInterestItems.map((interest) => {
                          const isSelected = interests.includes(interest);

                          return (
                            <Button
                              key={interest}
                              size="xs"
                              radius="xl"
                              variant={isSelected ? "filled" : "light"}
                              color="coral"
                              onClick={() => handleToggleInterest(interest)}
                            >
                              {interest}
                            </Button>
                          );
                        })}
                      </Group>
                    </ScrollArea>
                  </Card>
                </Group>

                {interests.length > 0 && (
                  <Group gap="xs" wrap="wrap">
                    {interests.map((interest) => (
                      <Badge key={interest} color="coral" variant="filled">
                        {interest}
                      </Badge>
                    ))}
                  </Group>
                )}
              </Stack>
            </Card>

            <Group grow>
              <Button
                variant="light"
                color="gray"
                radius="xl"
                size="md"
                onClick={handleSkip}
              >
                건너뛰기
              </Button>

              <Button
                onClick={handleSubmit}
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
