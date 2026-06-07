import { useState } from "react";
import { apiFetch } from "@/lib/api";

interface UsePostLikeProps {
  postnum: number;
  initialLiked: boolean;
  initialLikeCount: number;
}

export const usePostLike = ({
  postnum,
  initialLiked,
  initialLikeCount,
}: UsePostLikeProps) => {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  const toggleLike = async () => {
    const prevLiked = liked;
    const prevLikeCount = likeCount;

    const nextLiked = !prevLiked;

    setLiked(nextLiked);
    setLikeCount(nextLiked ? prevLikeCount + 1 : prevLikeCount - 1);

    try {
      await apiFetch(`/community/posts/${postnum}/likes`, {
        method: nextLiked ? "POST" : "DELETE",
      });
    } catch (error) {
      console.error(error);

      setLiked(prevLiked);
      setLikeCount(prevLikeCount);
      alert("좋아요 처리에 실패했습니다.");
    }
  };

  return {
    liked,
    likeCount,
    toggleLike,
  };
};
