import { Avatar, Box, Image } from "@mantine/core";
import onaiDefaultProfile from "@/assets/images/onai-default-profile.png";
import { toStaticUrl } from "@/lib/api";
import { border } from "@/tokens/color";

type UserProfileAvatarProps = {
  profileImageUrl?: string | null;
  nickname?: string | null;
  size?: number;
};

export default function UserProfileAvatar({
  profileImageUrl,
  nickname,
  size = 44,
}: UserProfileAvatarProps) {
  const profileImageSrc = toStaticUrl(profileImageUrl);

  if (profileImageSrc) {
    return (
      <Avatar
        src={profileImageSrc}
        size={size}
        radius="50%"
        color="coral"
        style={{
          border: `1.5px solid ${border.default}`,
          boxShadow: "0 8px 20px rgba(255, 111, 118, 0.14)",
          flexShrink: 0,
        }}
      >
        {nickname?.[0] ?? "?"}
      </Avatar>
    );
  }

  const frameSize = size;
  const imageSize = size * 0.95;

  return (
    <Box
      aria-label="ON.AI 기본 프로필 이미지"
      style={{
        position: "relative",
        width: frameSize,
        height: frameSize,
        flexShrink: 0,
        overflow: "visible",
      }}
    >
      <Box
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: frameSize,
          height: frameSize,
          borderRadius: "50%",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,247,248,0.98) 100%)",
          border: `1.5px solid ${border.default}`,
          boxShadow: "0 8px 20px rgba(255, 111, 118, 0.14)",
        }}
      />

      <Image
        src={onaiDefaultProfile}
        alt="ON.AI 기본 프로필 캐릭터"
        fit="contain"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: imageSize,
          height: imageSize,
          objectFit: "contain",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          filter: "drop-shadow(0 5px 8px rgba(122, 74, 82, 0.1))",
        }}
      />
    </Box>
  );
}
