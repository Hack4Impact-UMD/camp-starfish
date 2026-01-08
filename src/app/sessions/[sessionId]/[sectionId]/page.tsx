import SectionPage from "@/components/SectionPage";

interface SectionRouteParams {
  sessionId: string;
  sectionId: string;
}

export default async function SectionRoute(props: { params: Promise<SectionRouteParams> }) {
  const { sessionId, sectionId } = await props.params;
  return <SectionPage sessionId={sessionId} sectionId={sectionId} />
}