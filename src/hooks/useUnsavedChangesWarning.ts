"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import openConfirmationModal from "@/components/modals/ConfirmationModal";

const DEFAULT_MESSAGE = "Leaving this page will lose your unsaved changes.";

/**
 * While `hasUnsavedChanges` is true, warns the user before they leave the page:
 * - In-app links (e.g. the navbar) show a confirmation modal before navigating.
 * - Reloading, closing the tab, or typing a new URL shows the browser's built-in prompt.
 *
 * Not covered: the browser Back/Forward buttons and programmatic `router.push` calls,
 * since the Next.js App Router has no API for blocking those.
 */
export default function useUnsavedChangesWarning(hasUnsavedChanges: boolean, message: string = DEFAULT_MESSAGE) {
  const router = useRouter();

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();

    const handleLinkClick = (event: MouseEvent) => {
      // Let the browser handle new-tab/new-window clicks: they don't leave this page
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if ((anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      // External links do a full page load, which handleBeforeUnload already covers
      if (url.origin !== window.location.origin) return;
      // Links to this same page (or a #hash on it) don't lose anything
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      // Runs in the capture phase on window, so this fires before Next.js <Link> handles the click
      event.preventDefault();
      event.stopPropagation();
      openConfirmationModal({
        title: "Leave this page?",
        message,
        onConfirm: () => router.push(url.pathname + url.search + url.hash),
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("click", handleLinkClick, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("click", handleLinkClick, true);
    };
  }, [hasUnsavedChanges, message, router]);
}
