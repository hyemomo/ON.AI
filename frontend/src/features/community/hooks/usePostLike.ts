import { useState } from "react";

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

  const token = localStorage.getItem("access_token");

  const toggleLike = async () => {
    const prevLiked = liked;
    const prevLikeCount = likeCount;

    const nextLiked = !prevLiked;

    setLiked(nextLiked);
    setLikeCount(nextLiked ? prevLikeCount + 1 : prevLikeCount - 1);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/community/posts/${postnum}/likes`,
        {
          method: nextLiked ? "POST" : "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("좋아요 처리 실패");
      }
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
