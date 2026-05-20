export interface Post {
  id: number;
  author: string;
  authorLevel?: string;
  childAge: string;
  timeAgo: string;
  category: string;
  categoryColor: string;
  title: string;
  body: string;
  emoji: string;
  images?: string[];
  likes: number;
  comments: number;
  views: number;
  isHot?: boolean;
  liked?: boolean;
}

export interface Comment {
  id: number;
  author: string;
  authorLevel?: string;
  emoji: string;
  childAge: string;
  timeAgo: string;
  body: string;
  likes: number;
  liked?: boolean;
  isAuthor?: boolean;
}

