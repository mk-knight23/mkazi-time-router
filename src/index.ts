interface Env {}

type Website = {
  id: string;
  name: string;
  origin: string;
};

const WEBSITES: readonly Website[] = [
  {
    id: "01",
    name: "DevTools",
    origin: "https://kazi-01-devtools.vercel.app",
  },
  {
    id: "02",
    name: "Fullstack",
    origin: "https://kazi-02-fullstack.vercel.app",
  },
  {
    id: "03",
    name: "Frontend",
    origin: "https://kazi-03-frontend.vercel.app",
  },
  {
    id: "04",
    name: "Backend",
    origin: "https://kazi-04-backend.vercel.app",
  },
  {
    id: "05",
    name: "Frontend AI",
    origin: "https://kazi-05-frontend-ai.vercel.app",
  },
] as const;

const MINUTES_PER_DAY = 1440;
const SLOT_MINUTES = 288;
const IST_OFFSET_MINUTES = 330;

function getScheduledWebsite(date = new Date()) {
  const utcMinutes =
    date.getUTCHours() * 60 +
    date.getUTCMinutes();

  const indiaMinutes =
    (utcMinutes + IST_OFFSET_MINUTES) %
    MINUTES_PER_DAY;

  const index = Math.min(
    Math.floor(indiaMinutes / SLOT_MINUTES),
    WEBSITES.length - 1,
  );

  return {
    index,
    website: WEBSITES[index],
    indiaMinutes,
  };
}

function getStickyWebsiteIndex(
  request: Request,
): number | null {
  const cookieHeader =
    request.headers.get("cookie");

  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader.match(
    /(?:^|;\s*)mkazi_active_site=([0-4])(?:;|$)/,
  );

  if (!match) {
    return null;
  }

  const index = Number(match[1]);

  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= WEBSITES.length
  ) {
    return null;
  }

  return index;
}

function isHtmlNavigation(
  request: Request,
): boolean {
  const accept =
    request.headers.get("accept") || "";

  return (
    request.method === "GET" &&
    accept.includes("text/html")
  );
}

function getCookieLifetime(
  indiaMinutes: number,
): number {
  const position =
    indiaMinutes % SLOT_MINUTES;

  const remainingMinutes =
    SLOT_MINUTES - position;

  return Math.max(
    60,
    Math.min(
      Math.floor(remainingMinutes * 60),
      600,
    ),
  );
}

function rewriteRedirectLocation(
  location: string,
  origin: string,
  publicUrl: URL,
): string {
  try {
    const targetLocation =
      new URL(location, origin);

    const originUrl =
      new URL(origin);

    if (
      targetLocation.origin !==
      originUrl.origin
    ) {
      return location;
    }

    targetLocation.protocol =
      publicUrl.protocol;

    targetLocation.host =
      publicUrl.host;

    return targetLocation.toString();
  } catch {
    return location;
  }
}

export default {
  async fetch(
    request: Request,
    _env: Env,
  ): Promise<Response> {
    const publicUrl =
      new URL(request.url);

    // Redirect www to non-www
    if (
      publicUrl.hostname ===
      "www.mkazi.live"
    ) {
      publicUrl.hostname =
        "mkazi.live";

      return Response.redirect(
        publicUrl.toString(),
        301,
      );
    }

    const scheduled =
      getScheduledWebsite();

    if (
      publicUrl.pathname ===
      "/__router-health"
    ) {
      return Response.json(
        {
          ok: true,
          router:
            "mkazi-cloudflare-router",
          scheduledWebsite:
            scheduled.website.id,
          scheduledName:
            scheduled.website.name,
          scheduledOrigin:
            scheduled.website.origin,
          indiaMinutesSinceMidnight:
            scheduled.indiaMinutes,
          slotMinutes:
            SLOT_MINUTES,
          timestamp:
            new Date().toISOString(),
        },
        {
          status: 200,
          headers: {
            "cache-control":
              "no-store",
            "x-mkazi-router":
              "cloudflare-worker",
          },
        },
      );
    }

    const stickyIndex =
      getStickyWebsiteIndex(request);

    const activeIndex =
      isHtmlNavigation(request)
        ? scheduled.index
        : stickyIndex ??
          scheduled.index;

    const activeWebsite =
      WEBSITES[activeIndex];

    const destination =
      new URL(activeWebsite.origin);

    destination.pathname =
      publicUrl.pathname;

    destination.search =
      publicUrl.search;

    const requestHeaders =
      new Headers(request.headers);

    requestHeaders.delete("host");
    requestHeaders.delete(
      "content-length",
    );

    requestHeaders.set(
      "x-forwarded-host",
      publicUrl.host,
    );

    requestHeaders.set(
      "x-forwarded-proto",
      publicUrl.protocol.replace(
        ":",
        "",
      ),
    );

    requestHeaders.set(
      "x-mkazi-active-site",
      activeWebsite.id,
    );

    try {
      const upstreamRequest =
        new Request(
          destination.toString(),
          {
            method: request.method,
            headers: requestHeaders,
            body:
              request.method ===
                "GET" ||
              request.method ===
                "HEAD"
                ? undefined
                : request.body,
            redirect: "manual",
          },
        );

      const upstreamResponse =
        await fetch(upstreamRequest);

      const responseHeaders =
        new Headers(
          upstreamResponse.headers,
        );

      responseHeaders.set(
        "x-mkazi-router",
        "cloudflare-worker",
      );

      responseHeaders.set(
        "x-mkazi-active-site",
        activeWebsite.id,
      );

      responseHeaders.set(
        "x-mkazi-active-name",
        activeWebsite.name,
      );

      const location =
        responseHeaders.get(
          "location",
        );

      if (location) {
        responseHeaders.set(
          "location",
          rewriteRedirectLocation(
            location,
            activeWebsite.origin,
            publicUrl,
          ),
        );
      }

      const contentType =
        responseHeaders.get(
          "content-type",
        ) || "";

      if (
        contentType.includes(
          "text/html",
        ) ||
        publicUrl.pathname.startsWith(
          "/api/",
        )
      ) {
        responseHeaders.set(
          "cache-control",
          "private, no-store, max-age=0",
        );
      }

      if (isHtmlNavigation(request)) {
        const cookieLifetime =
          getCookieLifetime(
            scheduled.indiaMinutes,
          );

        responseHeaders.append(
          "set-cookie",
          [
            `mkazi_active_site=${scheduled.index}`,
            `Max-Age=${cookieLifetime}`,
            "Path=/",
            "Secure",
            "HttpOnly",
            "SameSite=Lax",
          ].join("; "),
        );
      }

      return new Response(
        upstreamResponse.body,
        {
          status:
            upstreamResponse.status,
          statusText:
            upstreamResponse.statusText,
          headers: responseHeaders,
        },
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown proxy error";

      console.error(
        "MKazi proxy error",
        {
          activeWebsite:
            activeWebsite.id,
          destination:
            destination.toString(),
          message,
        },
      );

      return Response.json(
        {
          ok: false,
          code:
            "UPSTREAM_PROXY_FAILED",
          activeWebsite:
            activeWebsite.id,
          activeOrigin:
            activeWebsite.origin,
          message,
        },
        {
          status: 502,
          headers: {
            "cache-control":
              "no-store",
            "x-mkazi-router":
              "cloudflare-worker",
            "x-mkazi-active-site":
              activeWebsite.id,
          },
        },
      );
    }
  },
};
