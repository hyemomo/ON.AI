import { useState } from "react";
import {
  Box,
  Button,
  Container,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";

type LoginForm = {
  id: string;
  pwd: string;
};

export default function LoginPage() {
  const [form, setForm] = useState<LoginForm>({ id: "", pwd: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (name: keyof LoginForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("로그인 실패");
      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      alert("로그인되었습니다.");
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("아이디 또는 비밀번호를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gowun+Batang&family=Nunito:wght@400;600;700;800;900&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-14px); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(.95); opacity: .6; }
          70%  { transform: scale(1.08); opacity: 0; }
          100% { transform: scale(.95); opacity: 0; }
        }

        .fade-1 { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) both .05s; }
        .fade-2 { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) both .16s; }
        .fade-3 { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) both .28s; }

        .login-input input {
          background: rgba(255,255,255,0.72) !important;
          border: 1.5px solid rgba(255,160,150,0.28) !important;
          border-radius: 14px !important;
          font-family: 'Nunito', sans-serif !important;
          font-size: 15px !important;
          color: #4a2428 !important;
          transition: border-color .2s, box-shadow .2s !important;
          padding: 12px 16px !important;
          height: auto !important;
        }
        .login-input input:focus {
          border-color: #ff8fa3 !important;
          box-shadow: 0 0 0 3px rgba(255,143,163,0.18) !important;
          background: rgba(255,255,255,0.92) !important;
          outline: none !important;
        }
        .login-input input::placeholder { color: rgba(160,100,100,0.5) !important; }
        .login-input label {
          font-family: 'Nunito', sans-serif !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          color: #c0627a !important;
          margin-bottom: 6px !important;
          letter-spacing: .3px !important;
        }
        /* password input wrapper */
        .login-input .mantine-PasswordInput-input {
          background: rgba(255,255,255,0.72) !important;
          border: 1.5px solid rgba(255,160,150,0.28) !important;
          border-radius: 14px !important;
          transition: border-color .2s, box-shadow .2s !important;
        }
        .login-input .mantine-PasswordInput-input:focus-within {
          border-color: #ff8fa3 !important;
          box-shadow: 0 0 0 3px rgba(255,143,163,0.18) !important;
          background: rgba(255,255,255,0.92) !important;
        }
        .login-input .mantine-PasswordInput-innerInput {
          background: transparent !important;
          border: none !important;
          font-family: 'Nunito', sans-serif !important;
          font-size: 15px !important;
          color: #4a2428 !important;
          padding: 12px 16px !important;
          height: auto !important;
        }

        .submit-btn {
          transition: transform .18s, box-shadow .2s !important;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 10px 28px rgba(255,100,120,.30) !important;
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(0) !important;
        }

        .signup-link {
          color: #e05070;
          font-weight: 700;
          text-decoration: none;
          border-bottom: 1.5px solid rgba(224,80,112,0.3);
          transition: border-color .2s, color .2s;
        }
        .signup-link:hover {
          color: #c03050;
          border-color: #c03050;
        }

        .bubble {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), rgba(255,180,170,0.12));
          border: 1px solid rgba(255,255,255,0.5);
          pointer-events: none;
        }
      `}</style>

      <Box
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(150deg, #fff5f6 0%, #ffe8ec 45%, #ffd6dd 100%)",
          display: "flex",
          alignItems: "center",
          padding: "48px 16px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* soft background shapes */}
        <Box style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <Box
            style={{
              position: "absolute",
              top: "-15%",
              right: "-10%",
              width: 480,
              height: 480,
              borderRadius: "50%",
              background: "rgba(255,180,190,0.22)",
              filter: "blur(70px)",
            }}
          />
          <Box
            style={{
              position: "absolute",
              bottom: "-10%",
              left: "-8%",
              width: 380,
              height: 380,
              borderRadius: "50%",
              background: "rgba(255,200,210,0.20)",
              filter: "blur(60px)",
            }}
          />
          <Box
            style={{
              position: "absolute",
              top: "40%",
              left: "60%",
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: "rgba(255,160,175,0.14)",
              filter: "blur(40px)",
            }}
          />

          {/* floating bubbles */}
          {[
            { w: 50, t: "10%", l: "8%", d: 0, a: 0.55 },
            { w: 30, t: "22%", l: "78%", d: 1.3, a: 0.45 },
            { w: 68, t: "68%", l: "82%", d: 0.7, a: 0.4 },
            { w: 22, t: "78%", l: "14%", d: 2.0, a: 0.5 },
            { w: 40, t: "50%", l: "4%", d: 1.5, a: 0.38 },
          ].map((b, i) => (
            <Box
              key={i}
              className="bubble"
              style={{
                width: b.w,
                height: b.w,
                top: b.t,
                left: b.l,
                opacity: b.a,
                animation: `float ${3.2 + b.d}s ease-in-out infinite`,
                animationDelay: `${b.d}s`,
              }}
            />
          ))}
        </Box>

        <Container
          size={400}
          w="100%"
          style={{ position: "relative", zIndex: 1 }}
        >
          <Stack gap={0} align="center">
            {/* logo mark */}
            <Box
              className="fade-1"
              style={{
                position: "relative",
                width: 70,
                height: 70,
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* pulse ring */}
              <Box
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,143,163,0.5)",
                  animation: "pulse-ring 2.4s ease-out infinite",
                }}
              />
              <Box
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #ffb3c1 0%, #ff8fa3 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                  boxShadow: "0 6px 24px rgba(255,100,130,0.28)",
                }}
              >
                🌸
              </Box>
            </Box>

            {/* title */}
            <Box className="fade-1" ta="center" mb={28}>
              <Title
                order={2}
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 900,
                  fontSize: 28,
                  color: "#c0405a",
                  letterSpacing: "-0.5px",
                }}
              >
                ON.AI 로그인
              </Title>
              <Text
                mt={6}
                style={{
                  fontFamily: "'Gowun Batang', serif",
                  fontSize: 14,
                  color: "rgba(160, 80, 100, 0.75)",
                  lineHeight: 1.7,
                }}
              >
                아이디와 비밀번호를 입력해주세요.
              </Text>
            </Box>

            {/* glass card */}
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
              <form onSubmit={handleSubmit}>
                <Stack gap={18}>
                  <TextInput
                    className="login-input"
                    label="아이디"
                    placeholder="아이디를 입력하세요"
                    value={form.id}
                    onChange={(e) => handleChange("id", e.target.value)}
                    required
                  />

                  <PasswordInput
                    className="login-input"
                    label="비밀번호"
                    placeholder="비밀번호를 입력하세요"
                    value={form.pwd}
                    onChange={(e) => handleChange("pwd", e.target.value)}
                    required
                  />

                  <Button
                    type="submit"
                    loading={loading}
                    fullWidth
                    radius="xl"
                    size="md"
                    mt={6}
                    className="submit-btn"
                    style={{
                      background:
                        "linear-gradient(135deg, #ffb3c1 0%, #ff8fa3 50%, #ff6b87 100%)",
                      color: "#fff",
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 800,
                      fontSize: 15,
                      border: "none",
                      boxShadow: "0 4px 16px rgba(255,100,130,.28)",
                      letterSpacing: "0.3px",
                      padding: "13px 0",
                      height: "auto",
                    }}
                  >
                    로그인
                  </Button>
                </Stack>
              </form>
            </Box>

            {/* signup link */}
            <Text
              className="fade-3"
              mt={20}
              size="sm"
              ta="center"
              style={{
                fontFamily: "'Nunito', sans-serif",
                color: "rgba(160, 80, 100, 0.72)",
              }}
            >
              아직 계정이 없나요?{" "}
              <a href="/signup" className="signup-link">
                회원가입
              </a>
            </Text>
          </Stack>
        </Container>
      </Box>
    </>
  );
}
