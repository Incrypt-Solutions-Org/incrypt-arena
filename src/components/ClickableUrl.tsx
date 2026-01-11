/**
 * ClickableUrl Component
 * Reusable component for rendering clickable URLs that open in new tabs
 */
import { ExternalLink } from 'lucide-react';

interface ClickableUrlProps {
  url: string | null | undefined;
  label?: string;
  className?: string;
  showIcon?: boolean;
}

export function ClickableUrl({ url, label, className = '', showIcon = true }: ClickableUrlProps) {
  if (!url || url.trim() === '') {
    return <span className="text-gray-500">—</span>;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-neon-blue hover:text-neon-blue/80 transition-colors flex items-center gap-1 w-fit ${className}`}
    >
      {showIcon && <ExternalLink className="w-3 h-3 flex-shrink-0" />}
      <span className="truncate">{label || url}</span>
    </a>
  );
}
