import { createBrowserRouter } from "react-router-dom";
import ChatPage from "../pages/ChatPage";
import CommunityPage from "@/pages/CommunityPage";
import PostDetailPage from "@/pages/PostDetailPage";
import PostWritePage from "@/pages/PostWritePage";
import Test from "@/pages/Test";
import SignupPage from "@/pages/SignupPage";
import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import ParentInfoStep from '@/features/onboarding/components/ParentInfoStep';
import ChildInfoStep from '@/features/onboarding/components/ChildInfoStep';
import InterestRegionStep from '@/features/onboarding/components/InterestRegionStep';
import InterestStep from '@/features/onboarding/components/InterestStep';

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
    path: "/community/posts/:postnum",
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
  {
    path: "/onboarding/parent",
    element: <ParentInfoStep/>,
  },
  {
    path: "/onboarding/children",
    element: <ChildInfoStep/>,
  },
  {
    path: "/onboarding/regions",
    element: <InterestRegionStep />,
  },
  {
    path: "/onboarding/interests",
    element: <InterestStep/>,
  },
]);
