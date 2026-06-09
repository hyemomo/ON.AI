import { useEffect, useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  FileButton,
  Group,
  Image,
  Modal,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconCamera,
  IconDeviceFloppy,
  IconEdit,
  IconLogout,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import AppLayout from "@/components/AppLayout";
import UserProfileAvatar from "@/components/UserProfileAvatar";
import mypageIcon from "@/assets/images/onai-mypage-icon.png";
import { apiFetch, API_BASE_URL } from "@/lib/api";
import { getAccessToken, logout } from "@/lib/auth";
import { REGION_OPTIONS } from "@/features/auth/constants/region";
import {
  border,
  coralScale,
  gradient,
  shadow,
  surface,
  text,
} from "@/tokens/color";

type Child = {
  childnum?: number;
  child_name: string;
  child_birth: string;
  child_gender: string;
};

type InterestRegion = {
  interest_regionnum: number;
  region_name: string;
};

type Interest = {
  interestnum: number;
  interest_name: string;
};

type MyPageResponse = {
  usernum: number;
  id: string;
  nickname: string;
  parents_name: string;
  parents_birth: string;
  parents_gender: string;
  parents_mbti: string | null;
  email: string;
  region: string;
  profile_image_url?: string | null;
  created_at: string;
  children: Child[];
  interest_regions: InterestRegion[];
  interests: Interest[];
};

type ProfileForm = {
  nickname: string;
  parents_name: string;
  parents_birth: string;
  parents_gender: string;
  parents_mbti: string;
  email: string;
  region: string;
};

type ProfileImageUpdateResponse = {
  message: string;
  profile_image_url: string | null;
};

const MAX_CHILD_COUNT = 1;
const MAX_INTEREST_REGION_COUNT = 5;
const MAX_INTEREST_COUNT = 3;

const MBTI_OPTIONS = [
  "ISTJ",
  "ISFJ",
  "INFJ",
  "INTJ",
  "ISTP",
  "ISFP",
  "INFP",
  "INTP",
  "ESTP",
  "ESFP",
  "ENFP",
  "ENTP",
  "ESTJ",
  "ESFJ",
  "ENFJ",
  "ENTJ",
];

const GENDER_OPTIONS = [
  { value: "남성", label: "남성" },
  { value: "여성", label: "여성" },
];

const CHILD_GENDER_OPTIONS = [
  { value: "남아", label: "남아" },
  { value: "여아", label: "여아" },
];

const INTEREST_CATEGORIES = {
  육아: ["육아 고민", "아이 발달", "수면 교육", "식습관", "놀이 활동"],
  교육: ["책 읽기", "한글 교육", "영어 교육", "체험 학습"],
  생활: ["집밥", "산책", "카페", "절약"],
  교류: ["동네 친구", "육아친구", "정보 공유", "공감 대화", "키즈카페 동행"],
};

const regionOptions = REGION_OPTIONS as Record<string, string[]>;
const REGION_PROVINCES = Object.keys(regionOptions);

const REGION_DATA = Object.entries(regionOptions).flatMap(
  ([province, districts]) => {
    if (districts.length === 0) {
      return [province];
    }

    return districts.map((district) => `${province} ${district}`);
  },
);

const INTEREST_CATEGORY_NAMES = Object.keys(INTEREST_CATEGORIES);

function normalizeDate(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function formatDisplayDate(value?: string | null) {
  const normalizedDate = normalizeDate(value);

  if (!normalizedDate) return "미입력";

  return normalizedDate.replaceAll("-", ".");
}

function createProfileForm(data: MyPageResponse): ProfileForm {
  return {
    nickname: data.nickname ?? "",
    parents_name: data.parents_name ?? "",
    parents_birth: normalizeDate(data.parents_birth),
    parents_gender: data.parents_gender ?? "",
    parents_mbti: data.parents_mbti ?? "",
    email: data.email ?? "",
    region: data.region ?? "",
  };
}

function createChildrenForm(data: MyPageResponse) {
  return (data.children ?? []).slice(0, MAX_CHILD_COUNT).map((child) => ({
    childnum: child.childnum,
    child_name: child.child_name ?? "",
    child_birth: normalizeDate(child.child_birth),
    child_gender: child.child_gender ?? "",
  }));
}

function getProvinceDistricts(province: string) {
  if (!province) return [];

  const districts = regionOptions[province] ?? [];

  if (districts.length === 0) {
    return [province];
  }

  return districts.map((district) => `${province} ${district}`);
}

function getInterestItems(category: string) {
  if (!category) return [];

  return (
    INTEREST_CATEGORIES[category as keyof typeof INTEREST_CATEGORIES] ?? []
  );
}

function ProfileSummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Card
      p="sm"
      radius="lg"
      withBorder
      bg={surface.subtle}
      style={{
        minWidth: 120,
        flex: 1,
      }}
    >
      <Stack gap={2}>
        <Text size="xs" fw={700} c={text.muted}>
          {label}
        </Text>

        <Text size="sm" fw={800} c={coralScale[6]}>
          {value}
        </Text>
      </Stack>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <Group
      justify="space-between"
      align="flex-start"
      wrap="nowrap"
      py="sm"
      style={{
        borderBottom: `1px solid ${border.default}`,
      }}
    >
      <Text
        size="sm"
        fw={700}
        c={text.muted}
        style={{
          minWidth: 112,
          flexShrink: 0,
        }}
      >
        {label}
      </Text>

      <Text
        size="sm"
        fw={700}
        c={text.primary}
        ta="right"
        style={{
          lineHeight: 1.6,
          wordBreak: "keep-all",
        }}
      >
        {value || "미입력"}
      </Text>
    </Group>
  );
}

