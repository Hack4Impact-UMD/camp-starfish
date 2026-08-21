import { postListQueryOptions } from "@/hooks/posts/usePostList";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

export default function PostsPage() {
  const postsQuery = useSuspenseInfiniteQuery(postListQueryOptions());

  return <div>{postsQuery.data.map(x => x.id)}</div>
}