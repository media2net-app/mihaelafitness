import PDFGeneratorClient from './PDFGeneratorClient';

export default async function PDFGeneratorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <PDFGeneratorClient params={resolvedParams} />;
}

