import { useDir } from '@/hooks/use-dir';

export function DirProvider({ children }: { children: React.ReactNode }) {
  useDir();
  return children;
}
