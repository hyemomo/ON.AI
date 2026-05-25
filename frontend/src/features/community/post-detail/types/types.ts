export interface Post {
  postnum: number;
  p_user: number;

  p_title: string;
  p_content: string;

  p_region_tag: string;
  p_category_tag: string;

  nickname: string;

  p_created_at: string;

  image_urls: string[];

  like_count: number;
  comment_count: number;
  is_liked: boolean;
}

export interface CommunityPostsResponse {
  posts: Post[];
}

export interface Comment {
  commentnum: number;
  c_user: string;
  c_post: number;
  nickname: string;
  c_created_at: string;
  c_content: string;

}
