import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Container,
  FileButton,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconCamera, IconCheck, IconX } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import UserProfileAvatar from "@/components/UserProfileAvatar";
import { apiFetch, API_BASE_URL } from "@/lib/api";
import { saveAccessToken } from "@/lib/auth";
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

type PendingChildForm = {
  child_name: string;
  child_birth: string;
  child_gender: string;
};

type PendingInterests = {
  interest_regions: string[];
  interests: string[];
};

type SignupResponse = {
  message: string;
  access_token?: string;
  token_type?: string;
  user?: unknown;
};

type LoginResponse = {
  access_token: string;
  token_type: string;
  user?: unknown;
};

type ProfileImageUpdateResponse = {
  message: string;
  profile_image_url: string | null;
};

const PENDING_SIGNUP_KEY = "onai_pending_signup";
const PENDING_CHILD_KEY = "onai_pending_child";
const PENDING_INTERESTS_KEY = "onai_pending_interests";

function readSessionJson<T>(key: string): T | null {
  const raw = sessionStorage.getItem(key);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export default function ProfileImageStep() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const signupData = readSessionJson<PendingSignupForm>(PENDING_SIGNUP_KEY);
    const childData = readSessionJson<PendingChildForm>(PENDING_CHILD_KEY);

    if (!signupData || !childData) {
      alert("회원가입 정보를 찾을 수 없습니다. 다시 회원가입을 진행해주세요.");
      navigate("/signup", { replace: true });
    }
  }, [navigate]);

  const handleSelectFile = (file: File | null) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("jpg, jpeg, png, webp 형식의 이미지만 업로드할 수 있습니다.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("프로필 이미지는 5MB 이하만 업로드할 수 있습니다.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const getAccessTokenAfterSignup = async (signupData: PendingSignupForm) => {
    const signupResponse = await apiFetch<SignupResponse>("/auth/signup", {
      method: "POST",
      auth: false,
      json: signupData,
    });

    if (signupResponse.access_token) {
      return signupResponse.access_token;
    }

    const loginResponse = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      auth: false,
      json: {
        id: signupData.id,
        pwd: signupData.pwd,
      },
    });

    return loginResponse.access_token;
  };

  const uploadProfileImage = async (file: File, accessToken: string) => {
    const formData = new FormData();
    formData.append("profile_image", file);

    const response = await fetch(`${API_BASE_URL}/mypage/me/profile-image`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    const data = (await response.json().catch(() => null)) as
      | ProfileImageUpdateResponse
      | { detail?: string }
      | null;

    if (!response.ok) {
      const message =
        data && "detail" in data && data.detail
          ? data.detail
          : "프로필 이미지 업로드에 실패했습니다.";

      throw new Error(message);
    }
  };

  const clearPendingSignupData = () => {
    sessionStorage.removeItem(PENDING_SIGNUP_KEY);
    sessionStorage.removeItem(PENDING_CHILD_KEY);
    sessionStorage.removeItem(PENDING_INTERESTS_KEY);
  };

  const completeSignup = async (withProfileImage: boolean) => {
    const signupData = readSessionJson<PendingSignupForm>(PENDING_SIGNUP_KEY);
    const childData = readSessionJson<PendingChildForm>(PENDING_CHILD_KEY);
    const interestData = readSessionJson<PendingInterests>(
      PENDING_INTERESTS_KEY,
    ) ?? {
      interest_regions: [],
      interests: [],
    };

    if (!signupData || !childData) {
      alert("회원가입 정보가 부족합니다. 다시 회원가입을 진행해주세요.");
      navigate("/signup", { replace: true });
      return;
    }

    if (withProfileImage && !selectedFile) {
      alert(
        "등록할 프로필 사진을 선택해주세요. 원하지 않으면 건너뛰기를 눌러주세요.",
      );
      return;
    }

    try {
      setSaving(true);

      const accessToken = await getAccessTokenAfterSignup(signupData);
      saveAccessToken(accessToken);

      await apiFetch("/mypage/me/children", {
        method: "PUT",
        json: {
          children: [childData],
        },
      });

      await Promise.all([
        apiFetch("/mypage/me/interest-regions", {
          method: "PUT",
          json: {
            interest_regions: interestData.interest_regions,
          },
        }),
        apiFetch("/mypage/me/interests", {
          method: "PUT",
          json: {
            interests: interestData.interests,
          },
        }),
      ]);

      if (withProfileImage && selectedFile) {
        await uploadProfileImage(selectedFile, accessToken);
      }

      clearPendingSignupData();

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      alert("회원가입이 완료되었습니다.");
      navigate("/community", { replace: true });
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error ? error.message : "회원가입에 실패했습니다.",
      );
    } finally {
      setSaving(false);
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
          <Stack gap="lg" align="center">
            <Box ta="center">
              <Text
                size="xs"
                fw={800}
                style={{
                  color: colors.text.muted,
                  letterSpacing: 1.2,
                }}
              >
                STEP 3 / 3
              </Text>

              <Title
                order={2}
                mt={6}
                style={{
                  color: colors.text.primary,
                  fontWeight: 800,
                }}
              >
                프로필 사진 등록
              </Title>

              <Text
                mt={8}
                size="sm"
                style={{
                  color: colors.text.secondary,
                  lineHeight: 1.7,
                }}
              >
                프로필 사진은 건너뛸 수 있습니다. 완료 또는 건너뛰기를 누르면
                회원가입이 완료되고 자동 로그인됩니다.
              </Text>
            </Box>

            <UserProfileAvatar
              profileImageUrl={previewUrl}
              nickname="ON.AI"
              size={120}
            />

            {selectedFile ? (
              <Text size="sm" ta="center" style={{ color: colors.text.muted }}>
                선택한 파일: {selectedFile.name}
              </Text>
            ) : (
              <Text size="sm" ta="center" style={{ color: colors.text.muted }}>
                아직 선택한 프로필 사진이 없습니다.
              </Text>
            )}

            <FileButton
              onChange={handleSelectFile}
              accept="image/png,image/jpeg,image/webp"
            >
              {(props) => (
                <Button
                  {...props}
                  fullWidth
                  radius="xl"
                  size="md"
                  variant="light"
                  color="coral"
                  leftSection={<IconCamera size={16} />}
                >
                  프로필 사진 선택
                </Button>
              )}
            </FileButton>

            {selectedFile && (
              <Button
                fullWidth
                radius="xl"
                size="md"
                variant="subtle"
                color="gray"
                leftSection={<IconX size={16} />}
                onClick={() => {
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                  }

                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
              >
                선택 취소
              </Button>
            )}

            <Group grow w="100%">
              <Button
                variant="light"
                color="gray"
                radius="xl"
                size="md"
                loading={saving}
                onClick={() => void completeSignup(false)}
              >
                건너뛰기
              </Button>

              <Button
                radius="xl"
                size="md"
                loading={saving}
                leftSection={<IconCheck size={16} />}
                onClick={() => void completeSignup(true)}
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
