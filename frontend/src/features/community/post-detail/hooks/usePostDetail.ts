import { useState } from "react";
import { COMMENTS } from "@/features/community/post-detail/mocks/mockData";
import type {
  Comment,
  Post,
} from "@/features/community/post-detail/types/types";

export function usePostDetail(post: Post) {
  const [liked, setLiked] = useState(post.is_liked ?? false);
  const [likeCount, setLikeCount] = useState(post.like_count ?? 0);
  const [bookmarked, setBookmarked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>(COMMENTS);

  const handleLike = () => {
    setLiked((prevLiked) => {
      setLikeCount((prevCount) =>
        prevLiked ? Math.max(prevCount - 1, 0) : prevCount + 1,
      );

      return !prevLiked;
    });
  };

  const handleBookmark = () => {
    setBookmarked((prev) => !prev);
  };

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      commentnum: Date.now(),
      c_user: 0,
      c_post: post.postnum,
      nickname: "나",
      c_created_at: new Date().toISOString(),
      c_content: commentText.trim(),
    };

    setComments((prev) => [newComment, ...prev]);
    setCommentText("");
  };

  return {
    liked,
    likeCount,
    bookmarked,
    comments,
    commentText,
    setCommentText,
    handleLike,
    handleBookmark,
    handleSubmitComment,
  };
}
