const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    /*
     * HEALTH CHECK
     */
    if (url.pathname === "/api/health" && request.method === "GET") {
      return json({
        success: true,
        message: "SORRY-JANVI API is running ❤️"
      });
    }

    /*
     * SAVE JANVI'S RESPONSE
     */
    if (url.pathname === "/api/response" && request.method === "POST") {
      try {
        const body = await request.json();
        const response = body?.response;

        if (
          response !== "Haan" &&
          response !== "Mujhe thoda time chahiye"
        ) {
          return json(
            {
              success: false,
              message: "Invalid response"
            },
            400
          );
        }

        const createdAt = new Date().toISOString();

        await env.DB
          .prepare(
            "INSERT INTO responses (response, created_at) VALUES (?, ?)"
          )
          .bind(response, createdAt)
          .run();

        return json({
          success: true,
          message: "Response saved ❤️"
        });
      } catch (error) {
        console.error("Response save error:", error);

        return json(
          {
            success: false,
            message: "Could not save response"
          },
          500
        );
      }
    }

    /*
     * PRIVATE RESPONSE LIST
     *
     * This endpoint requires ADMIN_KEY.
     * We will connect the private dashboard to it next.
     */
    if (url.pathname === "/api/responses" && request.method === "GET") {
      const adminKey = request.headers.get("X-Admin-Key");

      if (!env.ADMIN_KEY || adminKey !== env.ADMIN_KEY) {
        return json(
          {
            success: false,
            message: "Unauthorized"
          },
          401
        );
      }

      try {
        const result = await env.DB
          .prepare(
            "SELECT id, response, created_at FROM responses ORDER BY id DESC"
          )
          .all();

        return json({
          success: true,
          responses: result.results || []
        });
      } catch (error) {
        console.error("Response read error:", error);

        return json(
          {
            success: false,
            message: "Could not read responses"
          },
          500
        );
      }
    }

    /*
     * SERVE WEBSITE
     */
    return env.ASSETS.fetch(request);
  }
};