function EmptyInfoText({ children }: { children: React.ReactNode }) {
  return (
    <Text
      size="sm"
      c={text.muted}
      style={{
        lineHeight: 1.7,
      }}
    >
      {children}
    </Text>
  );
}

export default function MyPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<MyPageResponse | null>(null);

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    nickname: "",
    parents_name: "",
    parents_birth: "",
    parents_gender: "",
    parents_mbti: "",
    email: "",
    region: "",
  });

  const [children, setChildren] = useState<Child[]>([]);
  const [interestRegions, setInterestRegions] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [isChildrenEditing, setIsChildrenEditing] = useState(false);

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileImageSaving, setProfileImageSaving] = useState(false);
  const [childrenSaving, setChildrenSaving] = useState(false);
  const [interestRegionsSaving, setInterestRegionsSaving] = useState(false);
  const [interestsSaving, setInterestsSaving] = useState(false);

  const [isProfileImageModalOpen, setIsProfileImageModalOpen] = useState(false);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);

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

  const applyMyPageData = (data: MyPageResponse) => {
    setUser(data);
    setProfileForm(createProfileForm(data));
    setChildren(createChildrenForm(data));

    setInterestRegions(
      (data.interest_regions ?? []).map((region) => region.region_name),
    );

    setInterests(
      (data.interests ?? []).map((interest) => interest.interest_name),
    );
  };

  const loadMyPage = async () => {
    const data = await apiFetch<MyPageResponse>("/mypage/me");
    applyMyPageData(data);
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        const data = await apiFetch<MyPageResponse>("/mypage/me");

        if (!isMounted) return;

        applyMyPageData(data);
      } catch (error) {
        console.error(error);

        if (!isMounted) return;

        alert("마이페이지 정보를 불러오지 못했습니다.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChangeProfile = (name: keyof ProfileForm, value: string) => {
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStartProfileEdit = () => {
    if (user) {
      setProfileForm(createProfileForm(user));
    }

    setIsProfileEditing(true);
  };

  const handleCancelProfileEdit = () => {
    if (user) {
      setProfileForm(createProfileForm(user));
    }

    setIsProfileEditing(false);
  };

  const handleStartChildrenEdit = () => {
    if (user) {
      setChildren(createChildrenForm(user));
    }

    setIsChildrenEditing(true);
  };

  const handleCancelChildrenEdit = () => {
    if (user) {
      setChildren(createChildrenForm(user));
    }

    setIsChildrenEditing(false);
  };

  const handleChangeChild = (
    index: number,
    name: keyof Child,
    value: string,
  ) => {
    setChildren((prev) =>
      prev.map((child, childIndex) =>
        childIndex === index
          ? {
              ...child,
              [name]: value,
            }
          : child,
      ),
    );
  };

  const handleAddChild = () => {
    if (children.length >= MAX_CHILD_COUNT) {
      alert("아이 정보는 1명만 등록할 수 있습니다.");
      return;
    }

    setChildren((prev) => [
      ...prev,
      {
        child_name: "",
        child_birth: "",
        child_gender: "",
      },
    ]);
  };

  const handleRemoveChild = (index: number) => {
    setChildren((prev) => prev.filter((_, childIndex) => childIndex !== index));
  };

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

  const handleRemoveInterestRegion = (region: string) => {
    setInterestRegions((prev) => prev.filter((item) => item !== region));
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

  const handleRemoveInterest = (interest: string) => {
    setInterests((prev) => prev.filter((item) => item !== interest));
  };

  const handleUploadProfileImage = async (file: File | null) => {
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

    try {
      setProfileImageSaving(true);

      const formData = new FormData();
      formData.append("profile_image", file);

      const token = getAccessToken();

      const response = await fetch(`${API_BASE_URL}/mypage/me/profile-image`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
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

      await loadMyPage();
      setIsProfileImageModalOpen(false);
      alert("프로필 이미지가 수정되었습니다.");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "프로필 이미지 업로드에 실패했습니다.",
      );
    } finally {
      setProfileImageSaving(false);
    }
  };

  const handleDeleteProfileImage = async () => {
    if (!user?.profile_image_url) {
      alert("삭제할 프로필 이미지가 없습니다.");
      return;
    }

    const ok = window.confirm("프로필 이미지를 삭제하시겠습니까?");
    if (!ok) return;

    try {
      setProfileImageSaving(true);

      await apiFetch("/mypage/me/profile-image", {
        method: "DELETE",
      });

      await loadMyPage();
      setIsProfileImageModalOpen(false);
      alert("프로필 이미지가 삭제되었습니다.");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "프로필 이미지 삭제에 실패했습니다.",
      );
    } finally {
      setProfileImageSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (
      !profileForm.nickname.trim() ||
      !profileForm.parents_name.trim() ||
      !profileForm.parents_birth ||
      !profileForm.parents_gender ||
      !profileForm.email.trim() ||
      !profileForm.region
    ) {
      alert("부모 기본정보의 필수 항목을 모두 입력해주세요.");
      return;
    }

    try {
      setProfileSaving(true);

      await apiFetch("/mypage/me", {
        method: "PUT",
        json: {
          nickname: profileForm.nickname.trim(),
          parents_name: profileForm.parents_name.trim(),
          parents_birth: profileForm.parents_birth,
          parents_gender: profileForm.parents_gender,
          parents_mbti: profileForm.parents_mbti || null,
          email: profileForm.email.trim(),
          region: profileForm.region,
        },
      });

      await loadMyPage();
      setIsProfileEditing(false);
      alert("기본정보가 수정되었습니다.");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "기본정보 수정에 실패했습니다.",
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSaveChildren = async () => {
    if (children.length > MAX_CHILD_COUNT) {
      alert("아이 정보는 1명만 등록할 수 있습니다.");
      return;
    }

    const validChildren = children.filter(
      (child) =>
        child.child_name.trim() && child.child_birth && child.child_gender,
    );

    if (children.length !== validChildren.length) {
      alert("아이 이름, 생년월일, 성별을 모두 입력해주세요.");
      return;
    }

    try {
      setChildrenSaving(true);

      await apiFetch("/mypage/me/children", {
        method: "PUT",
        json: {
          children: validChildren.map((child) => ({
            child_name: child.child_name.trim(),
            child_birth: child.child_birth,
            child_gender: child.child_gender,
          })),
        },
      });

      await loadMyPage();
      setIsChildrenEditing(false);
      alert("아이 정보가 수정되었습니다.");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "아이 정보 수정에 실패했습니다.",
      );
    } finally {
      setChildrenSaving(false);
    }
  };

  const handleSaveInterestRegions = async () => {
    if (interestRegions.length > MAX_INTEREST_REGION_COUNT) {
      alert(
        `관심지역은 최대 ${MAX_INTEREST_REGION_COUNT}개까지 선택할 수 있습니다.`,
      );
      return;
    }

    try {
      setInterestRegionsSaving(true);

      await apiFetch("/mypage/me/interest-regions", {
        method: "PUT",
        json: {
          interest_regions: interestRegions,
        },
      });

      await loadMyPage();
      setIsRegionModalOpen(false);
      alert("관심지역이 수정되었습니다.");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "관심지역 수정에 실패했습니다.",
      );
    } finally {
      setInterestRegionsSaving(false);
    }
  };

  const handleSaveInterests = async () => {
    if (interests.length > MAX_INTEREST_COUNT) {
      alert(`관심사는 최대 ${MAX_INTEREST_COUNT}개까지 선택할 수 있습니다.`);
      return;
    }

    try {
      setInterestsSaving(true);

      await apiFetch("/mypage/me/interests", {
        method: "PUT",
        json: {
          interests,
        },
      });

      await loadMyPage();
      setIsInterestModalOpen(false);
      alert("관심사가 수정되었습니다.");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error ? error.message : "관심사 수정에 실패했습니다.",
      );
    } finally {
      setInterestsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    alert("로그아웃되었습니다.");
    navigate("/", { replace: true });
  };

  const hasProfileImage = !!user?.profile_image_url;

  return (
    <AppLayout>
      <Box style={{ minHeight: "100vh", background: surface.bg }}>
        <Container size="md" py="md">
          <Stack gap="lg">
            <Group gap="md" align="center" wrap="nowrap">
              <Image
                src={mypageIcon}
                alt="ON.AI 마이페이지 아이콘"
                fit="contain"
                style={{
                  width: 68,
                  height: 68,
                  objectFit: "contain",
                  flexShrink: 0,
                }}
              />

              <Title order={2} c={text.primary}>
                마이페이지
              </Title>
            </Group>

            {loading ? (
              <Card p="xl" radius="xl" withBorder>
                <Text c={text.muted}>내 정보를 불러오는 중입니다...</Text>
              </Card>
            ) : user ? (
              <>
                <Card p="xl" radius="xl" withBorder>
                  <Stack gap="md">
                    <Group justify="space-between" align="flex-start">
                      <Group gap="md" align="center">
                        <Box style={{ position: "relative" }}>
                          <UserProfileAvatar
                            profileImageUrl={user.profile_image_url}
                            nickname={user.nickname}
                            size={82}
                          />

                          <ActionIcon
                            size="sm"
                            radius="xl"
                            color="coral"
                            loading={profileImageSaving}
                            onClick={() => setIsProfileImageModalOpen(true)}
                            style={{
                              position: "absolute",
                              right: -2,
                              bottom: -2,
                              background: gradient.primary,
                              boxShadow: shadow.btn,
                            }}
                          >
                            <IconCamera size={14} />
                          </ActionIcon>
                        </Box>

                        <Stack gap={4}>
                          <Text size="xl" fw={800} c={text.primary}>
                            {user.nickname}
                          </Text>

                          <Text size="sm" c={text.secondary}>
                            {user.email}
                          </Text>

                          <Text size="xs" c={text.muted}>
                            프로필 사진은 5MB 이하의 jpg, png, webp 파일만
                            등록할 수 있습니다.
                          </Text>
                        </Stack>
                      </Group>

                      <Badge color="coral" variant="light">
                        {user.id}
                      </Badge>
                    </Group>

                    <Group gap="sm" grow>
                      <ProfileSummaryItem
                        label="지역"
                        value={user.region || "미입력"}
                      />

                      <ProfileSummaryItem
                        label="MBTI"
                        value={user.parents_mbti || "미입력"}
                      />

                      <ProfileSummaryItem
                        label="자녀"
                        value={`${children.length}명`}
                      />
                    </Group>
                  </Stack>
                </Card>

                <Card p="xl" radius="xl" withBorder>
                  <Stack gap="md">
                    <Group justify="space-between" align="center">
                      <Title order={3} size="h4" c={text.primary}>
                        부모 기본정보
                      </Title>

                      {isProfileEditing ? (
                        <Group gap="xs">
                          <Button
                            size="xs"
                            radius="xl"
                            variant="light"
                            color="gray"
                            leftSection={<IconX size={14} />}
                            onClick={handleCancelProfileEdit}
                            disabled={profileSaving}
                          >
                            취소
                          </Button>

                          <Button
                            size="xs"
                            radius="xl"
                            leftSection={<IconDeviceFloppy size={14} />}
                            loading={profileSaving}
                            onClick={() => void handleSaveProfile()}
                            style={{
                              background: gradient.primary,
                              boxShadow: shadow.btn,
                            }}
                          >
                            저장
                          </Button>
                        </Group>
                      ) : (
                        <Button
                          size="xs"
                          radius="xl"
                          variant="light"
                          color="coral"
                          leftSection={<IconEdit size={14} />}
                          onClick={handleStartProfileEdit}
                        >
                          수정
                        </Button>
                      )}
                    </Group>

                    <Divider color={border.default} />

                    {isProfileEditing ? (
                      <Card p="md" radius="lg" withBorder bg={surface.subtle}>
                        <Stack gap="sm">
                          <TextInput
                            label="닉네임"
                            value={profileForm.nickname}
                            onChange={(e) =>
                              handleChangeProfile(
                                "nickname",
                                e.currentTarget.value,
                              )
                            }
                            required
                          />

                          <TextInput
                            label="보호자 이름"
                            value={profileForm.parents_name}
                            onChange={(e) =>
                              handleChangeProfile(
                                "parents_name",
                                e.currentTarget.value,
                              )
                            }
                            required
                          />

                          <TextInput
                            label="보호자 생년월일"
                            type="date"
                            value={profileForm.parents_birth}
                            onChange={(e) =>
                              handleChangeProfile(
                                "parents_birth",
                                e.currentTarget.value,
                              )
                            }
                            required
                          />

                          <Select
                            label="보호자 성별"
                            data={GENDER_OPTIONS}
                            value={profileForm.parents_gender}
                            onChange={(value) =>
                              handleChangeProfile("parents_gender", value ?? "")
                            }
                            required
                          />

                          <Select
                            label="MBTI"
                            data={MBTI_OPTIONS}
                            value={profileForm.parents_mbti || null}
                            onChange={(value) =>
                              handleChangeProfile("parents_mbti", value ?? "")
                            }
                            clearable
                          />

                          <TextInput
                            label="이메일"
                            type="email"
                            value={profileForm.email}
                            onChange={(e) =>
                              handleChangeProfile(
                                "email",
                                e.currentTarget.value,
                              )
                            }
                            required
                          />

                          <Select
                            label="거주 지역"
                            searchable
                            data={REGION_DATA}
                            value={profileForm.region || null}
                            onChange={(value) =>
                              handleChangeProfile("region", value ?? "")
                            }
                            required
                          />
                        </Stack>
                      </Card>
                    ) : (
                      <Stack gap={0}>
                        <InfoRow label="닉네임" value={user.nickname} />
                        <InfoRow
                          label="보호자 이름"
                          value={user.parents_name}
                        />
                        <InfoRow
                          label="보호자 생년월일"
                          value={formatDisplayDate(user.parents_birth)}
                        />
                        <InfoRow
                          label="보호자 성별"
                          value={user.parents_gender}
                        />
                        <InfoRow
                          label="MBTI"
                          value={user.parents_mbti || "미입력"}
                        />
                        <InfoRow label="이메일" value={user.email} />
                        <InfoRow label="거주 지역" value={user.region} />
                      </Stack>
                    )}
                  </Stack>
                </Card>

                <Card p="xl" radius="xl" withBorder>
                  <Stack gap="md">
                    <Group justify="space-between" align="center">
                      <Title order={3} size="h4" c={text.primary}>
                        내 아이 정보
                      </Title>

                      {isChildrenEditing ? (
                        <Group gap="xs">
                          <Button
                            size="xs"
                            radius="xl"
                            variant="light"
                            color="gray"
                            leftSection={<IconX size={14} />}
                            onClick={handleCancelChildrenEdit}
                            disabled={childrenSaving}
                          >
                            취소
                          </Button>

                          <Button
                            size="xs"
                            radius="xl"
                            variant="light"
                            color="coral"
                            leftSection={<IconPlus size={14} />}
                            onClick={handleAddChild}
                            disabled={children.length >= MAX_CHILD_COUNT}
                          >
                            {children.length >= MAX_CHILD_COUNT
                              ? "아이 등록 완료"
                              : "아이 추가"}
                          </Button>

                          <Button
                            size="xs"
                            radius="xl"
                            leftSection={<IconDeviceFloppy size={14} />}
                            loading={childrenSaving}
                            onClick={() => void handleSaveChildren()}
                            style={{
                              background: gradient.primary,
                              boxShadow: shadow.btn,
                            }}
                          >
                            저장
                          </Button>
                        </Group>
                      ) : (
                        <Button
                          size="xs"
                          radius="xl"
                          variant="light"
                          color="coral"
                          leftSection={<IconEdit size={14} />}
                          onClick={handleStartChildrenEdit}
                        >
                          수정
                        </Button>
                      )}
                    </Group>

                    <Divider color={border.default} />

                    {isChildrenEditing ? (
                      <Stack gap="md">
                        {children.length > 0 ? (
                          children.map((child, index) => (
                            <Card
                              key={`${child.childnum ?? "new"}-${index}`}
                              p="md"
                              radius="lg"
                              withBorder
                              bg={surface.subtle}
                            >
                              <Stack gap="sm">
                                <Group justify="space-between">
                                  <Text fw={700} c={text.primary}>
                                    아이 정보
                                  </Text>

                                  <ActionIcon
                                    variant="subtle"
                                    color="red"
                                    onClick={() => handleRemoveChild(index)}
                                  >
                                    <IconTrash size={16} />
                                  </ActionIcon>
                                </Group>

                                <TextInput
                                  label="아이 이름"
                                  value={child.child_name}
                                  onChange={(e) =>
                                    handleChangeChild(
                                      index,
                                      "child_name",
                                      e.currentTarget.value,
                                    )
                                  }
                                  required
                                />

                                <TextInput
                                  label="아이 생년월일"
                                  type="date"
                                  value={normalizeDate(child.child_birth)}
                                  onChange={(e) =>
                                    handleChangeChild(
                                      index,
                                      "child_birth",
                                      e.currentTarget.value,
                                    )
                                  }
                                  required
                                />

                                <Select
                                  label="아이 성별"
                                  data={CHILD_GENDER_OPTIONS}
                                  value={child.child_gender || null}
                                  onChange={(value) =>
                                    handleChangeChild(
                                      index,
                                      "child_gender",
                                      value ?? "",
                                    )
                                  }
                                  required
                                />
                              </Stack>
                            </Card>
                          ))
                        ) : (
                          <EmptyInfoText>
                            등록된 아이 정보가 없습니다. 아이 추가 버튼으로 아이
                            1명의 정보를 등록해주세요.
                          </EmptyInfoText>
                        )}
                      </Stack>
                    ) : children.length > 0 ? (
                      <Stack gap="lg">
                        {children.map((child, index) => (
                          <Stack
                            key={`${child.childnum ?? "child"}-${index}`}
                            gap={0}
                          >
                            <InfoRow
                              label="아이 이름"
                              value={child.child_name}
                            />
                            <InfoRow
                              label="아이 생년월일"
                              value={formatDisplayDate(child.child_birth)}
                            />
                            <InfoRow
                              label="아이 성별"
                              value={child.child_gender}
                            />
                          </Stack>
                        ))}
                      </Stack>
                    ) : (
                      <EmptyInfoText>
                        등록된 아이 정보가 없습니다. 수정 버튼을 눌러 아이
                        정보를 등록해주세요.
                      </EmptyInfoText>
                    )}
                  </Stack>
                </Card>

                <Card p="xl" radius="xl" withBorder>
                  <Stack gap="md">
                    <Group justify="space-between">
                      <Stack gap={2}>
                        <Title order={3} size="h4" c={text.primary}>
                          관심지역
                        </Title>

                        <Text size="xs" c={text.muted}>
                          최대 {MAX_INTEREST_REGION_COUNT}개까지 선택할 수
                          있습니다.
                        </Text>
                      </Stack>

                      <Button
                        size="xs"
                        radius="xl"
                        variant="light"
                        color="coral"
                        leftSection={<IconEdit size={14} />}
                        onClick={() => setIsRegionModalOpen(true)}
                      >
                        관심지역 수정
                      </Button>
                    </Group>

                    <Divider color={border.default} />

                    {interestRegions.length > 0 ? (
                      <Group gap="xs" wrap="wrap">
                        {interestRegions.map((region) => (
                          <Badge key={region} color="coral" variant="light">
                            {region}
                          </Badge>
                        ))}
                      </Group>
                    ) : (
                      <Text size="sm" c={text.muted}>
                        선택한 관심지역이 없습니다.
                      </Text>
                    )}
                  </Stack>
                </Card>

                <Card p="xl" radius="xl" withBorder>
                  <Stack gap="md">
                    <Group justify="space-between">
                      <Stack gap={2}>
                        <Title order={3} size="h4" c={text.primary}>
                          관심사
                        </Title>

                        <Text size="xs" c={text.muted}>
                          최대 {MAX_INTEREST_COUNT}개까지 선택할 수 있습니다.
                        </Text>
                      </Stack>

                      <Button
                        size="xs"
                        radius="xl"
                        variant="light"
                        color="coral"
                        leftSection={<IconEdit size={14} />}
                        onClick={() => setIsInterestModalOpen(true)}
                      >
                        관심사 수정
                      </Button>
                    </Group>

                    <Divider color={border.default} />

                    {interests.length > 0 ? (
                      <Group gap="xs" wrap="wrap">
                        {interests.map((interest) => (
                          <Badge key={interest} color="coral" variant="light">
                            {interest}
                          </Badge>
                        ))}
                      </Group>
                    ) : (
                      <Text size="sm" c={text.muted}>
                        선택한 관심사가 없습니다.
                      </Text>
                    )}
                  </Stack>
                </Card>
              </>
            ) : (
              <Card p="xl" radius="xl" withBorder>
                <Text c={text.muted}>사용자 정보를 찾을 수 없습니다.</Text>
              </Card>
            )}

            <Button
              size="md"
              radius="xl"
              color="red"
              variant="light"
              leftSection={<IconLogout size={18} />}
              onClick={handleLogout}
            >
              로그아웃
            </Button>
          </Stack>
        </Container>
      </Box>

      <Modal
        opened={isProfileImageModalOpen}
        onClose={() => setIsProfileImageModalOpen(false)}
        title="프로필 사진"
        centered
        size="sm"
      >
        <Stack gap="md">
          <Group justify="center">
            <UserProfileAvatar
              profileImageUrl={user?.profile_image_url}
              nickname={user?.nickname}
              size={110}
            />
          </Group>

          <Text size="sm" c={text.secondary} ta="center">
            {hasProfileImage
              ? "프로필 사진을 수정하거나 삭제할 수 있습니다."
              : "아직 등록된 프로필 사진이 없습니다."}
          </Text>

          <FileButton
            onChange={handleUploadProfileImage}
            accept="image/png,image/jpeg,image/webp"
          >
            {(props) => (
              <Button
                {...props}
                fullWidth
                radius="xl"
                leftSection={<IconCamera size={16} />}
                loading={profileImageSaving}
                style={{
                  background: gradient.primary,
                  boxShadow: shadow.btn,
                }}
              >
                {hasProfileImage ? "프로필 사진 수정" : "프로필 사진 추가"}
              </Button>
            )}
          </FileButton>

          {hasProfileImage && (
            <Button
              fullWidth
              radius="xl"
              color="red"
              variant="light"
              leftSection={<IconTrash size={16} />}
              loading={profileImageSaving}
              onClick={() => void handleDeleteProfileImage()}
            >
              프로필 사진 삭제
            </Button>
          )}
        </Stack>
      </Modal>

      <Modal
        opened={isRegionModalOpen}
        onClose={() => setIsRegionModalOpen(false)}
        title="관심지역 선택"
        centered
        size="lg"
      >
        <Stack gap="md">
          <Text size="sm" c={text.secondary}>
            왼쪽에서 1차 지역을 선택한 뒤, 오른쪽에서 관심지역을 선택하세요.
          </Text>

          <Group align="stretch" gap="md" wrap="nowrap">
            <Card
              withBorder
              radius="lg"
              p="xs"
              style={{ width: 180, flexShrink: 0 }}
            >
              <ScrollArea h={320}>
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
                        onClick={() => setSelectedRegionProvince(province)}
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
              <ScrollArea h={320}>
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

          <Card withBorder radius="lg" p="md" bg={surface.subtle}>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={700} c={text.primary}>
                  선택된 관심지역
                </Text>

                <Text size="xs" c={text.muted}>
                  {interestRegions.length} / {MAX_INTEREST_REGION_COUNT}
                </Text>
              </Group>

              {interestRegions.length > 0 ? (
                <Group gap="xs" wrap="wrap">
                  {interestRegions.map((region) => (
                    <Badge
                      key={region}
                      color="coral"
                      variant="filled"
                      rightSection={
                        <IconX
                          size={12}
                          style={{ cursor: "pointer" }}
                          onClick={() => handleRemoveInterestRegion(region)}
                        />
                      }
                    >
                      {region}
                    </Badge>
                  ))}
                </Group>
              ) : (
                <Text size="sm" c={text.muted}>
                  아직 선택한 관심지역이 없습니다.
                </Text>
              )}
            </Stack>
          </Card>

          <Group justify="flex-end">
            <Button
              variant="subtle"
              color="gray"
              onClick={() => setIsRegionModalOpen(false)}
            >
              닫기
            </Button>

            <Button
              radius="xl"
              loading={interestRegionsSaving}
              leftSection={<IconDeviceFloppy size={14} />}
              onClick={() => void handleSaveInterestRegions()}
              style={{ background: gradient.primary, boxShadow: shadow.btn }}
            >
              저장
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={isInterestModalOpen}
        onClose={() => setIsInterestModalOpen(false)}
        title="관심사 선택"
        centered
        size="lg"
      >
        <Stack gap="md">
          <Text size="sm" c={text.secondary}>
            왼쪽에서 카테고리를 선택한 뒤, 오른쪽에서 관심사를 선택하세요.
          </Text>

          <Group align="stretch" gap="md" wrap="nowrap">
            <Card
              withBorder
              radius="lg"
              p="xs"
              style={{ width: 180, flexShrink: 0 }}
            >
              <ScrollArea h={280}>
                <Stack gap={4}>
                  {INTEREST_CATEGORY_NAMES.map((category) => {
                    const isActive = selectedInterestCategory === category;

                    return (
                      <Button
                        key={category}
                        fullWidth
                        size="xs"
                        radius="md"
                        variant={isActive ? "light" : "subtle"}
                        color="coral"
                        onClick={() => setSelectedInterestCategory(category)}
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
              <ScrollArea h={280}>
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

          <Card withBorder radius="lg" p="md" bg={surface.subtle}>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={700} c={text.primary}>
                  선택된 관심사
                </Text>

                <Text size="xs" c={text.muted}>
                  {interests.length} / {MAX_INTEREST_COUNT}
                </Text>
              </Group>

              {interests.length > 0 ? (
                <Group gap="xs" wrap="wrap">
                  {interests.map((interest) => (
                    <Badge
                      key={interest}
                      color="coral"
                      variant="filled"
                      rightSection={
                        <IconX
                          size={12}
                          style={{ cursor: "pointer" }}
                          onClick={() => handleRemoveInterest(interest)}
                        />
                      }
                    >
                      {interest}
                    </Badge>
                  ))}
                </Group>
              ) : (
                <Text size="sm" c={text.muted}>
                  아직 선택한 관심사가 없습니다.
                </Text>
              )}
            </Stack>
          </Card>

          <Group justify="flex-end">
            <Button
              variant="subtle"
              color="gray"
              onClick={() => setIsInterestModalOpen(false)}
            >
              닫기
            </Button>

            <Button
              radius="xl"
              loading={interestsSaving}
              leftSection={<IconDeviceFloppy size={14} />}
              onClick={() => void handleSaveInterests()}
              style={{ background: gradient.primary, boxShadow: shadow.btn }}
            >
              저장
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AppLayout>
  );
}
