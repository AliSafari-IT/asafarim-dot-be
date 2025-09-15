export default function MiniTile({ title, desc }: { title: string; desc: string }) {
    return (
      <div className="rounded-md border border-neutral-800 p-3">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs opacity-80">{desc}</div>
      </div>
    );
}