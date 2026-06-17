import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Container,
  Group,
  Image,
  ScrollArea,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { IconMessageCircle, IconPencilPlus } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import communityIcon from "@/assets/images/onai-community-icon.png";
import { apiFetch } from "@/lib/api";
import {
  border,
  coralScale,
  gradient,
  shadow,
  surface,
  text,
} from "@/tokens/color";
import PostContentCard from "@/features/community/post-detail/components/PostContentCard";
import { ALLOWED_CATEGORIES } from "@/features/community/constants";
import type {
  CommunityPostsResponse,
  MyPageUser,
  Post,
} from "@/features/community/post-detail/types/types";
import { REGION_OPTIONS } from "@/features/auth/constants/region";

type SortType = "latest" | "popular";

const regionOptions = REGION_OPTIONS as Record<string, string[]>;

export default function CommunityPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<MyPageUser | null>(null);

  const [sort, setSort] = useState<SortType>("latest");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedSido, setSelectedSido] = useState<string | null>(null);
  const [selectedSigungu, setSelectedSigungu] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        const data = await apiFetch<MyPageUser>("/mypage/me");

        if (!isMounted) return;

        setCurrentUser(data);
      } catch (error) {
        console.error(error);
      }
    };

    void loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadPosts = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        params.append("sort", sort);

        if (selectedSido === "전국") {
          params.append("region", "전국");
        } else if (selectedSido && selectedSigungu) {
          params.append("region", `${selectedSido} ${selectedSigungu}`);
        }

        if (activeCategory) {
          params.append("category", activeCategory);
        }

        const data = await apiFetch<CommunityPostsResponse>(
          `/community/posts?${params.toString()}`,
        );

        if (!isMounted) return;

        setPosts(data.posts ?? []);
      } catch (error) {
        console.error(error);

        if (!isMounted) return;

        alert("커뮤니티 게시글을 불러오지 못했습니다.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadPosts();

    return () => {
      isMounted = false;
    };
  }, [sort, activeCategory, selectedSido, selectedSigungu]);

  const handleDeletePost = async (postnum: number) => {
    const ok = window.confirm("게시글을 삭제하시겠습니까?");
    if (!ok) return;

    try {
      await apiFetch(`/community/posts/${postnum}`, {
        method: "DELETE",
      });

      alert("게시글이 삭제되었습니다.");
      setPosts((prev) => prev.filter((post) => post.postnum !== postnum));
    } catch (error) {
      console.error(error);
      alert("게시글 삭제에 실패했습니다.");
    }
  };

  const sidoData = ["전체 지역", "전국", ...Object.keys(regionOptions)];

  const sigunguData =
    selectedSido && selectedSido !== "전국"
      ? ["전체", ...(regionOptions[selectedSido] ?? [])]
      : ["전체"];

  return (
    <AppLayout>
      <Box
        style={{
          background: surface.bg,
        }}
      >
        <Container
          size="xl"
          h="100%"
          py="md"
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <SimpleGrid
            cols={{ base: 1 }}
            spacing="lg"
            style={{
              height: "100%",
              minHeight: 0,
            }}
          >
            <Stack
              gap="sm"
              h="100%"
              style={{ minHeight: 0, overflow: "hidden" }}
            >
              <Box style={{ flexShrink: 0 }}>
                <Group justify="space-between" align="center">
                  <Group gap="md" align="center" wrap="nowrap">
                    <Image
                      src={communityIcon}
                      alt="ON.AI 커뮤니티 아이콘"
                      fit="contain"
                      style={{
                        width: 76,
                        height: 76,
                        objectFit: "contain",
                        flexShrink: 0,
                      }}
                    />

                    <Stack gap={4} style={{ minWidth: 0 }}>
                      <Text fw={800} size="xl" c={text.primary}>
                        커뮤니티
                      </Text>

                      <Text size="sm" c={text.secondary}>
                        동네 부모님들과 육아 이야기를 나눠보세요.
                      </Text>
                    </Stack>
                  </Group>

                  <Button
                    onClick={() => navigate("/community/post/new")}
                    leftSection={<IconPencilPlus size={16} />}
                    radius="xl"
                    style={{
                      background: gradient.primary,
                      boxShadow: shadow.btn,
                      flexShrink: 0,
                    }}
                  >
                    게시글 작성
                  </Button>
                </Group>
              </Box>

              <Card
                px="md"
                py="sm"
                withBorder
                radius="lg"
                style={{
                  flexShrink: 0,
                  background: surface.white,
                  borderColor: border.default,
                  boxShadow: shadow.card,
                }}
              >
                <Stack gap={12}>
                  <Group
                    justify="space-between"
                    align="center"
                    gap="md"
                    wrap="wrap"
                  >
                    <SegmentedControl
                      color="coral"
                      radius="xl"
                      value={sort}
                      onChange={(value) => setSort(value as SortType)}
                      data={[
                        { label: "최신글", value: "latest" },
                        { label: "인기글", value: "popular" },
                      ]}
                      styles={{
                        root: {
                          height: 34,
                        },
                        label: {
                          height: 28,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 600,
                        },
                      }}
                    />

                    <Group gap="xs" align="center" wrap="nowrap">
                      <Select
                        placeholder="시/도"
                        data={sidoData}
                        value={selectedSido ?? "전체 지역"}
                        onChange={(value) => {
                          if (value === "전체 지역") {
                            setSelectedSido(null);
                            setSelectedSigungu(null);
                            return;
                          }

                          if (value === "전국") {
                            setSelectedSido("전국");
                            setSelectedSigungu(null);
                            return;
                          }

                          setSelectedSido(value);
                          setSelectedSigungu(null);
                        }}
                        clearable={false}
                        w={142}
                        size="xs"
                        styles={{
                          input: {
                            minHeight: 34,
                            height: 34,
                          },
                        }}
                      />

                      <Select
                        placeholder="시/군/구"
                        data={sigunguData}
                        value={selectedSigungu ?? "전체"}
                        onChange={(value) => {
                          setSelectedSigungu(value === "전체" ? null : value);
                        }}
                        disabled={
                          !selectedSido ||
                          selectedSido === "전국" ||
                          (regionOptions[selectedSido] ?? []).length === 0
                        }
                        clearable={false}
                        w={142}
                        size="xs"
                        styles={{
                          input: {
                            minHeight: 34,
                            height: 34,
                          },
                        }}
                      />
                    </Group>
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
                            height: 28,
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
                </Stack>
              </Card>

              <ScrollArea
                style={{
                  flex: 1,
                  minHeight: 0,
                }}
                styles={{
                  root: {
                    flex: 1,
                    minHeight: 0,
                  },
                  viewport: {
                    paddingRight: 4,
                  },
                  scrollbar: {
                    display: "none",
                  },
                }}
              >
                <Stack gap="sm" pb="md">
                  {loading ? (
                    <Card p="xl">
                      <Text ta="center" c={text.muted}>
                        게시글을 불러오는 중입니다...
                      </Text>
                    </Card>
                  ) : posts.length > 0 ? (
                    posts.map((post) => (
                      <PostContentCard
                        key={post.postnum}
                        post={post}
                        currentUsernum={currentUser?.usernum}
                        onDelete={handleDeletePost}
                      />
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
                          <IconMessageCircle size={34} color={coralScale[5]} />
                        </Box>

                        <Text fw={700} size="lg" c={text.primary}>
                          아직 게시글이 없어요
                        </Text>

                        <Text size="sm" c={text.muted} ta="center" maw={320}>
                          선택한 조건에 등록된 게시글이 없습니다. 첫 번째
                          게시글을 작성해보세요.
                        </Text>

                        <Button
                          mt="xs"
                          color="coral"
                          radius="md"
                          leftSection={<IconPencilPlus size={16} />}
                          onClick={() => navigate("/community/post/new")}
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
              </ScrollArea>
            </Stack>
          </SimpleGrid>
        </Container>
      </Box>
    </AppLayout>
  );
}
