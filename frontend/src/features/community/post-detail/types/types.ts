export type Post = {
  postnum: number;
  p_title: string;
  p_content: string;
  p_user: number;
  nickname: string;
  profile_image_url?: string | null;
  p_region_tag: string;
  p_category_tag: string;
  p_created_at: string;
  comment_count: number;
  like_count: number;
  is_liked: boolean;
  image_urls: string[];
};

export type Comment = {
  commentnum: number;
  c_content: string;
  c_user: number;
  c_post: number;
  nickname: string;
  profile_image_url?: string | null;
  c_created_at: string;
};

export type MyPageUser = {
  usernum: number;
  id: string;
  nickname: string;
  parents_name: string;
  parents_birth: string;
  parents_gender: string;
  parents_mbti: string | null;
  email: string;
  region: string;
  profile_image_url?: string | null;
  created_at: string;
};

export type CommunityPostsResponse = {
  posts: Post[];
};

export type PostDetailResponse = {
  post: Post;
};

export type CommentsResponse = {
  comments: Comment[];
};
