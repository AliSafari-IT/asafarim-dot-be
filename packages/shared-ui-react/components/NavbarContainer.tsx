// NavbarContainer.tsx responsive and themeable

export default function NavbarContainer({ children }: { children?: React.ReactNode }) {
    return (
        <div role="navigation" className="w-full">
            {children}
        </div>
    );
}
