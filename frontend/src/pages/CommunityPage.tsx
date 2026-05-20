// CommunityPage.tsx
// 의존성: @mantine/core @mantine/hooks @tabler/icons-react
// 실행: npm install @mantine/core @mantine/hooks @tabler/icons-react

import { useState } from 'react';
import {
  MantineProvider,
  createTheme,
  AppShell,
  Group,
  Stack,
  Text,
  Badge,
  Avatar,
  Button,
  ActionIcon,
  Card,
  Box,
  SimpleGrid,
  Paper,
  Indicator,
  Container,
} from '@mantine/core';
import {
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import {
  coralScale,
  border,
  shadow,
  surface,
  gradient,
  text,
} from "@/tokens/color";
import PostContentCard from '@/features/community/post-detail/components/PostContentCard';


const theme = createTheme({
  colors: { coral: coralScale },
  primaryColor: 'coral',
  primaryShade: 5,
  fontFamily: "'Plus Jakarta Sans', 'Apple SD Gothic Neo', sans-serif",
  defaultRadius: 'md',
  components: {
    Card: {
      defaultProps: { radius: 'lg', withBorder: true },
      styles: {
        root: {
          borderColor: border.default,
          boxShadow: shadow.card,
          backgroundColor: surface.white,
          transition: 'all 160ms ease-out',
          '&:hover': {
            borderColor: border.strong,
            boxShadow: shadow.cardHover,
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    Button: {
      styles: {
        root: { fontWeight: 600, transition: 'all 160ms ease-out' },
      },
    },
    Badge: {
      defaultProps: { radius: 'xl' },
    },
    TextInput: {
      styles: {
        input: {
          borderColor: border.default,
          backgroundColor: surface.white,
          '&:focus': { borderColor: coralScale[3] },
        },
      },
    },
  },
});

// ─── 타입 ────────────────────────────────────────────────────────
interface Post {
  id: number;
  author: string;
  authorLevel?: string;
  childAge: string;
  timeAgo: string;
  category: string;
  categoryColor: string;
  title: string;
  body: string;
  emoji: string;
  images?: string[];
  likes: number;
  comments: number;
  views: number;
  isHot?: boolean;
  liked?: boolean;
}

interface HotTopic {
  rank: number;
  title: string;
  comments: number;
}

interface ActiveUser {
  name: string;
  emoji: string;
  activity: string;
  tag: string;
  tagColor: string;
}

// ─── 데이터 ──────────────────────────────────────────────────────
const CATEGORIES = ['전체', '🌡️ 건강·증상', '🥣 이유식·식이', '😴 수면', '📏 성장·발달', '💬 육아 고민', '🎉 성장 기록'];

const POSTS: Post[] = [
  {
    id: 1,
    author: '김지연',
    authorLevel: '레벨 5',
    childAge: '14개월',
    timeAgo: '2시간 전',
    category: '🌡️ 건강',
    categoryColor: 'green',
    title: '새벽에 열이 38.9도까지 올랐어요 — ON.AI가 알려준 대로 했더니 효과가 있었어요',
    body: '어젯밤 새벽 2시에 아이 열이 갑자기 38.9도까지 올라서 너무 무서웠는데, ON.AI 도우미한테 물어봤더니 침착하게 단계별로 알려줘서 잘 넘겼어요. 타이레놀 간격이나 수분 보충 방법까지 너무 친절하게...',
    emoji: '🐣',
    likes: 284,
    comments: 72,
    views: 1284,
    isHot: true,
    liked: true,
  },
  {
    id: 2,
    author: '박수민',
    childAge: '7개월',
    timeAgo: '3시간 전',
    category: '🥣 이유식',
    categoryColor: 'yellow',
    title: '7개월 아이 이유식 처음 시작했어요! 애호박 미음 성공 🥕',
    body: '드디어 이유식 첫날! 애호박 미음을 직접 만들었는데 생각보다 어렵지 않더라고요. 블렌더로 갈아서 체에 거르니까 부드럽게 됐어요. 아이가 생각보다 잘 먹어서 뿌듯했어요 ㅎㅎ',
    emoji: '🌷',
    images: ['🥕', '🍲', '😋'],
    likes: 48,
    comments: 13,
    views: 412,
  },
  {
    id: 3,
    author: '이준혁',
    authorLevel: '아빠 참여',
    childAge: '18개월',
    timeAgo: '5시간 전',
    category: '😴 수면',
    categoryColor: 'pink',
    title: '수면 교육 3일째 — 드디어 혼자 잠들었어요 (feat. 눈물의 기록)',
    body: '페이딩법으로 수면 교육 시작한 지 3일째예요. 처음 이틀은 정말 너무 힘들었는데 오늘 드디어 혼자 잠들었어요! 약 12분 울다가 스르르... 아내랑 둘이 거실에서 서로 손잡고 있었어요 😂',
    emoji: '🐻',
    likes: 127,
    comments: 34,
    views: 893,
    liked: true,
  },
  {
    id: 4,
    author: '최예진',
    childAge: '24개월',
    timeAgo: '어제',
    category: '💬 육아 고민',
    categoryColor: 'coral',
    title: '어린이집 거부하는 아이, 어떻게 하셨어요? 😭',
    body: '다음 달에 어린이집 입소인데 며칠 전부터 얘기해줬더니 극도로 거부해요. "싫어! 엄마랑 있을 거야!" 만 반복하는데 이걸 어떻게 해야 할지... 경험자분들 조언 부탁드려요.',
    emoji: '🌻',
    likes: 62,
    comments: 41,
    views: 2104,
  },
  {
    id: 5,
    author: '정다은',
    authorLevel: '레벨 8',
    childAge: '36개월',
    timeAgo: '어제',
    category: '🎉 성장 기록',
    categoryColor: 'teal',
    title: '우리 아이 첫 자전거! 100일 만에 혼자 타기 성공했어요 🚲',
    body: '작년 여름부터 조금씩 연습했는데 드디어 오늘 보조바퀴 없이 5미터 혼자 달리는 데 성공했어요! 넘어져도 울면서도 포기 안 하는 모습이 너무 기특해서 영상 찍다가 저도 눈물이...',
    emoji: '🍀',
    images: ['🚲', '🏆'],
    likes: 203,
    comments: 56,
    views: 1567,
    liked: true,
  },
];

const HOT_TOPICS: HotTopic[] = [
  { rank: 1, title: '새벽 수유 줄이는 방법 공유해요', comments: 72 },
  { rank: 2, title: '이유식 거부하는 아이 어떻게 하나요', comments: 58 },
  { rank: 3, title: '어린이집 적응 팁 모음', comments: 41 },
  { rank: 4, title: '수족구 경험담과 주의사항', comments: 33 },
  { rank: 5, title: '남편 육아 참여 어떻게 유도하나요', comments: 29 },
];

const ACTIVE_USERS: ActiveUser[] = [
  { name: '박수민', emoji: '🐣', activity: '이유식 게시글 작성 중', tag: '이유식', tagColor: 'yellow' },
  { name: '이수아', emoji: '🌷', activity: '댓글 달기 중', tag: '수면', tagColor: 'pink' },
  { name: '이준혁', emoji: '🐻', activity: '게시글 읽는 중', tag: '아빠', tagColor: 'blue' },
  { name: '정다은', emoji: '🍀', activity: '성장 기록 업로드 중', tag: '성장', tagColor: 'teal' },
];



// ─── 메인 페이지 ─────────────────────────────────────────────────
export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState('전체');
  const [activePage, setActivePage] = useState(1);

  return (
    <MantineProvider theme={theme}>
      <Box style={{ minHeight: '100vh', background: surface.bg, fontFamily: theme.fontFamily }}>

        {/* ── AppShell Header ── */}
        <AppShell header={{ height: 62 }} padding={0}>
          <AppShell.Header
            style={{
              background: 'rgba(255,248,248,0.92)',
              backdropFilter: 'blur(16px)',
              borderBottom: `1px solid ${border.default}`,
            }}
          >
            <Container size="xl" h="100%">
              <Group h="100%" justify="space-between">
                {/* 로고 */}
                <Text
                  style={{
                    fontFamily: 'DM Serif Display, serif',
                    fontSize: 22,
                    color: text.primary,
                    letterSpacing: '-0.3px',
                  }}
                >
                  ON<span style={{ color: coralScale[5] }}>.</span>AI
                </Text>

              </Group>
            </Container>
          </AppShell.Header>

          <AppShell.Main>         

            {/* ── 본문 레이아웃 ── */}
            <Container size="xl" py="xl">
              <SimpleGrid cols={{ base: 1  }} spacing="lg">

                {/* ── 왼쪽: 게시글 목록 ── */}
                <Stack gap="md">

                  {/* 카테고리 칩 */}
                  <Group gap="xs" wrap="wrap">
                    {CATEGORIES.map(cat => (
                      <Button
                        key={cat}
                        size="xs"
                        radius="xl"
                        variant={activeCategory === cat ? 'light' : 'outline'}
                        color="coral"
                        onClick={() => setActiveCategory(cat)}
                        style={{
                          fontWeight: 500,
                          borderColor: activeCategory === cat ? coralScale[3] : border.default,
                          color: activeCategory === cat ? coralScale[6] : text.secondary,
                          backgroundColor: activeCategory === cat ? coralScale[0] : surface.white,
                        }}
                      >
                        {cat}
                      </Button>
                    ))}
                  </Group>

                  {/* 게시글 카드들 */}
                  <Stack gap="sm">
                    {POSTS.map(post => (
                      <PostContentCard key={post.id} post={post} />
                    ))}
                  </Stack>

                  {/* 페이지네이션 */}
                  <Group justify="center" mt="md" gap="xs">
                    <ActionIcon variant="outline" color="coral" radius="sm" size={36} style={{ borderColor: border.default }}>
                      <IconChevronLeft size={16} color={text.muted} />
                    </ActionIcon>
                    {[1, 2, 3, 4, 5].map(p => (
                      <ActionIcon
                        key={p}
                        size={36}
                        radius="sm"
                        variant={activePage === p ? 'filled' : 'outline'}
                        color="coral"
                        onClick={() => setActivePage(p)}
                        style={{
                          borderColor: activePage === p ? 'transparent' : border.default,
                          background: activePage === p ? gradient.primary : surface.white,
                          boxShadow: activePage === p ? shadow.btn : 'none',
                          fontWeight: 500,
                          color: activePage === p ? 'white' : text.secondary,
                        }}
                      >
                        {p}
                      </ActionIcon>
                    ))}
                    <ActionIcon variant="outline" color="coral" radius="sm" size={36} style={{ borderColor: border.default }}>
                      <IconChevronRight size={16} color={text.muted} />
                    </ActionIcon>
                  </Group>
                </Stack>

                {/* ── 오른쪽: 사이드바 ── */}
                <Stack gap="md">

                  {/* 내 프로필 카드 */}
                  <Card p="lg">
                    <Text size="xs" fw={700} c={text.muted} tt="uppercase" mb="md"
                      style={{ letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <Box style={{ width: 3, height: 14, borderRadius: 2, background: gradient.primary, display: 'inline-block' }} />
                      내 프로필
                    </Text>
                    <Stack align="center" gap="xs">
                      <Indicator color="green" size={12} offset={6} position="bottom-end">
                        <Avatar
                          size={64}
                          radius="xl"
                          style={{
                            background: gradient.primary,
                            border: `3px solid ${surface.white}`,
                            outline: `2px solid ${coralScale[2]}`,
                            boxShadow: shadow.avatar,
                            fontSize: 28,
                          }}
                        >
                          🌸
                        </Avatar>
                      </Indicator>
                      <Text fw={600} size="md" c={text.primary}>김지연</Text>
                      <Text size="xs" c={text.muted}>14개월 아이 엄마 · 레벨 5</Text>
                      <Group gap="xl" my="xs">
                        {[{ num: '38', label: '게시글' }, { num: '1.2K', label: '좋아요' }, { num: '142', label: '팔로워' }].map(s => (
                          <Stack key={s.label} gap={2} align="center">
                            <Text style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, color: text.primary, lineHeight: 1 }}>
                              {s.num}
                            </Text>
                            <Text size="xs" c={text.muted}>{s.label}</Text>
                          </Stack>
                        ))}
                      </Group>
                      <Button
                        fullWidth
                        variant="light"
                        color="coral"
                        radius="md"
                        size="sm"
                        style={{ borderColor: coralScale[2] }}
                      >
                        프로필 보기
                      </Button>
                    </Stack>
                  </Card>

                  {/* 지금 뜨는 주제 */}
                  <Card p="lg">
                    <Text size="xs" fw={700} c={text.muted} tt="uppercase" mb="md"
                      style={{ letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <Box style={{ width: 3, height: 14, borderRadius: 2, background: gradient.primary, display: 'inline-block' }} />
                      지금 뜨는 주제
                    </Text>
                    <Stack gap={4}>
                      {HOT_TOPICS.map(topic => (
                        <Paper
                          key={topic.rank}
                          p="xs"
                          radius="md"
                          style={{
                            cursor: 'pointer',
                            border: 'none',
                            background: 'transparent',
                            transition: 'background 160ms ease-out',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = coralScale[0])}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <Group gap="sm" align="flex-start">
                            <Text
                              style={{
                                fontFamily: 'DM Serif Display, serif',
                                fontSize: 18,
                                color: topic.rank <= 3 ? coralScale[5] : coralScale[2],
                                lineHeight: 1,
                                width: 22,
                                textAlign: 'center',
                                flexShrink: 0,
                                marginTop: 1,
                              }}
                            >
                              {topic.rank}
                            </Text>
                            <Stack gap={2}>
                              <Text size="sm" fw={500} c={text.primary} style={{ lineHeight: 1.45 }}>
                                {topic.title}
                              </Text>
                              <Text size="xs" c={text.muted}>💬 {topic.comments}개 댓글</Text>
                            </Stack>
                          </Group>
                        </Paper>
                      ))}
                    </Stack>
                  </Card>

                  {/* 지금 활동 중 */}
                  <Card p="lg">
                    <Text size="xs" fw={700} c={text.muted} tt="uppercase" mb="md"
                      style={{ letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <Box style={{ width: 3, height: 14, borderRadius: 2, background: gradient.primary, display: 'inline-block' }} />
                      지금 활동 중
                    </Text>
                    <Stack gap="sm">
                      {ACTIVE_USERS.map(user => (
                        <Group key={user.name} justify="space-between">
                          <Group gap="sm">
                            <Indicator color="green" size={9} offset={3} position="bottom-end">
                              <Avatar
                                size={34}
                                radius="xl"
                                style={{ border: `1.5px solid ${border.default}` }}
                              >
                                {user.emoji}
                              </Avatar>
                            </Indicator>
                            <Stack gap={1}>
                              <Text size="sm" fw={500} c={text.primary}>{user.name}</Text>
                              <Text size="xs" c={text.muted}>{user.activity}</Text>
                            </Stack>
                          </Group>
                          <Badge size="xs" color={user.tagColor} variant="light" radius="xl">
                            {user.tag}
                          </Badge>
                        </Group>
                      ))}
                    </Stack>
                  </Card>

                </Stack>
              </SimpleGrid>
            </Container>

          </AppShell.Main>
        </AppShell>
      </Box>
    </MantineProvider>
  );
}
