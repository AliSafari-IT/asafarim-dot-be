import MiniTile from "./MiniTile";

export default function ShowcaseCard({
    title = "",
    desc = "",
    miniTiles = [],
    children
}: {
    title?: string;
    desc?: string;
    miniTiles?: { title: string; desc: string }[];
    children?: React.ReactNode;
}) {
    return (
      <div className="rounded-lg border border-neutral-800 p-5 md:p-6 backdrop-blur-sm">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-brand">{title}</h3>
          <p className="text-sm text-secondary">
            {desc}
          </p>
        </div>
  
        <div className="grid grid-cols-2 gap-3">
          {children??
          miniTiles?.map((miniTile, index) => (
            <MiniTile key={index} title={miniTile.title} desc={miniTile.desc} />
          ))}
        </div>
      </div>
    );
}