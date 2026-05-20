import { COMMENTS } from '@/features/community/post-detail/mocks/mockData';
import type { Comment, Post } from '@/features/community/post-detail/types/types';
import { useState } from "react";

export function usePostDetail(post: Post) {
  const [liked, setLiked] = useState(post.liked ?? false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [bookmarked, setBookmarked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>(COMMENTS);

  const handleLike = () => {
    setLiked((prevLiked) => {
      setLikeCount((prevCount) => (prevLiked ? prevCount - 1 : prevCount + 1));
      return !prevLiked;
    });
  };

  const handleBookmark = () => {
    setBookmarked((prev) => !prev);
  };

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now(),
      author: "김지연",
      authorLevel: "레벨 5",
      emoji: "🌸",
      childAge: "14개월",
      timeAgo: "방금",
      body: commentText,
      likes: 0,
      isAuthor: true,
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
