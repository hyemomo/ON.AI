import { useCallback, useRef, useState } from "react";
import { ActionIcon, Box, Group, Textarea } from "@mantine/core";
import { IconArrowRight, IconMicrophone } from "@tabler/icons-react";

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSubmit: (overrideValue?: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const BASE_URL = "/api";

const ChatInput = ({
  inputValue,
  setInputValue,
  handleSubmit,
  isLoading = false,
  placeholder,
}: ChatInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 한글 IME 문제 대응: 버튼 클릭 시 DOM 실제 값을 직접 전달
  const handleSubmitWithIME = () => {
    const domValue = (textareaRef.current?.value ?? inputValue).trim();

    if (!domValue) return;

    handleSubmit(domValue);
  };

  const handleMicClick = useCallback(async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        const blob = new Blob(chunksRef.current, {
          type: "audio/webm;codecs=opus",
        });

        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");

        try {
          const response = await fetch(`${BASE_URL}/stt`, {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("음성 인식 요청에 실패했습니다.");
          }

          const data = await response.json();

          if (data.transcript) {
            setInputValue(
              inputValue ? `${inputValue} ${data.transcript}` : data.transcript,
            );
          }
        } catch (error) {
          console.error("STT 오류:", error);
          alert("음성 인식에 실패했습니다. 다시 시도해 주세요.");
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("마이크 접근 오류:", error);
      alert("마이크 접근 권한이 필요합니다.");
    }
  }, [isRecording, inputValue, setInputValue]);

  const micColor = isRecording ? "#E84D5C" : isLoading ? "#DDB8C0" : "#C4909A";

  return (
    <Box
      bg="#fff"
      px={14}
      pt={10}
      pb={12}
      style={{
        borderTop: "1.5px solid #FFE4E7",
        flexShrink: 0,
      }}
    >
      <Group align="flex-end" gap={8} wrap="nowrap">
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(event) => setInputValue(event.currentTarget.value)}
          placeholder={
            isRecording
              ? "듣고 있어요... 말씀해 주세요"
              : isLoading
                ? "답변을 기다리는 중..."
                : (placeholder ?? "메시지를 입력하세요...")
          }
          autosize
          minRows={1}
          maxRows={4}
          disabled={isLoading}
          style={{ flex: 1 }}
          rightSectionPointerEvents="all"
          rightSection={
            <IconMicrophone
              size={18}
              color={micColor}
              style={{
                cursor: isLoading ? "not-allowed" : "pointer",
                animation: isRecording ? "pulse 1s infinite" : "none",
              }}
              onClick={isLoading ? undefined : handleMicClick}
            />
          }
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();

              if (!isLoading) {
                handleSubmit();
              }
            }
          }}
          styles={{
            input: {
              minHeight: 46,
              borderRadius: 26,
              border: isRecording
                ? "1.5px solid #E84D5C"
                : "1.5px solid #FFE4E7",
              backgroundColor: isLoading ? "#FFF8F9" : "#FFF0F2",
              color: "#2D1A1E",
              fontSize: 14.5,
              lineHeight: 1.5,
              padding: "11px 42px 11px 14px",
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? "not-allowed" : "text",
              transition: "border-color 0.2s ease",
            },
          }}
        />

        <ActionIcon
          size={46}
          radius="xl"
          variant="filled"
          color="pink"
          aria-label="메시지 전송"
          onClick={handleSubmitWithIME}
          disabled={isLoading}
          styles={{
            root: {
              flexShrink: 0,
              background: isLoading
                ? "#F0C0C8"
                : "linear-gradient(135deg, #FF8E9B 0%, #E84D5C 100%)",
              boxShadow: isLoading
                ? "none"
                : "0 4px 14px rgba(255, 107, 122, 0.42)",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
            },
          }}
        >
          <IconArrowRight size={21} color="white" />
        </ActionIcon>
      </Group>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </Box>
  );
};

export default ChatInput;
