import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/app-shell";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Try again or head home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FDSV1— Enterprise Fraud Risk Management" },
      {
        name: "description",
        content:
          "Enterprise Fraud Risk Management Platform for E-Wallet, Digital Banking, and Payment Service Providers — aligned with Bank Indonesia and OJK.",
      },
      { name: "author", content: "Sentinel" },
      { property: "og:title", content: "FDSV1— Enterprise Fraud Risk Management" },
      { property: "og:description", content: "Guardian Platform is an enterprise fraud risk management solution for digital finance." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "FDSV1— Enterprise Fraud Risk Management" },
      { name: "description", content: "Guardian Platform is an enterprise fraud risk management solution for digital finance." },
      { name: "twitter:description", content: "Guardian Platform is an enterprise fraud risk management solution for digital finance." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/cc0d1d05-fcaf-4fae-84a5-41cce6899eba/id-preview-c7f1ff5d--3cb8c00d-f53f-4e3e-badb-864bed63e3a9.lovable.app-1780633346821.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/cc0d1d05-fcaf-4fae-84a5-41cce6899eba/id-preview-c7f1ff5d--3cb8c00d-f53f-4e3e-badb-864bed63e3a9.lovable.app-1780633346821.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthGate />
        <Toaster position="top-right" richColors />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AuthGate() {
  const router = useRouter();
  const pathname = router.state.location.pathname;
  // dynamic import here would break SSR; static import is fine since these are client-state utilities
  const { useAppStore } = require("@/lib/app-store") as typeof import("@/lib/app-store");
  const { canAccess, defaultLanding } = require("@/lib/rbac") as typeof import("@/lib/rbac");
  const session = useAppStore((s) => s.session);
  const users = useAppStore((s) => s.users);
  const currentUser = session ? users.find((u) => u.id === session.userId) ?? null : null;

  useEffect(() => {
    if (!currentUser && pathname !== "/login") {
      router.navigate({ to: "/login", replace: true });
      return;
    }
    if (currentUser && pathname === "/login") {
      router.navigate({ to: defaultLanding(currentUser.role) as any, replace: true });
      return;
    }
    if (currentUser && !canAccess(currentUser.role, pathname)) {
      router.navigate({ to: defaultLanding(currentUser.role) as any, replace: true });
    }
  }, [currentUser, pathname, router]);

  if (pathname === "/login") {
    return <Outlet />;
  }
  if (!currentUser) return null;
  if (!canAccess(currentUser.role, pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
        <div>
          <h1 className="text-xl font-semibold">Access Denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Role <span className="font-mono">{currentUser.role}</span> tidak memiliki akses ke halaman ini.
          </p>
        </div>
      </div>
    );
  }
  return <AppShell />;
}

