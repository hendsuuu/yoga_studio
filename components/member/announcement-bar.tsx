import { Megaphone } from "lucide-react";

interface Props {
  message: string;
}

export function AnnouncementBar({ message }: Props) {
  return (
    <div className="bg-secondary text-white p-4 rounded-2xl flex items-start gap-3 shadow-md">
      <Megaphone className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
      <p className="text-[10px] font-medium leading-relaxed opacity-90">
        {message}
      </p>
    </div>
  );
}
