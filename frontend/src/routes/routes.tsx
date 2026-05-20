import { createBrowserRouter } from "react-router-dom";
import ChatPage from "../pages/ChatPage";
import CommunityPage from "@/pages/CommunityPage";
import PostDetailPage from "@/pages/PostDetailPage";
import PostWritePage from "@/pages/PostWritePage";
import Test from "@/pages/Test";
import SignupPage from "@/pages/SignupPage";
import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/chat",
    element: <ChatPage />,
  },
  {
    path: "/community",
    element: <CommunityPage />,
  },
  {
    path: "/community/1",
    element: <PostDetailPage />,
  },
  {
    path: "/community/post/new",
    element: <PostWritePage />,
  },
  {
    path: "/test",
    element: <Test />,
  },
]);
