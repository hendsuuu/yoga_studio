export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface min-h-screen">
      <div className="w-full bg-gray-50 min-h-screen relative flex flex-col">
        {children}
      </div>
    </div>
  );
}
