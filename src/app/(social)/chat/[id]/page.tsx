import { ChatRoom } from "@/components/chat-room";

type Props = { params: Promise<{ id: string }> };

export default async function ChatThreadPage({ params }: Props) {
  const { id } = await params;
  return <ChatRoom chatId={id} />;
}
