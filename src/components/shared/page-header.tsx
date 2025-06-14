import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode; // For action buttons or other elements
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-6 md:flex md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold leading-7 text-foreground sm:truncate sm:text-3xl sm:tracking-tight font-headline">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground font-body">
            {description}
          </p>
        )}
      </div>
      {children && <div className="mt-4 flex md:ml-4 md:mt-0">{children}</div>}
    </div>
  );
}
