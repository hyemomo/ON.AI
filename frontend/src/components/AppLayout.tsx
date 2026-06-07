import type { ReactNode } from "react";
import { AppShell, Box, Button, Container, Group, Text } from "@mantine/core";
import {
  IconHomeHeart,
  IconMessageCircle,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { border, coralScale, surface, text } from "@/tokens/color";

const tabs = [
  { label: "챗봇", path: "/chat", icon: IconMessageCircle },
  { label: "커뮤니티", path: "/community", icon: IconHomeHeart },
  { label: "친구찾기", path: "/friends", icon: IconUsers },
  { label: "마이페이지", path: "/mypage", icon: IconUser },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box style={{ minHeight: "100vh", background: surface.bg }}>
      <AppShell header={{ height: 62 }} footer={{ height: 72 }} padding={0}>
        <AppShell.Header
          style={{
            background: "rgba(255,248,248,0.94)",
            backdropFilter: "blur(16px)",
            borderBottom: `1px solid ${border.default}`,
          }}
        >
          <Container size="xl" h="100%">
            <Group h="100%" justify="space-between">
              <Text
                fw={800}
                size="xl"
                style={{ cursor: "pointer", letterSpacing: "-0.4px" }}
                c={text.primary}
                onClick={() => navigate("/community")}
              >
                ON<span style={{ color: coralScale[5] }}>.</span>AI
              </Text>
            </Group>
          </Container>
        </AppShell.Header>

        <AppShell.Main style={{ paddingBottom: 88 }}>{children}</AppShell.Main>

        <AppShell.Footer
          style={{
            background: "rgba(255,255,255,0.96)",
            borderTop: `1px solid ${border.default}`,
          }}
        >
          <Container size="xl" h="100%">
            <Group h="100%" grow gap={6}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active =
                  location.pathname === tab.path ||
                  (tab.path !== "/community" &&
                    location.pathname.startsWith(tab.path));

                return (
                  <Button
                    key={tab.path}
                    variant={active ? "light" : "subtle"}
                    color="coral"
                    radius="xl"
                    onClick={() => navigate(tab.path)}
                    leftSection={<Icon size={17} />}
                    styles={{
                      root: {
                        height: 44,
                        color: active ? coralScale[6] : text.secondary,
                        backgroundColor: active ? coralScale[0] : "transparent",
                      },
                      label: { fontSize: 13 },
                    }}
                  >
                    {tab.label}
                  </Button>
                );
              })}
            </Group>
          </Container>
        </AppShell.Footer>
      </AppShell>
    </Box>
  );
}
