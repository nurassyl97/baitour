export default function SearchLoading() {
  return (
    <div className="ds-container py-8">
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <div className="w-10 h-10 border-2 border-[#22a7f0] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#64748B] font-medium">Загрузка результатов…</p>
      </div>
    </div>
  );
}
