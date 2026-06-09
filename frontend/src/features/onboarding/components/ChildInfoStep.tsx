import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Container,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";

import { colors } from "@/tokens/color";

type PendingSignupForm = {
  id: string;
  pwd: string;
  nickname: string;
  parents_name: string;
  parents_birth: string;
  parents_gender: string;
  parents_mbti: string | null;
  email: string;
  region: string;
};

type ChildForm = {
  child_name: string;
  child_birth: string;
  child_gender: string;
};

const PENDING_SIGNUP_KEY = "onai_pending_signup";
const PENDING_CHILD_KEY = "onai_pending_child";

function getPendingSignupForm(): PendingSignupForm | null {
  const raw = sessionStorage.getItem(PENDING_SIGNUP_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as PendingSignupForm;
  } catch {
    return null;
  }
}

export default function ChildInfoStep() {
  const navigate = useNavigate();

  const [child, setChild] = useState<ChildForm>({
    child_name: "",
    child_birth: "",
    child_gender: "",
  });

  useEffect(() => {
    const savedSignupForm = getPendingSignupForm();

    if (!savedSignupForm) {
      alert("회원가입 기본정보가 없습니다. 다시 회원가입을 진행해주세요.");
      navigate("/signup", { replace: true });
    }
  }, [navigate]);

  const handleChange = (key: keyof ChildForm, value: string) => {
    setChild((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    if (!child.child_name.trim() || !child.child_birth || !child.child_gender) {
      alert("아이 이름, 생년월일, 성별을 모두 입력해주세요.");
      return;
    }

    sessionStorage.setItem(
      PENDING_CHILD_KEY,
      JSON.stringify({
        child_name: child.child_name.trim(),
        child_birth: child.child_birth,
        child_gender: child.child_gender,
      }),
    );

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
              <Text
                size="xs"
                fw={800}
                style={{
                  color: colors.text.muted,
                  letterSpacing: 1.2,
                }}
              >
                STEP 1 / 3
              </Text>

              <Title
                order={2}
                mt={6}
                style={{
                  color: colors.text.primary,
                  fontWeight: 800,
                }}
              >
                아이 정보 입력
              </Title>

              <Text
                mt={8}
                size="sm"
                style={{
                  color: colors.text.secondary,
                }}
              >
                아이 정보는 필수입니다. 모든 단계를 마친 뒤 회원가입이
                완료됩니다.
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
                <Text
                  size="sm"
                  style={{
                    color: colors.text.primary,
                    fontWeight: 700,
                  }}
                >
                  아이 기본정보
                </Text>

                <TextInput
                  label="아이 이름"
                  placeholder="아이 이름을 입력하세요"
                  value={child.child_name}
                  onChange={(e) =>
                    handleChange("child_name", e.currentTarget.value)
                  }
                  required
                  styles={inputStyles}
                />

                <TextInput
                  label="아이 생년월일"
                  type="date"
                  value={child.child_birth}
                  onChange={(e) =>
                    handleChange("child_birth", e.currentTarget.value)
                  }
                  required
                  styles={inputStyles}
                />

                <Select
                  label="아이 성별"
                  placeholder="성별을 선택하세요"
                  data={[
                    { value: "남아", label: "남아" },
                    { value: "여아", label: "여아" },
                  ]}
                  value={child.child_gender}
                  onChange={(value) =>
                    handleChange("child_gender", value ?? "")
                  }
                  required
                  styles={inputStyles}
                />
              </Stack>
            </Card>

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
