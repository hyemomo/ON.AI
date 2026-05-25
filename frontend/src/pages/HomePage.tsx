import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Stack,
  Text,
  Title,
  Group,
} from "@mantine/core";

/* ─── tiny utility ─────────────────────────────────────── */
function hasToken() {
  return !!localStorage.getItem("accesstoken");
}

/* ─── floating bubble component ────────────────────────── */
function Bubble({
  size,
  top,
  left,
  delay,
  opacity,
}: {
  size: number;
  top: string;
  left: string;
  delay: number;
  opacity: number;
}) {
  return (
    <Box
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        top,
        left,
        background:
          "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.55), rgba(255,180,170,0.18))",
        backdropFilter: "blur(2px)",
        border: "1px solid rgba(255,255,255,0.4)",
        animation: `float ${3 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
}

/* ─── main page ─────────────────────────────────────────── */
export default function HomePage() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(hasToken);

  /* re-check when storage changes (e.g. other tab logs in/out) */
  useEffect(() => {
    const sync = () => setLoggedIn(hasToken());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    setLoggedIn(false);
  }

  return (
    <>
      {/* ── keyframe injections ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Nunito:wght@400;600;700;900&display=swap');

        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-18px) scale(1.04); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes heartbeat {
          0%,100% { transform: scale(1);   }
          15%      { transform: scale(1.18); }
          30%      { transform: scale(1);   }
          45%      { transform: scale(1.10); }
          60%      { transform: scale(1);   }
        }
        .fade-up-1 { animation: fadeUp .7s cubic-bezier(.22,1,.36,1) both; animation-delay: .05s; }
        .fade-up-2 { animation: fadeUp .7s cubic-bezier(.22,1,.36,1) both; animation-delay: .18s; }
        .fade-up-3 { animation: fadeUp .7s cubic-bezier(.22,1,.36,1) both; animation-delay: .32s; }
        .fade-up-4 { animation: fadeUp .7s cubic-bezier(.22,1,.36,1) both; animation-delay: .46s; }

        .heart { animation: heartbeat 2.4s ease-in-out infinite; display: inline-block; }

        .shimmer-btn {
          background-size: 200% auto !important;
          transition: box-shadow .25s, transform .18s !important;
        }
        .shimmer-btn:hover {
          animation: shimmer 1.4s linear infinite;
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(255,100,90,.38) !important;
        }
        .outline-btn {
          transition: background .22s, transform .18s, box-shadow .22s !important;
        }
        .outline-btn:hover {
          background: rgba(255,255,255,0.95) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255,120,110,.22) !important;
        }
        .ghost-btn {
          transition: color .2s, border-color .2s, transform .18s !important;
        }
        .ghost-btn:hover {
          transform: translateY(-2px);
          border-color: rgba(255,255,255,0.9) !important;
          color: #fff !important;
        }
        .card-glass {
          transition: box-shadow .3s;
        }
        .card-glass:hover {
          box-shadow: 0 28px 64px rgba(220,80,80,.18), 0 4px 16px rgba(0,0,0,.06) !important;
        }
      `}</style>

      {/* ── full-page background ── */}
      <Box
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(150deg, #fff5f6 0%, #ffe8ec 45%, #ffd6dd 100%)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          padding: "40px 16px",
        }}
      >
        {/* decorative blobs */}
        <Box
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
          }}
        >
          {/* large blurred blobs */}
          <Box
            style={{
              position: "absolute",
              top: "-10%",
              right: "-8%",
              width: 420,
              height: 420,
              borderRadius: "50%",
              background: "rgba(255,200,180,0.22)",
              filter: "blur(60px)",
            }}
          />
          <Box
            style={{
              position: "absolute",
              bottom: "-12%",
              left: "-6%",
              width: 360,
              height: 360,
              borderRadius: "50%",
              background: "rgba(255,120,100,0.22)",
              filter: "blur(60px)",
            }}
          />
          <Box
            style={{
              position: "absolute",
              top: "35%",
              left: "5%",
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.10)",
              filter: "blur(40px)",
            }}
          />

          {/* floating bubbles */}
          <Bubble size={64} top="8%" left="10%" delay={0} opacity={0.7} />
          <Bubble size={40} top="18%" left="80%" delay={1.2} opacity={0.55} />
          <Bubble size={80} top="65%" left="85%" delay={0.6} opacity={0.5} />
          <Bubble size={28} top="75%" left="12%" delay={2.1} opacity={0.65} />
          <Bubble size={50} top="45%" left="92%" delay={1.7} opacity={0.45} />
          <Bubble size={22} top="28%" left="55%" delay={0.9} opacity={0.5} />
        </Box>

        <Container
          size="xs"
          w="100%"
          style={{ position: "relative", zIndex: 1 }}
        >
          <Stack gap={0} align="center">
            {/* ── logo mark ── */}
            <Box
              className="fade-up-1"
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.22)",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(255,255,255,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                marginBottom: 24,
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              }}
            >
              <span className="heart">🤱</span>
            </Box>

            {/* ── title ── */}
            <Box className="fade-up-1" ta="center" mb={8}>
              <Title
                order={1}
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(38px, 8vw, 56px)",
                  color: "#c0405a",
                  letterSpacing: "-1px",
                  textShadow: "0 2px 16px rgba(180,0,30,0.25)",
                  lineHeight: 1.1,
                }}
              >
                ON.AI
              </Title>
              <Text
                mt={6}
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "4px",
                  color: "rgba(160, 80, 100, 0.75)",
                  textTransform: "uppercase",
                }}
              >
                parenting companion
              </Text>
            </Box>

            {/* ── glass card ── */}
            <Box
              className="fade-2"
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.62)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1.5px solid rgba(255,200,210,0.60)",
                borderRadius: 28,
                padding: "32px 28px",
                boxShadow:
                  "0 8px 40px rgba(255,120,140,.12), 0 2px 8px rgba(0,0,0,.04)",
              }}
            >
              <Text
                ta="center"
                mb={28}
                style={{
                  fontFamily: "'Gowun Batang', serif",
                  fontSize: 14,
                  color: "#c0405a",
                  lineHeight: 1.8,
                  letterSpacing: "0.2px",
                }}
              >
                육아 고민을 나누고,
                <br />
                필요한 정보를 함께 찾아가는 공간.
              </Text>

              {/* ── primary actions ── */}
              <Stack gap={12}>
                <Button
                  fullWidth
                  size="lg"
                  radius="xl"
                  className="shimmer-btn"
                  onClick={() => navigate("/chat")}
                  style={{
                    background:
                      "linear-gradient(90deg, #fff 0%, #ffe0e4 40%, #fff 60%, #ffd6da 100%)",
                    color: "#e0304a",
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 800,
                    fontSize: 14,
                    border: "none",
                    boxShadow: "0 6px 20px rgba(255,80,80,.30)",
                    letterSpacing: "0.3px",
                  }}
                >
                  💬 챗봇 시작하기
                </Button>

                <Button
                  fullWidth
                  size="lg"
                  radius="xl"
                  className="outline-btn"
                  onClick={() => navigate("/community")}
                  style={{
                    background: "rgba(255,255,255,0.14)",
                    color: "#fff",
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    border: "1.5px solid rgba(255,255,255,0.55)",
                    letterSpacing: "0.3px",
                  }}
                >
                  🌸 커뮤니티 가기
                </Button>
              </Stack>
            </Box>

            {/* ── auth buttons ── */}
            <Box className="fade-up-3" mt={20} w="100%">
              {loggedIn ? (
                <Button
                  fullWidth
                  size="md"
                  radius="xl"
                  className="ghost-btn"
                  onClick={handleLogout}
                  style={{
                    background: "transparent",
                    color: "rgba(255,255,255,0.82)",
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 700,
                    border: "1.5px solid rgba(255,255,255,0.4)",
                    letterSpacing: "0.3px",
                  }}
                >
                  로그아웃
                </Button>
              ) : (
                <Group grow gap={10}>
                  <Button
                    size="md"
                    radius="xl"
                    className="ghost-btn"
                    onClick={() => navigate("/login")}
                    style={{
                      background: "transparent",
                      color: "rgba(255,255,255,0.88)",
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 700,
                      border: "1.5px solid rgba(255,255,255,0.45)",
                      letterSpacing: "0.3px",
                    }}
                  >
                    로그인
                  </Button>
                  <Button
                    size="md"
                    radius="xl"
                    className="ghost-btn"
                    onClick={() => navigate("/signup")}
                    style={{
                      background: "rgba(255,255,255,0.14)",
                      color: "#fff",
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 700,
                      border: "1.5px solid rgba(255,255,255,0.45)",
                      letterSpacing: "0.3px",
                    }}
                  >
                    회원가입
                  </Button>
                </Group>
              )}
            </Box>

            {/* ── footer note ── */}
            <Text
              className="fade-up-4"
              mt={24}
              size="xs"
              ta="center"
              style={{
                fontFamily: "'Nunito', sans-serif",
                color: "rgba(255,255,255,0.58)",
                letterSpacing: "0.2px",
              }}
            >
              {loggedIn
                ? "지금 바로 육아 친구 ON.AI와 함께해요 🌷"
                : "로그인 후 모든 기능을 이용할 수 있어요"}
            </Text>
          </Stack>
        </Container>
      </Box>
    </>
  );
}
