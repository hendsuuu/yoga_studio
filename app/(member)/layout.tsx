export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface min-h-screen flex justify-center">
      <div className="w-full max-w-[480px] bg-white min-h-screen shadow-xl relative flex flex-col border-x border-gray-100">
        {children}
      </div>
    </div>
  );
}
