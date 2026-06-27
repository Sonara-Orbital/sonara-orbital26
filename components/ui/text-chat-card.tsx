import { Card } from "@/components/ui/card";

interface ChatCardProps {
    value: string;
    className?: string;
}

export function ChatCard({ value, className }: ChatCardProps) {
    return (
        <Card className="ml-auto w-fit max-w-[40%] rounded-2x1 text-zinc-100 px-4 py-2 text-sm leading-relaxed mr-15 bg-black">
            <p>{value}</p>
        </Card>
    )
}