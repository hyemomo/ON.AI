import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Container,
  Group,
  PasswordInput,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

import { colors } from "@/tokens/color";
import { REGION_OPTIONS } from '@/features/auth/constants/region';

type SignupForm = {
  id: string;
  pwd: string;
  nickname: string;
  parents_name: string;
  parents_birth: string;
  parents_gender: string;
  parents_mbti: string;
  email: string;
  region: string;
};

export default function SignupPage() {
  const [form, setForm] = useState<SignupForm>({
    id: "",
    pwd: "",
    nickname: "",
    parents_name: "",
    parents_birth: "",
    parents_gender: "",
    parents_mbti: "",
    email: "",
    region: "",
  });

const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
const handleProvinceChange = (province: string | null) => {
  setSelectedProvince(province);
  setSelectedDistrict(null);

  if (!province) {
    handleChange("region", "");
    return;
  }

  const districts = REGION_OPTIONS[province];

  // 세종시처럼 하위 지역이 없는 경우
  if (districts.length === 0) {
    handleChange("region", province);
  } else {
    handleChange("region", "");
  }
};

const handleDistrictChange = (district: string | null) => {
  setSelectedDistrict(district);

  if (!selectedProvince || !district) {
    handleChange("region", "");
    return;
  }

  handleChange("region", `${selectedProvince} ${district}`);
};
  const handleChange = (name: keyof SignupForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:8000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("회원가입에 실패했습니다.");
      }

      const data = await response.json();
      console.log("회원가입 성공:", data);

      alert("회원가입이 완료되었습니다.");
    } catch (error) {
      console.error(error);
      alert("회원가입 중 오류가 발생했습니다.");
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
                ON.AI 회원가입
              </Title>

              <Text
                mt={8}
                size="sm"
                style={{
                  color: colors.text.secondary,
                }}
              >
                부모님의 육아 고민을 함께 나누기 위해 기본 정보를 입력해주세요.
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

                <TextInput
                  label="닉네임"
                  placeholder="닉네임을 입력하세요"
                  value={form.nickname}
                  onChange={(e) => handleChange("nickname", e.target.value)}
                  required
                  styles={inputStyles}
                />

                <TextInput
                  label="부모 이름"
                  placeholder="이름을 입력하세요"
                  value={form.parents_name}
                  onChange={(e) => handleChange("parents_name", e.target.value)}
                  required
                  styles={inputStyles}
                />

                <TextInput
                  label="부모 생년월일"
                  type="date"
                  value={form.parents_birth}
                  onChange={(e) =>
                    handleChange("parents_birth", e.target.value)
                  }
                  required
                  styles={inputStyles}
                />
                <Select
                  label="부모 성별"
                  placeholder="성별을 선택하세요"
                  data={[
                    { value: "female", label: "여성" },
                    { value: "male", label: "남성" },
                    { value: "none", label: "선택 안 함" },
                  ]}
                  value={form.parents_gender}
                  onChange={(value) =>
                    handleChange("parents_gender", value || "")
                  }
                  required
                  styles={inputStyles}
                />

                <Select
                  label="MBTI"
                  placeholder="MBTI를 선택하세요"
                  data={[
                    "INTJ",
                    "INTP",
                    "ENTJ",
                    "ENTP",
                    "INFJ",
                    "INFP",
                    "ENFJ",
                    "ENFP",
                    "ISTJ",
                    "ISFJ",
                    "ESTJ",
                    "ESFJ",
                    "ISTP",
                    "ISFP",
                    "ESTP",
                    "ESFP",
                  ]}
                  value={form.parents_mbti}
                  onChange={(value) =>
                    handleChange("parents_mbti", value || "")
                  }
                  styles={inputStyles}
                />

                <TextInput
                  label="이메일"
                  placeholder="user@example.com"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  styles={inputStyles}
                />

                <Select
                  label="시/도"
                  placeholder="시/도를 선택하세요"
                  data={Object.keys(REGION_OPTIONS)}
                  value={selectedProvince}
                  onChange={handleProvinceChange}
                  required
                  styles={inputStyles}
                />

                <Select
                  label="시/군/구"
                  placeholder={
                    selectedProvince
                      ? REGION_OPTIONS[selectedProvince].length === 0
                        ? "하위 지역 선택 없음"
                        : "시/군/구를 선택하세요"
                      : "먼저 시/도를 선택하세요"
                  }
                  data={
                    selectedProvince ? REGION_OPTIONS[selectedProvince] : []
                  }
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  disabled={
                    !selectedProvince ||
                    REGION_OPTIONS[selectedProvince].length === 0
                  }
                  required={
                    !!selectedProvince &&
                    REGION_OPTIONS[selectedProvince].length > 0
                  }
                  styles={inputStyles}
                />
                
                <Group justify="center" mt="md">
                  <Button
                    type="submit"
                    loading={loading}
                    fullWidth
                    radius="xl"
                    size="md"
                    style={{
                      background: colors.gradient.primary,
                      boxShadow: colors.shadow.btn,
                      fontWeight: 700,
                    }}
                  >
                    회원가입
                  </Button>
                </Group>
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