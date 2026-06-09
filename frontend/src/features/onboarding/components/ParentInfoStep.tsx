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

const REGION_OPTIONS = [
  "서울시 종로구", "서울시 중구", "서울시 용산구", "서울시 성동구", "서울시 광진구",
  "서울시 동대문구", "서울시 중랑구", "서울시 성북구", "서울시 강북구", "서울시 도봉구",
  "서울시 노원구", "서울시 은평구", "서울시 서대문구", "서울시 마포구", "서울시 양천구",
  "서울시 강서구", "서울시 구로구", "서울시 금천구", "서울시 영등포구", "서울시 동작구",
  "서울시 관악구", "서울시 서초구", "서울시 강남구", "서울시 송파구", "서울시 강동구",
  "부산시 중구", "부산시 서구", "부산시 동구", "부산시 영도구", "부산시 부산진구",
  "부산시 동래구", "부산시 남구", "부산시 북구", "부산시 해운대구", "부산시 사하구",
  "대구시 중구", "대구시 동구", "대구시 서구", "대구시 남구", "대구시 북구",
  "인천시 중구", "인천시 동구", "인천시 미추홀구", "인천시 연수구", "인천시 남동구",
  "광주시 동구", "광주시 서구", "광주시 남구", "광주시 북구", "광주시 광산구",
  "대전시 동구", "대전시 중구", "대전시 서구", "대전시 유성구", "대전시 대덕구",
  "울산시 중구", "울산시 남구", "울산시 동구", "울산시 북구", "울산시 울주군",
  "세종시",
  "경기도 수원시", "경기도 성남시", "경기도 의정부시", "경기도 안양시", "경기도 부천시",
  "경기도 광명시", "경기도 평택시", "경기도 안산시", "경기도 고양시", "경기도 용인시",
  "경기도 파주시", "경기도 이천시", "경기도 김포시", "경기도 화성시", "경기도 남양주시",
  "강원도 춘천시", "강원도 원주시", "강원도 강릉시", "강원도 동해시", "강원도 속초시",
  "충청북도 청주시", "충청북도 충주시", "충청북도 제천시",
  "충청남도 천안시", "충청남도 공주시", "충청남도 아산시", "충청남도 서산시",
  "전북 전주시", "전북 군산시", "전북 익산시",
  "전라남도 목포시", "전라남도 여수시", "전라남도 순천시",
  "경상북도 포항시", "경상북도 경주시", "경상북도 안동시", "경상북도 구미시",
  "경상남도 창원시", "경상남도 진주시", "경상남도 김해시", "경상남도 거제시",
  "제주도 제주시", "제주도 서귀포시",
];

const MBTI_OPTIONS = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
];

export default function ParentInfoStep() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nickname: "",
    parents_name: "",
    parents_birth: "",
    parents_gender: "",
    parents_mbti: "",
    email: "",
    region: "",
  });

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    await fetch("http://127.0.0.1:8000/mypage/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({
        ...form,
        parents_mbti: form.parents_mbti || null,
      }),
    });

    navigate("/onboarding/children");
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
                부모 정보 입력
              </Title>

              <Text
                mt={8}
                size="sm"
                style={{
                  color: colors.text.secondary,
                }}
              >
                맞춤 서비스를 위해 기본 정보를 입력해주세요.
              </Text>
            </Box>

            <Stack gap="md">
              <TextInput
                label="닉네임"
                placeholder="사용할 닉네임"
                value={form.nickname}
                onChange={(e) => handleChange("nickname", e.currentTarget.value)}
                required
                styles={inputStyles}
              />

              <TextInput
                label="이름"
                placeholder="실명을 입력하세요"
                value={form.parents_name}
                onChange={(e) => handleChange("parents_name", e.currentTarget.value)}
                required
                styles={inputStyles}
              />

              <TextInput
                label="생년월일"
                type="date"
                value={form.parents_birth}
                onChange={(e) => handleChange("parents_birth", e.currentTarget.value)}
                required
                styles={inputStyles}
              />

              <Select
                label="성별"
                placeholder="성별을 선택하세요"
                data={[
                  { value: "male", label: "남성" },
                  { value: "female", label: "여성" },
                ]}
                value={form.parents_gender}
                onChange={(value) => handleChange("parents_gender", value ?? "")}
                required
                styles={inputStyles}
              />

              <Select
                label="MBTI (선택)"
                placeholder="MBTI를 선택하세요"
                data={MBTI_OPTIONS.map((m) => ({ value: m, label: m }))}
                value={form.parents_mbti}
                onChange={(value) => handleChange("parents_mbti", value ?? "")}
                clearable
                styles={inputStyles}
              />

              <TextInput
                label="이메일"
                type="email"
                placeholder="이메일 주소"
                value={form.email}
                onChange={(e) => handleChange("email", e.currentTarget.value)}
                required
                styles={inputStyles}
              />

              <Select
                label="거주 지역"
                placeholder="지역을 선택하세요"
                data={REGION_OPTIONS.map((r) => ({ value: r, label: r }))}
                value={form.region}
                onChange={(value) => handleChange("region", value ?? "")}
                searchable
                required
                styles={inputStyles}
              />
            </Stack>

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
