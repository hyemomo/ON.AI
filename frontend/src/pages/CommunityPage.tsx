import { useState, useEffect } from "react";
import {
  MantineProvider,
  createTheme,
  AppShell,
  Group,
  Stack,
  Text,
  Button,
  Card,
  Box,
  SimpleGrid,
  Container,
  Select,
} from "@mantine/core";
import { IconMessageCircle, IconPencilPlus } from "@tabler/icons-react";
import {
  coralScale,
  border,
  shadow,
  surface,
  gradient,
  text,
} from "@/tokens/color";
import PostContentCard from "@/features/community/post-detail/components/PostContentCard";
import { ALLOWED_CATEGORIES } from "@/features/community/constants";
import type {
  CommunityPostsResponse,
  Post,
} from "@/features/community/post-detail/types/types";
import { REGION_OPTIONS } from "@/features/auth/constants/region";

const theme = createTheme({
  colors: { coral: coralScale },
  primaryColor: "coral",
  primaryShade: 5,
  fontFamily: "'Plus Jakarta Sans', 'Apple SD Gothic Neo', sans-serif",
  defaultRadius: "md",
  components: {
    Card: {
      defaultProps: { radius: "lg", withBorder: true },
      styles: {
        root: {
          borderColor: border.default,
          boxShadow: shadow.card,
          backgroundColor: surface.white,
          transition: "all 160ms ease-out",
          "&:hover": {
            borderColor: border.strong,
            boxShadow: shadow.cardHover,
            transform: "translateY(-1px)",
          },
        },
      },
    },
    Button: {
      styles: {
        root: { fontWeight: 600, transition: "all 160ms ease-out" },
      },
    },
    Badge: {
      defaultProps: { radius: "xl" },
    },
    TextInput: {
      styles: {
        input: {
          borderColor: border.default,
          backgroundColor: surface.white,
          "&:focus": { borderColor: coralScale[3] },
        },
      },
    },
  },
});

export default function CommunityPage() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedSido, setSelectedSido] = useState<string | null>(null);
  const [selectedSigungu, setSelectedSigungu] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("access_token");

        const params = new URLSearchParams();
        params.append("sort", "latest");

        if (selectedSido && selectedSigungu) {
          params.append("region", `${selectedSido} ${selectedSigungu}`);
        }

        if (activeCategory) {
          params.append("category", activeCategory);
        }

        const response = await fetch(
          `http://127.0.0.1:8000/community/posts?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data: CommunityPostsResponse = await response.json();

        if (!response.ok) {
          throw new Error("커뮤니티 게시글 조회 실패");
        }

        setPosts(data.posts);
      } catch (error) {
        console.error(error);
        alert("커뮤니티 게시글을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [activeCategory, selectedSido, selectedSigungu]);

  return (
    <MantineProvider theme={theme}>
      <Box
        style={{
          minHeight: "100vh",
          background: surface.bg,
          fontFamily: theme.fontFamily,
        }}
      >
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
                <Text
                  style={{
                    fontFamily: "DM Serif Display, serif",
                    fontSize: 22,
                    color: text.primary,
                    letterSpacing: "-0.3px",
                  }}
                >
                  ON<span style={{ color: coralScale[5] }}>.</span>AI
                </Text>
              </Group>
            </Container>
          </AppShell.Header>

          <AppShell.Main>
            <Container size="xl" py="xl">
              <SimpleGrid cols={{ base: 1 }} spacing="lg">
                <Stack gap="md">
                  <Group gap="sm" align="flex-end">
                    <Select
                      label="시/도"
                      placeholder="전체 지역"
                      data={["전체 지역", ...Object.keys(REGION_OPTIONS)]}
                      value={selectedSido ?? "전체 지역"}
                      onChange={(value) => {
                        if (value === "전체 지역") {
                          setSelectedSido(null);
                          setSelectedSigungu(null);
                          return;
                        }

                        setSelectedSido(value);
                        setSelectedSigungu(null);
                      }}
                      clearable={false}
                      w={180}
                    />

                    <Select
                      label="시/군/구"
                      placeholder="전체"
                      data={
                        selectedSido
                          ? ["전체", ...REGION_OPTIONS[selectedSido]]
                          : ["전체"]
                      }
                      value={selectedSigungu ?? "전체"}
                      onChange={(value) => {
                        setSelectedSigungu(value === "전체" ? null : value);
                      }}
                      disabled={
                        !selectedSido ||
                        REGION_OPTIONS[selectedSido].length === 0
                      }
                      clearable={false}
                      w={180}
                    />
                  </Group>

                  <Group gap="xs" wrap="wrap">
                    {ALLOWED_CATEGORIES.map((cat) => {
                      const isActive =
                        (cat === "전체" && activeCategory === null) ||
                        activeCategory === cat;

                      return (
                        <Button
                          key={cat}
                          size="xs"
                          radius="xl"
                          variant={isActive ? "light" : "outline"}
                          color="coral"
                          onClick={() =>
                            setActiveCategory(cat === "전체" ? null : cat)
                          }
                          style={{
                            fontWeight: 500,
                            borderColor: isActive
                              ? coralScale[3]
                              : border.default,
                            color: isActive ? coralScale[6] : text.secondary,
                            backgroundColor: isActive
                              ? coralScale[0]
                              : surface.white,
                          }}
                        >
                          {cat}
                        </Button>
                      );
                    })}
                  </Group>

                  <Stack gap="sm">
                    {loading ? (
                      <Card p="xl">
                        <Text ta="center" c={text.muted}>
                          게시글을 불러오는 중입니다...
                        </Text>
                      </Card>
                    ) : posts.length > 0 ? (
                      posts.map((post) => (
                        <PostContentCard key={post.postnum} post={post} />
                      ))
                    ) : (
                      <Card
                        p="xl"
                        withBorder
                        style={{
                          minHeight: 280,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderStyle: "dashed",
                          borderColor: border.default,
                          background: surface.white,
                        }}
                      >
                        <Stack align="center" gap="sm">
                          <Box
                            style={{
                              width: 72,
                              height: 72,
                              borderRadius: "50%",
                              background: coralScale[0],
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <IconMessageCircle
                              size={34}
                              color={coralScale[5]}
                            />
                          </Box>

                          <Text fw={700} size="lg" c={text.primary}>
                            아직 게시글이 없어요
                          </Text>

                          <Text size="sm" c={text.muted} ta="center" maw={320}>
                            선택한 지역과 카테고리에 등록된 게시글이 없습니다.
                            첫 번째 게시글을 작성해보세요.
                          </Text>

                          <Button
                            mt="xs"
                            color="coral"
                            radius="md"
                            leftSection={<IconPencilPlus size={16} />}
                            style={{
                              background: gradient.primary,
                              boxShadow: shadow.btn,
                            }}
                          >
                            게시글 작성하기
                          </Button>
                        </Stack>
                      </Card>
                    )}
                  </Stack>
                </Stack>
              </SimpleGrid>
            </Container>
          </AppShell.Main>
        </AppShell>
      </Box>
    </MantineProvider>
  );
}
