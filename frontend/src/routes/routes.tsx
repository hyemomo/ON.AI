import { createBrowserRouter } from "react-router-dom";

import HomePage from "@/pages/HomePage";
import SignupPage from "@/pages/SignupPage";
import LoginPage from "@/pages/LoginPage";
import ChatPage from "@/pages/ChatPage";
import CommunityPage from "@/pages/CommunityPage";
import PostDetailPage from "@/pages/PostDetailPage";
import PostWritePage from "@/pages/PostWritePage";
import MyPage from "@/pages/MyPage";
import FriendFindPage from "@/pages/FriendFindPage";
import FriendChatPage from "@/pages/FriendChatPage";
import Test from "@/pages/Test";

import ChildInfoStep from "@/features/onboarding/components/ChildInfoStep";
import InterestStep from "@/features/onboarding/components/InterestStep";
import ProfileImageStep from "@/features/onboarding/components/ProfileImageStep";

import ProtectedRoute from "@/routes/ProtectedRoute";
import PublicOnlyRoute from "@/routes/PublicOnlyRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PublicOnlyRoute>
        <HomePage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicOnlyRoute>
        <SignupPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/onboarding/children",
    element: <ChildInfoStep />,
  },
  {
    path: "/onboarding/interests",
    element: <InterestStep />,
  },
  {
    path: "/onboarding/profile-image",
    element: <ProfileImageStep />,
  },
  {
    path: "/chat",
    element: (
      <ProtectedRoute>
        <ChatPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/community",
    element: (
      <ProtectedRoute>
        <CommunityPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/community/posts/:postnum",
    element: (
      <ProtectedRoute>
        <PostDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/community/posts/:postnum/edit",
    element: (
      <ProtectedRoute>
        <PostWritePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/community/post/new",
    element: (
      <ProtectedRoute>
        <PostWritePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/friends",
    element: (
      <ProtectedRoute>
        <FriendFindPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/friends/chat/:roomId",
    element: (
      <ProtectedRoute>
        <FriendChatPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/mypage",
    element: (
      <ProtectedRoute>
        <MyPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/test",
    element: <Test />,
  },
]);
