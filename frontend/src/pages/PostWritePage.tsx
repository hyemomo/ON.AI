import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppShell,
  Container,
  Group,
  Stack,
  Text,
  Badge,
  Button,
  ActionIcon,
  TextInput,
  Card,
  Divider,
  Box,
  Select,
  Paper,
  Breadcrumbs,
  Anchor,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconPhoto,
  IconX,
  IconSend,
  IconAlertCircle,
} from "@tabler/icons-react";
import MDEditor from "@uiw/react-md-editor";

import colors, {
  coralScale,
  surface,
  text,
  border,
  shadow,
  gradient,
} from "@/tokens/color";
import {
  BODY_MAX,
  TITLE_MAX,
} from "@/features/community/post-write/constants/constants";
import { REGION_OPTIONS } from "@/features/auth/constants/region";

interface ImageItem {
  id: string;
  emoji: string;
  name: string;
}

interface PostWritePageProps {
  onBack?: () => void;
}

const ALLOWED_CATEGORIES = [
  "육아친구",
  "육아정보",
  "교육",
  "맛집",
  "고민상담",
  "동네소식",
  "취미/여가",
  "패션/미용",
];

export default function PostWritePage({ onBack }: PostWritePageProps) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    p_title: "",
    p_content: "",
    p_region_tag: "",
    p_category_tag: "",
  });

  const [images, setImages] = useState<ImageItem[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  const handleChange = (name: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProvinceChange = (province: string | null) => {
    setSelectedProvince(province);
    setSelectedDistrict(null);

    if (!province) {
      handleChange("p_region_tag", "");
      return;
    }

    const districts = REGION_OPTIONS[province];

    if (districts.length === 0) {
      handleChange("p_region_tag", province);
    } else {
      handleChange("p_region_tag", "");
    }
  };

  const handleDistrictChange = (district: string | null) => {
    setSelectedDistrict(district);

    if (!selectedProvince || !district) {
      handleChange("p_region_tag", "");
      return;
    }

    handleChange("p_region_tag", `${selectedProvince} ${district}`);
  };

  const isTitleValid = form.p_title.trim().length >= 1;
  const isBodyValid = form.p_content.trim().length >= 1;
  const isRegionValid = !!form.p_region_tag;
  const isCategoryValid = !!form.p_category_tag;

  const canSubmit =
    isTitleValid && isBodyValid && isRegionValid && isCategoryValid;

  const DEMO_IMAGES: ImageItem[] = [
    { id: "1", emoji: "📸", name: "사진_001.jpg" },
    { id: "2", emoji: "🖼️", name: "사진_002.jpg" },
    { id: "3", emoji: "📷", name: "사진_003.jpg" },
  ];

  const handleAddImage = () => {
    if (images.length >= 5) return;
    const next = DEMO_IMAGES[images.length % DEMO_IMAGES.length];
    setImages((prev) => [...prev, { ...next, id: String(Date.now()) }]);
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

 const handleSubmit = async () => {
   console.log("전송할 form:", form);

   if (!canSubmit) return;

   try {
     setSubmitLoading(true);

     const token = localStorage.getItem("access_token");

     if (!token) {
       alert("로그인이 필요합니다.");
       navigate("/login");
       return;
     }

     const formData = new FormData();

     formData.append("p_title", form.p_title);
     formData.append("p_content", form.p_content);
     formData.append("p_region_tag", form.p_region_tag);
     formData.append("p_category_tag", form.p_category_tag);

     const response = await fetch("http://127.0.0.1:8000/community/posts/", {
       method: "POST",
       headers: {
         Authorization: `Bearer ${token}`,
       },
       body: formData,
     });
     if (!response.ok) {
       const errorData = await response.json();
       console.error("게시글 작성 실패:", errorData);
       throw new Error("게시글 작성 실패");
     }

     const data = await response.json();
     console.log("게시글 작성 성공:", data);

     alert("게시글이 등록되었습니다.");
     navigate("/community");
   } catch (error) {
     console.error(error);
     alert("게시글 등록 중 오류가 발생했습니다.");
   } finally {
     setSubmitLoading(false);
   }
 };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    navigate("/community");
  };

  return (
    <Box style={{ minHeight: "100vh", background: surface.bg }}>
      <AppShell header={{ height: 62 }} padding={0}>
        <AppShell.Header
          style={{
            background: "rgba(255,248,248,0.92)",
            backdropFilter: "blur(16px)",
            borderBottom: `1px solid ${border.default}`,
          }}
        >
          <Container size="xl" h="100%">
            <Group h="100%" justify="space-between">
              <Group gap="sm">
                <ActionIcon
                  variant="subtle"
                  size={36}
                  radius="xl"
                  onClick={handleBack}
                  style={{
                    border: `1.5px solid ${border.default}`,
                    background: surface.subtle,
                  }}
                >
                  <IconArrowLeft size={16} color={coralScale[6]} />
                </ActionIcon>

                <Breadcrumbs
                  separator="›"
                  separatorMargin={6}
                  styles={{ separator: { color: text.muted } }}
                >
                  <Anchor
                    size="sm"
                    c={text.muted}
                    style={{ textDecoration: "none" }}
                    onClick={() => navigate("/community")}
                  >
                    커뮤니티
                  </Anchor>
                  <Text size="sm" fw={600} c={text.primary}>
                    글쓰기
                  </Text>
                </Breadcrumbs>
              </Group>

              <Button
                size="sm"
                radius="md"
                leftSection={<IconSend size={14} />}
                disabled={!canSubmit}
                loading={submitLoading}
                onClick={handleSubmit}
                style={{
                  background: canSubmit ? gradient.primary : undefined,
                  border: "none",
                  boxShadow: canSubmit ? shadow.btn : "none",
                }}
              >
                등록하기
              </Button>
            </Group>
          </Container>
        </AppShell.Header>

        <AppShell.Main>
          <Container size="md" py="xl">
            <Stack gap="lg">
              <Card p="xl">
                <Group justify="space-between" mb="xs">
                  <Stack gap={2}>
                    <Text size="sm" fw={700} c={text.primary}>
                      지역
                    </Text>
                    <Text size="xs" c={text.muted}>
                      게시글을 보여줄 지역을 선택해주세요
                    </Text>
                  </Stack>

                  {form.p_region_tag && (
                    <Badge size="sm" color="coral" variant="light">
                      {form.p_region_tag}
                    </Badge>
                  )}
                </Group>

                <Stack gap="sm">
                  <Select
                    placeholder="시/도를 선택하세요"
                    data={Object.keys(REGION_OPTIONS)}
                    value={selectedProvince}
                    onChange={handleProvinceChange}
                    required
                    radius="md"
                    styles={inputStyles}
                  />

                  <Select
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
                    radius="md"
                    styles={inputStyles}
                  />
                </Stack>
              </Card>

              <Card p="xl">
                <Group justify="space-between" mb="xs">
                  <Stack gap={2}>
                    <Text size="sm" fw={700} c={text.primary}>
                      게시글 카테고리
                    </Text>
                    <Text size="xs" c={text.muted}>
                      게시글 성격에 맞는 카테고리를 선택해주세요
                    </Text>
                  </Stack>

                  {form.p_category_tag && (
                    <Badge size="sm" color="coral" variant="light">
                      {form.p_category_tag}
                    </Badge>
                  )}
                </Group>

                <Select
                  placeholder="카테고리를 선택하세요"
                  data={ALLOWED_CATEGORIES}
                  value={form.p_category_tag}
                  onChange={(value) =>
                    handleChange("p_category_tag", value || "")
                  }
                  required
                  radius="md"
                  styles={inputStyles}
                />
              </Card>

              <Card p="xl">
                <Stack gap="md">
                  <Box>
                    <Group justify="space-between" mb={6}>
                      <Text size="sm" fw={700} c={text.primary}>
                        제목{" "}
                        <Text component="span" c={coralScale[5]}>
                          *
                        </Text>
                      </Text>
                      <Text
                        size="xs"
                        c={
                          form.p_title.length > TITLE_MAX * 0.8
                            ? coralScale[5]
                            : text.muted
                        }
                      >
                        {form.p_title.length} / {TITLE_MAX}
                      </Text>
                    </Group>

                    <TextInput
                      placeholder="제목을 입력해주세요"
                      value={form.p_title}
                      onChange={(e) =>
                        handleChange(
                          "p_title",
                          e.currentTarget.value.slice(0, TITLE_MAX),
                        )
                      }
                      size="md"
                      radius="md"
                      styles={inputStyles}
                    />
                  </Box>

                  <Divider color={border.default} />

                  <Box>
                    <Group justify="space-between" mb={6}>
                      <Text size="sm" fw={700} c={text.primary}>
                        내용{" "}
                        <Text component="span" c={coralScale[5]}>
                          *
                        </Text>
                      </Text>
                      <Text
                        size="xs"
                        c={
                          form.p_content.length > BODY_MAX * 0.9
                            ? coralScale[5]
                            : text.muted
                        }
                      >
                        {form.p_content.length} / {BODY_MAX}
                      </Text>
                    </Group>

                    <Box data-color-mode="light">
                      <MDEditor
                        value={form.p_content}
                        onChange={(value) =>
                          handleChange(
                            "p_content",
                            (value ?? "").slice(0, BODY_MAX),
                          )
                        }
                        height={320}
                        preview="edit"
                        visibleDragbar={false}
                        textareaProps={{
                          placeholder:
                            "육아 경험, 고민, 정보를 자유롭게 나눠보세요 🌸\n\n비슷한 고민을 가진 다른 부모님들에게 큰 도움이 됩니다.",
                          maxLength: BODY_MAX,
                          onKeyDown: (e) => {
                            if (e.ctrlKey && e.key === "Enter") {
                              handleSubmit();
                            }
                          },
                        }}
                      />
                    </Box>
                  </Box>
                </Stack>
              </Card>

              <Card p="xl">
                <Group justify="space-between" mb="md">
                  <Stack gap={2}>
                    <Text size="sm" fw={700} c={text.primary}>
                      이미지 첨부
                    </Text>
                    <Text size="xs" c={text.muted}>
                      최대 5장, JPG·PNG·GIF 지원
                    </Text>
                  </Stack>
                  <Badge size="sm" color="coral" variant="light">
                    {images.length} / 5
                  </Badge>
                </Group>

                <Group gap="sm" wrap="wrap">
                  {images.length < 5 && (
                    <Box
                      onClick={handleAddImage}
                      style={{
                        width: 96,
                        height: 96,
                        borderRadius: 12,
                        border: `2px dashed ${border.strong}`,
                        background: surface.subtle,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        cursor: "pointer",
                      }}
                    >
                      <IconPhoto size={22} color={coralScale[4]} />
                      <Text size="xs" c={coralScale[5]} fw={500}>
                        사진 추가
                      </Text>
                    </Box>
                  )}

                  {images.map((img) => (
                    <Box
                      key={img.id}
                      style={{
                        width: 96,
                        height: 96,
                        borderRadius: 12,
                        background: coralScale[1],
                        border: `1.5px solid ${border.default}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 36,
                        position: "relative",
                      }}
                    >
                      {img.emoji}
                      <ActionIcon
                        size={20}
                        radius="xl"
                        color="dark"
                        variant="filled"
                        onClick={() => handleRemoveImage(img.id)}
                        style={{
                          position: "absolute",
                          top: -7,
                          right: -7,
                          background: text.primary,
                          boxShadow: "0 1px 4px rgba(0,0,0,.2)",
                        }}
                      >
                        <IconX size={11} color="white" />
                      </ActionIcon>
                    </Box>
                  ))}
                </Group>
              </Card>

              <Stack gap="xs">
                {!canSubmit && (
                  <Paper
                    p="sm"
                    radius="md"
                    style={{
                      background: coralScale[0],
                      border: `1.5px solid ${border.default}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <IconAlertCircle size={15} color={coralScale[5]} />
                    <Text size="xs" c={coralScale[6]}>
                      {!isRegionValid
                        ? "지역을 선택해주세요"
                        : !isCategoryValid
                          ? "카테고리를 선택해주세요"
                          : !isTitleValid
                            ? "제목을 입력해주세요"
                            : "내용을 입력해주세요"}
                    </Text>
                  </Paper>
                )}

                <Button
                  fullWidth
                  size="md"
                  radius="md"
                  leftSection={<IconSend size={16} />}
                  disabled={!canSubmit}
                  loading={submitLoading}
                  onClick={handleSubmit}
                >
                  게시글 등록하기
                </Button>
                
                <Text size="xs" c={text.muted} ta="center">
                  커뮤니티 이용 규칙을 준수하는 게시글을 작성해주세요
                </Text>
              </Stack>
            </Stack>
          </Container>
        </AppShell.Main>
      </AppShell>
    </Box>
  );
}

const inputStyles = {
  input: {
    minHeight: 46,
    backgroundColor: surface.white,
    border: `1.5px solid ${border.default}`,
    color: text.primary,
  },
  label: {
    color: colors.text.primary,
    fontWeight: 700,
    marginBottom: 6,
  },
  dropdown: {
    borderColor: border.default,
  },
  option: {
    color: text.primary,
  },
};
