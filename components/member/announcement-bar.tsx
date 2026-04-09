import { Megaphone } from "lucide-react";

interface Props {
  message: string;
}

export function AnnouncementBar({ message }: Props) {
  return (
    <div className="bg-secondary text-white p-3 rounded-xl flex items-start gap-2.5 shadow-md">
      <Megaphone className="w-3.5 h-3.5 shrink-0 mt-0.5 text-accent" />
      <p className="text-xs font-medium leading-relaxed opacity-90">
        {message}
      </p>
    </div>
  );
}
