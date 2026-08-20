import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  className?: string;
}

export function StatsCard({ title, value, description, icon, iconColor, className }: Props) {
  return (
    <Card className={cn("p-6", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-0">
        <CardTitle className="text-sm font-semibold text-on-surface-variant tracking-wide uppercase">
          {title}
        </CardTitle>
        {icon && (
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", iconColor ?? "bg-surface-container text-primary")}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="px-0">
        <div className="text-3xl font-bold text-primary font-display">{value}</div>
        {description && (
          <p className="text-xs text-on-surface-variant mt-2 font-semibold uppercase tracking-wider">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
