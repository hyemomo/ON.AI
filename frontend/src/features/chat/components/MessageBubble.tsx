import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

import ChatAvatar from "@/features/chat/components/chatAvatar";
import type { ChatMessage } from "@/features/chat/types/chat.type";
import { Badge, Group, Paper, Stack, Text } from "@mantine/core";

const CATEGORY_COLORS: Record<string, string> = {
  육아: "green",
  정책: "blue",
  응급대처: "red",
  기타: "gray",
  복지정책: "blue",
  육아방법: "green",
  응급처치: "red",
  상담: "violet",
};

const COLLECTION_LABELS: Record<string, string> = {
  parent_policy: "복지정책",
  child_guide: "아동 양육 사례",
  parent_action: "양육 행동 사례",
  first_aid: "응급처치",
};

const markdownComponents: Components = {
  p: ({ children }) => (
    <p style={{ margin: "0 0 6px 0", lineHeight: 1.63 }}>{children}</p>
  ),
  strong: ({ children }) => (
    <strong style={{ fontWeight: 700 }}>{children}</strong>
  ),
  ul: ({ children }) => (
    <ul style={{ margin: "4px 0 6px 0", paddingLeft: 20 }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ margin: "4px 0 6px 0", paddingLeft: 20 }}>{children}</ol>
  ),
  li: ({ children }) => (
    <li style={{ marginBottom: 3, lineHeight: 1.63 }}>{children}</li>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: "#E84D5C", textDecoration: "underline", wordBreak: "break-all" }}
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code
      style={{
        background: "#FFF0F2",
        border: "1px solid #FFE4E7",
        padding: "1px 5px",
        borderRadius: 4,
        fontSize: 13,
      }}
    >
      {children}
    </code>
  ),
  h1: ({ children }) => (
    <h3 style={{ margin: "8px 0 4px", fontSize: 15, fontWeight: 700 }}>{children}</h3>
  ),
  h2: ({ children }) => (
    <h3 style={{ margin: "8px 0 4px", fontSize: 15, fontWeight: 700 }}>{children}</h3>
  ),
  h3: ({ children }) => (
    <h3 style={{ margin: "8px 0 4px", fontSize: 15, fontWeight: 700 }}>{children}</h3>
  ),
};

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === "user";

  return (
    <Group
      justify={isUser ? "flex-end" : "flex-start"}
      align="flex-end"
      gap={8}
    >
      {!isUser && <ChatAvatar />}

      <Stack gap={4} align={isUser ? "flex-end" : "flex-start"} maw="78%">
        {!isUser && message.category && (
          <Group gap={6}>
            <Badge
              size="xs"
              variant="light"
              color={CATEGORY_COLORS[message.category] ?? "gray"}
            >
              {message.category}
            </Badge>
            {message.is_fallback && (
              <Badge size="xs" variant="outline" color="orange">
                일반 정보
              </Badge>
            )}
          </Group>
        )}

        <Paper
          px={14}
          py={10}
          radius="lg"
          withBorder={!isUser}
          style={{
            wordBreak: "keep-all",
            lineHeight: 1.63,
            fontSize: 14.5,
            color: isUser ? "#fff" : "#2D1A1E",
            background: isUser
              ? "linear-gradient(135deg, #FF8E9B 0%, #E84D5C 100%)"
              : "#fff",
            borderColor: "#FFE4E7",
            borderBottomRightRadius: isUser ? 5 : 18,
            borderBottomLeftRadius: isUser ? 18 : 5,
            boxShadow: isUser
              ? "0 4px 14px rgba(255, 107, 122, 0.34)"
              : "0 1px 6px rgba(255, 107, 122, 0.07)",
          }}
        >
          {isUser ? (
            <span style={{ whiteSpace: "pre-line" }}>{message.content}</span>
          ) : (
            <div style={{ fontSize: 14.5 }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </Paper>

        {!isUser && message.sources && message.sources.length > 0 && (
          <Stack gap={2} px={4}>
            <Text size="xs" c="#C4909A">
              📎 참고 자료
            </Text>
            {message.sources.map((src, i) => {
              const label = `· [${COLLECTION_LABELS[src.collection] ?? src.collection}] ${src.title}`;
              return src.url ? (
                <Text
                  key={i}
                  size="xs"
                  component="a"
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#E84D5C", textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  {label} ↗
                </Text>
              ) : (
                <Text key={i} size="xs" c="#C4909A">
                  {label}
                </Text>
              );
            })}
          </Stack>
        )}

        <Text size="xs" c="#C4909A" px={4}>
          {message.time}
        </Text>
      </Stack>
    </Group>
  );
};
export default MessageBubble;
