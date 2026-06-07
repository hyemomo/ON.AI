import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
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
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconEdit,
  IconPhoto,
  IconSend,
  IconX,
} from "@tabler/icons-react";
import MDEditor, { commands } from "@uiw/react-md-editor";
import AppLayout from "@/components/AppLayout";
import { apiFetch } from "@/lib/api";
import {
  BODY_MAX,
  CATEGORIES,
  TITLE_MAX,
} from "@/features/community/post-write/constants/constants";
import { REGION_OPTIONS } from "@/features/auth/constants/region";
import {
  border,
  coralScale,
  gradient,
  shadow,
  surface,
  text,
} from "@/tokens/color";
import type { Post } from "@/features/community/post-detail/types/types";

type ImageItem = {
  id: string;
  file: File;
  previewUrl: string;
};

type PostDetailResponse = {
  post: Post;
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
  created_at: string;
};

type PostForm = {
  p_title: string;
  p_content: string;
  p_region_tag: string;
  p_category_tag: string;
};

const regionOptions = REGION_OPTIONS as Record<string, string[]>;

const REGION_PROVINCES = ["전국", ...Object.keys(regionOptions)];

const DEFAULT_REGION = "전국";
const DEFAULT_CATEGORY = "자유";

const inputStyles = {
  input: {
    borderColor: border.default,
    background: surface.white,
  },
};

