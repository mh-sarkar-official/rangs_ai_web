import ChatPane from "@/components/ChatPane";

export default function ChatDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  return <ChatPane conversationId={Number.isFinite(id) ? id : undefined} />;
}
