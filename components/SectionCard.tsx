import Link from "next/link";

interface SectionCardProps {
  number: number;
  title: string;
  description: string;
  href: string;
}

export default function SectionCard({ number, title, description, href }: SectionCardProps) {
  return (
    <Link href={href} className="border p-4 rounded-lg hover:bg-gray-100 block">
      <h2>{number}. {title}</h2>
      <p>{description}</p>
    </Link>
  )
}
