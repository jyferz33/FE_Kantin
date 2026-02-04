import NotaClient from "./NotaClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params; // params is Promise in Next terbaru
  return <NotaClient orderId={id} />;
}