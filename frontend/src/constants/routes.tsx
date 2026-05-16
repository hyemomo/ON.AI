import { createBrowserRouter } from "react-router-dom";
import ChatPage from "../pages/ChatPage";
import CommunityPage from "@/pages/CommunityPage";
import PostDetailPage from "@/pages/PostDetailPage";

export const router = createBrowserRouter([
  {
    path: "/chat",
    element: <ChatPage />,
  },
  { path: "/community", element: <CommunityPage /> },
  { path: "/community/1", element: <PostDetailPage /> },
]);
