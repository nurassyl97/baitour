export default function RootLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#22a7f0] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#64748B] font-medium">Загрузка…</p>
      </div>
    </div>
  );
}
