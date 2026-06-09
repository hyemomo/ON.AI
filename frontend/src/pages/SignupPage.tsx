import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Image,
  PasswordInput,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";

import signupIcon from "@/assets/images/onai-signup-icon.png";
import { REGION_OPTIONS } from "@/features/auth/constants/region";

type SignupForm = {
  id: string;
  pwd: string;
  nickname: string;
  parents_name: string;
  parents_birth: string;
  parents_gender: string;
  parents_mbti: string;
  email: string;
  region: string;
};

const PENDING_SIGNUP_KEY = "onai_pending_signup";

export default function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<SignupForm>({
    id: "",
    pwd: "",
    nickname: "",
    parents_name: "",
    parents_birth: "",
    parents_gender: "",
    parents_mbti: "",
    email: "",
    region: "",
  });

  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  const handleChange = (name: keyof SignupForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProvinceChange = (province: string | null) => {
    setSelectedProvince(province);
    setSelectedDistrict(null);

    if (!province) {
      handleChange("region", "");
      return;
    }

    const districts = REGION_OPTIONS[province];
    handleChange("region", districts.length === 0 ? province : "");
  };

  const handleDistrictChange = (district: string | null) => {
    setSelectedDistrict(district);

    if (!selectedProvince || !district) {
      handleChange("region", "");
      return;
    }

    handleChange("region", `${selectedProvince} ${district}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.id.trim() ||
      !form.pwd ||
      !form.nickname.trim() ||
      !form.parents_name.trim() ||
      !form.parents_birth ||
      !form.parents_gender ||
      !form.email.trim() ||
      !form.region
    ) {
      alert("필수 정보를 모두 입력해주세요.");
      return;
    }

    sessionStorage.setItem(
      PENDING_SIGNUP_KEY,
      JSON.stringify({
        id: form.id.trim(),
        pwd: form.pwd,
        nickname: form.nickname.trim(),
        parents_name: form.parents_name.trim(),
        parents_birth: form.parents_birth,
        parents_gender: form.parents_gender,
        parents_mbti: form.parents_mbti || null,
        email: form.email.trim(),
        region: form.region,
      }),
    );

    navigate("/onboarding/children");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gowun+Batang&family=Nunito:wght@400;600;700;800;900&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-13px); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(.93); opacity: .55; }
          70%  { transform: scale(1.10); opacity: 0; }
          100% { transform: scale(.93); opacity: 0; }
        }

        .fade-in { animation: fadeUp .65s cubic-bezier(.22,1,.36,1) both .06s; }

        .section-label {
          font-family: 'Nunito', sans-serif;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(192, 96, 122, 0.65);
          padding: 4px 0 2px;
          border-bottom: 1.5px solid rgba(255, 180, 195, 0.35);
          margin-bottom: 2px;
        }

        .si input,
        .si .mantine-Select-input {
          background: rgba(255,255,255,0.72) !important;
          border: 1.5px solid rgba(255,160,150,0.28) !important;
          border-radius: 12px !important;
          font-family: 'Nunito', sans-serif !important;
          font-size: 14px !important;
          color: #4a2428 !important;
          transition: border-color .2s, box-shadow .2s, background .2s !important;
          padding: 10px 14px !important;
          height: auto !important;
        }
        .si input:focus,
        .si .mantine-Select-input:focus {
          border-color: #ff8fa3 !important;
          box-shadow: 0 0 0 3px rgba(255,143,163,0.16) !important;
          background: rgba(255,255,255,0.92) !important;
          outline: none !important;
        }
        .si input[type="date"] { color-scheme: light; }
        .si input::placeholder,
        .si .mantine-Select-input::placeholder { color: rgba(160,100,110,0.45) !important; }
        .si label {
          font-family: 'Nunito', sans-serif !important;
          font-weight: 700 !important;
          font-size: 12.5px !important;
          color: #c0627a !important;
          margin-bottom: 5px !important;
          letter-spacing: .2px !important;
        }

        .si .mantine-PasswordInput-input {
          background: rgba(255,255,255,0.72) !important;
          border: 1.5px solid rgba(255,160,150,0.28) !important;
          border-radius: 12px !important;
          transition: border-color .2s, box-shadow .2s !important;
        }
        .si .mantine-PasswordInput-input:focus-within {
          border-color: #ff8fa3 !important;
          box-shadow: 0 0 0 3px rgba(255,143,163,0.16) !important;
          background: rgba(255,255,255,0.92) !important;
        }
        .si .mantine-PasswordInput-innerInput {
          background: transparent !important;
          border: none !important;
          font-family: 'Nunito', sans-serif !important;
          font-size: 14px !important;
          color: #4a2428 !important;
          padding: 10px 14px !important;
          height: auto !important;
        }

        .si .mantine-Select-input:disabled {
          background: rgba(240,230,232,0.55) !important;
          color: rgba(160,100,110,0.4) !important;
          cursor: not-allowed !important;
        }

        .submit-btn {
          transition: transform .18s, box-shadow .2s !important;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 10px 28px rgba(255,100,130,.28) !important;
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0) !important; }

        .bubble {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.58), rgba(255,180,170,0.10));
          border: 1px solid rgba(255,255,255,0.48);
          pointer-events: none;
        }

        .login-link {
          color: #e05070;
          font-weight: 700;
          text-decoration: none;
          border-bottom: 1.5px solid rgba(224,80,112,0.28);
          transition: border-color .2s, color .2s;
        }
        .login-link:hover { color: #c03050; border-color: #c03050; }
      `}</style>

      <Box
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(150deg, #fff5f6 0%, #ffe8ec 45%, #ffd6dd 100%)",
          padding: "48px 16px 64px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <Box
            style={{
              position: "absolute",
              top: "-12%",
              right: "-8%",
              width: 460,
              height: 460,
              borderRadius: "50%",
              background: "rgba(255,180,190,0.20)",
              filter: "blur(70px)",
            }}
          />

          <Box
            style={{
              position: "absolute",
              bottom: "-8%",
              left: "-6%",
              width: 360,
              height: 360,
              borderRadius: "50%",
              background: "rgba(255,200,210,0.18)",
              filter: "blur(60px)",
            }}
          />

          <Box
            style={{
              position: "absolute",
              top: "45%",
              left: "62%",
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: "rgba(255,160,175,0.12)",
              filter: "blur(38px)",
            }}
          />

          {[
            { w: 48, t: "7%", l: "7%", d: 0, a: 0.5 },
            { w: 28, t: "20%", l: "80%", d: 1.2, a: 0.42 },
            { w: 62, t: "70%", l: "84%", d: 0.7, a: 0.38 },
            { w: 20, t: "80%", l: "13%", d: 2.0, a: 0.46 },
            { w: 36, t: "52%", l: "3%", d: 1.5, a: 0.35 },
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
          size={480}
          w="100%"
          style={{ position: "relative", zIndex: 1 }}
        >
          <Stack gap={0} align="center">
            <Box
              className="fade-in"
              style={{
                position: "relative",
                width: 116,
                height: 116,
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,143,163,0.35)",
                  animation: "pulse-ring 2.4s ease-out infinite",
                }}
              />

              <Image
                src={signupIcon}
                alt="ON.AI 회원가입 캐릭터"
                fit="contain"
                style={{
                  width: 104,
                  height: 104,
                  objectFit: "contain",
                  position: "relative",
                  zIndex: 1,
                }}
              />
            </Box>

            <Box className="fade-in" ta="center" mb={24}>
              <Title
                order={2}
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 900,
                  fontSize: 26,
                  color: "#c0405a",
                  letterSpacing: "-0.5px",
                }}
              >
                ON.AI 회원가입
              </Title>

              <Text
                mt={6}
                style={{
                  fontFamily: "'Gowun Batang', serif",
                  fontSize: 13.5,
                  color: "rgba(160,80,100,0.72)",
                  lineHeight: 1.75,
                }}
              >
                부모님의 육아 고민을 함께 나누기 위해
                <br />
                기본 정보를 입력해주세요.
              </Text>
            </Box>

            <Box
              className="fade-in"
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.60)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1.5px solid rgba(255,200,210,0.58)",
                borderRadius: 28,
                padding: "32px 28px 28px",
                boxShadow:
                  "0 8px 40px rgba(255,120,140,.11), 0 2px 8px rgba(0,0,0,.04)",
              }}
            >
              <form onSubmit={handleSubmit}>
                <Stack gap={14}>
                  <div className="section-label">계정 정보</div>

                  <TextInput
                    className="si"
                    label="아이디"
                    placeholder="아이디를 입력하세요"
                    value={form.id}
                    onChange={(e) => handleChange("id", e.target.value)}
                    required
                  />

                  <PasswordInput
                    className="si"
                    label="비밀번호"
                    placeholder="비밀번호를 입력하세요"
                    value={form.pwd}
                    onChange={(e) => handleChange("pwd", e.target.value)}
                    required
                  />

                  <TextInput
                    className="si"
                    label="닉네임"
                    placeholder="닉네임을 입력하세요"
                    value={form.nickname}
                    onChange={(e) => handleChange("nickname", e.target.value)}
                    required
                  />

                  <TextInput
                    className="si"
                    label="이메일"
                    placeholder="user@example.com"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                  />

                  <div className="section-label" style={{ marginTop: 6 }}>
                    부모 정보
                  </div>

                  <TextInput
                    className="si"
                    label="부모 이름"
                    placeholder="이름을 입력하세요"
                    value={form.parents_name}
                    onChange={(e) =>
                      handleChange("parents_name", e.target.value)
                    }
                    required
                  />

                  <TextInput
                    className="si"
                    label="부모 생년월일"
                    type="date"
                    value={form.parents_birth}
                    onChange={(e) =>
                      handleChange("parents_birth", e.target.value)
                    }
                    required
                  />

                  <Box
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <Select
                      className="si"
                      label="부모 성별"
                      placeholder="성별 선택"
                      data={[
                        { value: "남성", label: "남성" },
                        { value: "여성", label: "여성" },
                      ]}
                      value={form.parents_gender}
                      onChange={(v) => handleChange("parents_gender", v || "")}
                      required
                    />

                    <Select
                      className="si"
                      label="MBTI"
                      placeholder="MBTI 선택"
                      data={[
                        "INTJ",
                        "INTP",
                        "ENTJ",
                        "ENTP",
                        "INFJ",
                        "INFP",
                        "ENFJ",
                        "ENFP",
                        "ISTJ",
                        "ISFJ",
                        "ESTJ",
                        "ESFJ",
                        "ISTP",
                        "ISFP",
                        "ESTP",
                        "ESFP",
                      ]}
                      value={form.parents_mbti}
                      onChange={(v) => handleChange("parents_mbti", v || "")}
                    />
                  </Box>

                  <div className="section-label" style={{ marginTop: 6 }}>
                    거주 지역
                  </div>

                  <Box
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <Select
                      className="si"
                      label="시/도"
                      placeholder="시/도 선택"
                      data={Object.keys(REGION_OPTIONS)}
                      value={selectedProvince}
                      onChange={handleProvinceChange}
                      required
                    />

                    <Select
                      className="si"
                      label="시/군/구"
                      placeholder={
                        selectedProvince
                          ? REGION_OPTIONS[selectedProvince].length === 0
                            ? "해당 없음"
                            : "시/군/구 선택"
                          : "먼저 시/도 선택"
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
                    />
                  </Box>

                  <Button
                    type="submit"
                    fullWidth
                    radius="xl"
                    size="md"
                    mt={10}
                    className="submit-btn"
                    style={{
                      background:
                        "linear-gradient(135deg, #ffb3c1 0%, #ff8fa3 50%, #ff6b87 100%)",
                      color: "#fff",
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 800,
                      fontSize: 15,
                      border: "none",
                      boxShadow: "0 4px 16px rgba(255,100,130,.26)",
                      letterSpacing: "0.3px",
                      padding: "13px 0",
                      height: "auto",
                    }}
                  >
                    다음
                  </Button>
                </Stack>
              </form>
            </Box>

            <Text
              mt={18}
              size="sm"
              ta="center"
              style={{
                fontFamily: "'Nunito', sans-serif",
                color: "rgba(160,80,100,0.70)",
              }}
            >
              이미 계정이 있나요?{" "}
              <a href="/login" className="login-link">
                로그인
              </a>
            </Text>
          </Stack>
        </Container>
      </Box>
    </>
  );
}
