import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "@/i18n/i18nProvider";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="flex-1 flex items-center justify-center py-20 bg-background">
      <div className="text-center max-w-md px-4">
        <AlertCircle className="h-16 w-16 text-accent mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-primary mb-4" data-testid="text-404-title">{t("notFound.title")}</h1>
        <p className="text-muted-foreground mb-8" data-testid="text-404-desc">{t("notFound.description")}</p>
        <Link href="/" className="btn-gradient px-8 py-3 rounded-xl font-bold" data-testid="link-back-home">{t("notFound.backHome")}</Link>
      </div>
    </div>
  );
}
