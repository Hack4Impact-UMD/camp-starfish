import { listPostDocs } from "@/data/firestore/posts";
import { useQuery } from "@tanstack/react-query";

export default function usePosts() {
  return useQuery({
    queryKey: ["posts", "list"],
    queryFn: () => listPostDocs(),
  });
}
