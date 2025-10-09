export interface DropdownDividerProps {
  className?: string;
  'data-testid'?: string;
}

export const DropdownDivider = ({
  className = '',
  'data-testid': testId,
}: DropdownDividerProps) => {
  return (
    <div
      className={`dropdown-divider ${className}`}
      role="separator"
      data-testid={testId}
    />
  );
};
