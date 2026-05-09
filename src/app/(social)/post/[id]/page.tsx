import { notFound } from "next/navigation";

import { PostDetail } from "@/components/post-detail";

type Props = { params: Promise<{ id: string }> };

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  if (!id) notFound();
  return <PostDetail postId={id} />;
}