function removeMarkdownHeadings(markdown: string) {
  return markdown.replace(/^#{1,6}\s+/gm, "");
}

function getProvinceFromRegion(region: string) {
  if (!region || region === "전국") {
    return "전국";
  }

  const matchedProvince = Object.keys(regionOptions).find((province) =>
    region.startsWith(province),
  );

  return matchedProvince ?? "전국";
}

function getProvinceDistricts(province: string) {
  if (!province || province === "전국") {
    return ["전국"];
  }

  const districts = regionOptions[province] ?? [];

  if (districts.length === 0) {
    return [province];
  }

  return districts.map((district) => `${province} ${district}`);
}

export default function PostWritePage() {
  const navigate = useNavigate();
  const params = useParams();

  const postnum = params.postnum;
  const isEditMode = !!postnum;

  const [form, setForm] = useState<PostForm>({
    p_title: "",
    p_content: "",
    p_region_tag: DEFAULT_REGION,
    p_category_tag: DEFAULT_CATEGORY,
  });

  const [images, setImages] = useState<ImageItem[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [selectedRegionProvince, setSelectedRegionProvince] =
    useState(DEFAULT_REGION);

  const selectedProvinceDistricts = getProvinceDistricts(
    selectedRegionProvince,
  );

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        if (isEditMode && postnum) {
          const data = await apiFetch<PostDetailResponse>(
            `/community/posts/${postnum}`,
          );

          if (!isMounted) return;

          const post = data.post;
          const region = post.p_region_tag || DEFAULT_REGION;

          setForm({
            p_title: post.p_title ?? "",
            p_content: post.p_content ?? "",
            p_region_tag: region,
            p_category_tag: post.p_category_tag || DEFAULT_CATEGORY,
          });

          setSelectedRegionProvince(getProvinceFromRegion(region));
          return;
        }

        const myPageData = await apiFetch<MyPageResponse>("/mypage/me");
        const defaultRegion = myPageData.region || DEFAULT_REGION;

        if (!isMounted) return;

        setForm((prev) => ({
          ...prev,
          p_region_tag: defaultRegion,
          p_category_tag: DEFAULT_CATEGORY,
        }));

        setSelectedRegionProvince(getProvinceFromRegion(defaultRegion));
      } catch (error) {
        console.error(error);

        if (!isMounted) return;

        if (isEditMode) {
          alert("게시글 정보를 불러오지 못했습니다.");
          navigate("/community");
          return;
        }

        setForm((prev) => ({
          ...prev,
          p_region_tag: DEFAULT_REGION,
          p_category_tag: DEFAULT_CATEGORY,
        }));

        setSelectedRegionProvince(DEFAULT_REGION);
      } finally {
        if (isMounted) {
          setPageLoading(false);
        }
      }
    };

    void loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [isEditMode, postnum, navigate]);

  const handleImageUpload = (files: File[] | null) => {
    if (!files) return;

    const remainingCount = 10 - images.length;

    if (remainingCount <= 0) {
      alert("사진은 최대 10장까지 등록할 수 있습니다.");
      return;
    }

    const selectedFiles = files.slice(0, remainingCount);

    const newImages = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);

      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return prev.filter((img) => img.id !== id);
    });
  };

  const handleChange = (name: keyof PostForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectRegion = (region: string) => {
    handleChange("p_region_tag", region);
  };

  const handleSelectCategory = (category: string) => {
    handleChange("p_category_tag", category);
  };

  const isTitleValid = form.p_title.trim().length >= 1;
  const isBodyValid = form.p_content.trim().length >= 1;
  const isRegionValid = !!form.p_region_tag;
  const isCategoryValid = !!form.p_category_tag;

  const canSubmit =
    isTitleValid && isBodyValid && isRegionValid && isCategoryValid;

  const handleCreatePost = async () => {
    const formData = new FormData();

    formData.append("p_title", form.p_title.trim());
    formData.append("p_content", removeMarkdownHeadings(form.p_content.trim()));
    formData.append("p_region_tag", form.p_region_tag);
    formData.append("p_category_tag", form.p_category_tag);

    images.forEach((img, index) => {
      formData.append(`image_${index + 1}`, img.file);
    });

    const token = localStorage.getItem("access_token");

    const response = await fetch("http://127.0.0.1:8000/community/posts/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      const message =
        data && typeof data === "object" && "detail" in data
          ? String(data.detail)
          : "게시글 작성 실패";

      throw new Error(message);
    }
  };

  const handleUpdatePost = async () => {
    if (!postnum) return;

    await apiFetch(`/community/posts/${postnum}`, {
      method: "PUT",
      json: {
        p_title: form.p_title.trim(),
        p_content: removeMarkdownHeadings(form.p_content.trim()),
        p_region_tag: form.p_region_tag,
        p_category_tag: form.p_category_tag,
      },
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      alert("제목, 내용, 지역, 카테고리를 모두 입력해주세요.");
      return;
    }

    try {
      setSubmitLoading(true);

      if (isEditMode) {
        await handleUpdatePost();
        alert("게시글이 수정되었습니다.");
        navigate(`/community/posts/${postnum}`);
      } else {
        await handleCreatePost();
        alert("게시글이 등록되었습니다.");
        navigate("/community");
      }
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : isEditMode
            ? "게시글 수정 중 오류가 발생했습니다."
            : "게시글 등록 중 오류가 발생했습니다.",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <AppLayout>
        <Box style={{ minHeight: "100vh", background: surface.bg }}>
          <Container size="md" py="xl">
            <Card p="xl" radius="xl" withBorder>
              <Text ta="center" c={text.muted}>
                게시글 정보를 불러오는 중입니다...
              </Text>
            </Card>
          </Container>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box style={{ minHeight: "100vh", background: surface.bg }}>
        <Container size="md" py="xl">
          <Stack gap="lg">
            <Group justify="space-between" align="center">
              <Button
                variant="subtle"
                color="coral"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() =>
                  navigate(
                    isEditMode && postnum
                      ? `/community/posts/${postnum}`
                      : "/community",
                  )
                }
              >
                돌아가기
              </Button>

              <Button
                size="sm"
                radius="xl"
                leftSection={<IconSend size={14} />}
                disabled={!canSubmit}
                loading={submitLoading}
                onClick={() => void handleSubmit()}
                style={{
                  background: canSubmit ? gradient.primary : undefined,
                  border: "none",
                  boxShadow: canSubmit ? shadow.btn : "none",
                }}
              >
                {isEditMode ? "수정하기" : "등록하기"}
              </Button>
            </Group>

            <Stack gap={4}>
              <Title order={2} c={text.primary}>
                {isEditMode ? "게시글 수정" : "게시글 작성"}
              </Title>

              <Text size="sm" c={text.secondary}>
                육아 경험, 고민, 정보를 자유롭게 나눠보세요.
              </Text>
            </Stack>

            <Card p="xl" radius="xl" withBorder>
              <Stack gap="md">
                <Group justify="space-between" align="flex-start">
                  <Stack gap={2}>
                    <Text size="sm" fw={700} c={text.primary}>
                      지역{" "}
                      <Text component="span" c={coralScale[5]}>
                        *
                      </Text>
                    </Text>

                    <Text size="xs" c={text.muted}>
                      게시글을 보여줄 지역을 1개 선택해주세요. 기본값은 내
                      거주지입니다.
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
                    지역 수정
                  </Button>
                </Group>

                <Divider color={border.default} />

                <Group gap="xs" wrap="wrap">
                  {form.p_region_tag ? (
                    <Badge color="coral" variant="filled" size="lg">
                      {form.p_region_tag}
                    </Badge>
                  ) : (
                    <Text size="sm" c={text.muted}>
                      선택한 지역이 없습니다.
                    </Text>
                  )}
                </Group>
              </Stack>
            </Card>

            <Card p="xl" radius="xl" withBorder>
              <Stack gap="md">
                <Stack gap={2}>
                  <Text size="sm" fw={700} c={text.primary}>
                    게시글 카테고리{" "}
                    <Text component="span" c={coralScale[5]}>
                      *
                    </Text>
                  </Text>

                  <Text size="xs" c={text.muted}>
                    게시글 성격에 맞는 카테고리를 1개 선택해주세요.
                  </Text>
                </Stack>

                <Divider color={border.default} />

                <Group gap="xs" wrap="wrap">
                  {CATEGORIES.map((category) => {
                    const value =
                      typeof category === "string" ? category : category.value;
                    const label =
                      typeof category === "string" ? category : category.label;
                    const isActive = form.p_category_tag === value;

                    return (
                      <Button
                        key={value}
                        size="xs"
                        radius="xl"
                        variant={isActive ? "filled" : "light"}
                        color="coral"
                        onClick={() => handleSelectCategory(value)}
                      >
                        {label}
                      </Button>
                    );
                  })}
                </Group>

                {form.p_category_tag && (
                  <Text size="xs" c={text.muted}>
                    선택된 카테고리: {form.p_category_tag}
                  </Text>
                )}
              </Stack>
            </Card>

            <Card p="xl" radius="xl" withBorder>
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
                      commands={[
                        commands.bold,
                        commands.italic,
                        commands.strikethrough,
                        commands.divider,
                        commands.quote,
                        commands.unorderedListCommand,
                        commands.orderedListCommand,
                        commands.link,
                        commands.code,
                        commands.codeBlock,
                      ]}
                      textareaProps={{
                        placeholder:
                          "육아 경험, 고민, 정보를 자유롭게 나눠보세요 🌸\n\n비슷한 고민을 가진 다른 부모님들에게 큰 도움이 됩니다.",
                        maxLength: BODY_MAX,
                        onKeyDown: (e) => {
                          if (e.ctrlKey && e.key === "Enter") {
                            void handleSubmit();
                          }
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Stack>
            </Card>

            {!isEditMode && (
              <Card p="xl" radius="xl" withBorder>
                <Group justify="space-between" mb="md">
                  <Stack gap={2}>
                    <Text size="sm" fw={700} c={text.primary}>
                      사진
                    </Text>

                    <Text size="xs" c={text.muted}>
                      최대 10장, JPG·PNG·GIF 지원
                    </Text>
                  </Stack>

                  <Badge size="sm" color="coral" variant="light">
                    {images.length} / 10
                  </Badge>
                </Group>

                <Group gap="sm" wrap="wrap">
                  {images.length < 10 && (
                    <FileButton
                      onChange={handleImageUpload}
                      accept="image/png,image/jpeg,image/gif"
                      multiple
                    >
                      {(props) => (
                        <Box
                          {...props}
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
                    </FileButton>
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
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        src={img.previewUrl}
                        alt="업로드 이미지"
                        width={96}
                        height={96}
                        fit="cover"
                      />

                      <Button
                        variant="filled"
                        color="red"
                        size="compact-xs"
                        radius="xl"
                        onClick={() => handleRemoveImage(img.id)}
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          width: 22,
                          height: 22,
                          padding: 0,
                        }}
                      >
                        <IconX size={13} />
                      </Button>
                    </Box>
                  ))}
                </Group>
              </Card>
            )}

            {isEditMode && (
              <Card p="md" radius="xl" withBorder bg={surface.subtle}>
                <Text size="sm" c={text.secondary}>
                  게시글 수정에서는 사진 추가, 삭제, 교체를 지원하지 않습니다.
                </Text>
              </Card>
            )}
          </Stack>
        </Container>
      </Box>

      <Modal
        opened={isRegionModalOpen}
        onClose={() => setIsRegionModalOpen(false)}
        title="게시글 지역 선택"
        centered
        size="lg"
      >
        <Stack gap="md">
          <Text size="sm" c={text.secondary}>
            왼쪽에서 1차 지역을 선택한 뒤, 오른쪽에서 게시글 지역을 1개
            선택하세요. 전국 게시글은 `전국`을 선택하면 됩니다.
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
                    const isSelected = form.p_region_tag === region;

                    return (
                      <Button
                        key={region}
                        size="xs"
                        radius="xl"
                        variant={isSelected ? "filled" : "light"}
                        color="coral"
                        onClick={() => handleSelectRegion(region)}
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
                  선택된 지역
                </Text>

                <Text size="xs" c={text.muted}>
                  1 / 1
                </Text>
              </Group>

              {form.p_region_tag ? (
                <Group gap="xs" wrap="wrap">
                  <Badge color="coral" variant="filled">
                    {form.p_region_tag}
                  </Badge>
                </Group>
              ) : (
                <Text size="sm" c={text.muted}>
                  아직 선택한 지역이 없습니다.
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
              leftSection={<IconDeviceFloppy size={14} />}
              onClick={() => setIsRegionModalOpen(false)}
              style={{ background: gradient.primary, boxShadow: shadow.btn }}
            >
              적용
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AppLayout>
  );
}
