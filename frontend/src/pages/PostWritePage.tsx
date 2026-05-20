import { useState } from "react";
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
  Paper,
  Breadcrumbs,
  Anchor,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconArrowLeft,
  IconPhoto,
  IconX,
  IconSend,
  IconAlertCircle,
  IconHash,
} from "@tabler/icons-react";
import {
  coralScale,
  surface,
  text,
  border,
  shadow,
  gradient,
} from "@/tokens/color";
import {
  BODY_MAX,
  CATEGORIES,
  TITLE_MAX,
} from "@/features/community/post-write/constants/constants";
import MDEditor from "@uiw/react-md-editor";
interface ImageItem {
  id: string;
  emoji: string;
  name: string;
}
interface PostWritePageProps {
  onBack?: () => void;
  onSubmit?: (data: { title: string; body: string; category: string }) => void;
}

export default function PostWritePage({
  onBack,
  onSubmit,
}: PostWritePageProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
    useDisclosure(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // 유효성
  const isTitleValid = title.trim().length >= 0;
  const isBodyValid = body.trim().length >= 0;
  const isCategoryValid = !!category;
  const canSubmit = isTitleValid && isBodyValid && isCategoryValid;

  // 이미지 추가 (데모용 이모지)
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

  // 태그 추가
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim() && tags.length < 5) {
      setTags((prev) => [...prev, tagInput.trim()]);
      setTagInput("");
    }
  };
  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  // 제출
  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitLoading(true);
    setTimeout(() => {
      setSubmitLoading(false);
      onSubmit?.({ title, body, category: category! });
    }, 1200);
  };

  return (
    <Box style={{ minHeight: "100vh", background: surface.bg }}>
      {/* ──
      
      
      AppShell Header ── */}
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
              {/* 왼쪽: 뒤로가기 + 브레드크럼 */}
              <Group gap="sm">
                <ActionIcon
                  variant="subtle"
                  size={36}
                  radius="xl"
                  onClick={onBack}
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
                  >
                    커뮤니티
                  </Anchor>
                  <Text size="sm" fw={600} c={text.primary}>
                    글쓰기
                  </Text>
                </Breadcrumbs>
              </Group>

              {/* 오른쪽: 미리보기 + 등록 */}

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
              {/* ── 카테고리 선택 ── */}
              <Card p="xl">
                <Text size="sm" fw={700} c={text.primary} mb="sm">
                  카테고리{" "}
                  <Text component="span" c={coralScale[5]}>
                    *
                  </Text>
                </Text>
                <Group gap="xs" wrap="wrap">
                  {CATEGORIES.map((cat) => (
                    <Button
                      key={cat.value}
                      size="xs"
                      radius="xl"
                      variant={category === cat.value ? "filled" : "outline"}
                      onClick={() => setCategory(cat.value)}
                      style={{
                        background:
                          category === cat.value
                            ? gradient.primary
                            : surface.white,
                        borderColor:
                          category === cat.value
                            ? "transparent"
                            : border.default,
                        color:
                          category === cat.value ? "white" : text.secondary,
                        boxShadow: category === cat.value ? shadow.btn : "none",
                        fontWeight: 500,
                        transition: "all 160ms ease-out",
                      }}
                    >
                      {cat.label}
                    </Button>
                  ))}
                </Group>
                {!isCategoryValid && category === null && (
                  <Text size="xs" c={text.muted} mt={8}>
                    카테고리를 선택해주세요
                  </Text>
                )}
              </Card>

              {/* ── 제목 + 본문 ── */}
              <Card p="xl">
                <Stack gap="md">
                  {/* 제목 */}
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
                          title.length > TITLE_MAX * 0.8
                            ? coralScale[5]
                            : text.muted
                        }
                      >
                        {title.length} / {TITLE_MAX}
                      </Text>
                    </Group>
                    <TextInput
                      placeholder="제목을 입력해주세요"
                      value={title}
                      onChange={(e) =>
                        setTitle(e.currentTarget.value.slice(0, TITLE_MAX))
                      }
                      size="md"
                      radius="md"
                      error={
                        title.length > 0 && !isTitleValid
                          ? "제목은 최소 5자 이상 입력해주세요"
                          : undefined
                      }
                      styles={{
                        input: {
                          fontSize: 16,
                          fontWeight: 500,
                          color: text.primary,
                          borderColor:
                            !isTitleValid && title.length > 0
                              ? coralScale[5]
                              : border.default,
                        },
                      }}
                    />
                  </Box>

                  <Divider color={border.default} />

                  {/* 에디터 툴바 */}
                  <Box>
                    {/* 본문 Textarea */}
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
                          body.length > BODY_MAX * 0.9
                            ? coralScale[5]
                            : text.muted
                        }
                      >
                        {body.length} / {BODY_MAX}
                      </Text>
                    </Group>
                    <Box data-color-mode="light">
                      <MDEditor
                        value={body}
                        onChange={(value) => {
                          setBody((value ?? "").slice(0, BODY_MAX));
                        }}
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
                    {body.length > 0 && !isBodyValid && (
                      <Text size="xs" c={coralScale[5]} mt={4}>
                        내용은 최소 10자 이상 입력해주세요
                      </Text>
                    )}
                  </Box>
                </Stack>
              </Card>

              {/* ── 이미지 첨부 ── */}
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
                  {/* 추가 버튼 */}
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
                        transition: "all 160ms ease-out",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = coralScale[4];
                        e.currentTarget.style.background = coralScale[0];
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = border.strong;
                        e.currentTarget.style.background = surface.subtle;
                      }}
                    >
                      <IconPhoto size={22} color={coralScale[4]} />
                      <Text size="xs" c={coralScale[5]} fw={500}>
                        사진 추가
                      </Text>
                    </Box>
                  )}

                  {/* 이미지 프리뷰 */}
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
                        overflow: "visible",
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

              {/* ── 태그 ── */}
              <Card p="xl">
                <Group justify="space-between" mb="xs">
                  <Stack gap={2}>
                    <Text size="sm" fw={700} c={text.primary}>
                      태그
                    </Text>
                    <Text size="xs" c={text.muted}>
                      Enter로 추가, 최대 5개
                    </Text>
                  </Stack>
                  <Badge size="sm" color="coral" variant="light">
                    {tags.length} / 5
                  </Badge>
                </Group>

                <Paper
                  p="sm"
                  radius="md"
                  style={{
                    border: `1.5px solid ${border.default}`,
                    background: surface.white,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    alignItems: "center",
                    minHeight: 48,
                  }}
                >
                  {/* 태그 pills */}
                  {tags.map((tag) => (
                    <Box
                      key={tag}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        background: coralScale[0],
                        border: `1.5px solid ${border.strong}`,
                        borderRadius: 100,
                        padding: "4px 10px",
                      }}
                    >
                      <IconHash size={10} color={coralScale[5]} />
                      <Text size="xs" fw={500} c={coralScale[6]}>
                        {tag}
                      </Text>
                      <ActionIcon
                        size={14}
                        variant="transparent"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <IconX size={10} color={coralScale[5]} />
                      </ActionIcon>
                    </Box>
                  ))}

                  {/* 입력 */}
                  {tags.length < 5 && (
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.currentTarget.value)}
                      onKeyDown={handleAddTag}
                      placeholder={
                        tags.length === 0
                          ? "# 태그를 입력하세요"
                          : "# 태그 추가"
                      }
                      style={{
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        fontFamily: "inherit",
                        fontSize: 13.5,
                        color: text.primary,
                        flex: 1,
                        minWidth: 100,
                      }}
                    />
                  )}
                </Paper>

                {/* 추천 태그 */}
                <Group gap={6} mt="sm">
                  <Text size="xs" c={text.muted}>
                    추천:
                  </Text>
                  {["14개월", "발열", "해열제", "ON.AI", "초보맘"].map((t) => (
                    <Box
                      key={t}
                      onClick={() => {
                        if (tags.length < 5 && !tags.includes(t))
                          setTags((prev) => [...prev, t]);
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 12,
                        color: text.muted,
                        border: `1px solid ${border.default}`,
                        borderRadius: 100,
                        padding: "2px 10px",
                        cursor: "pointer",
                        background: surface.white,
                        transition: "all 160ms ease-out",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = coralScale[3];
                        e.currentTarget.style.color = coralScale[6];
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = border.default;
                        e.currentTarget.style.color = text.muted;
                      }}
                    >
                      # {t}
                    </Box>
                  ))}
                </Group>
              </Card>
              {/* ── 최종 등록 버튼 ── */}
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
                      {!isCategoryValid
                        ? "카테고리를 선택해주세요"
                        : !isTitleValid
                          ? "제목을 5자 이상 입력해주세요"
                          : "내용을 10자 이상 입력해주세요"}
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
                  style={{
                    background: canSubmit ? gradient.primary : undefined,
                    border: "none",
                    boxShadow: canSubmit ? shadow.btn : "none",
                    height: 48,
                    fontSize: 15,
                  }}
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
