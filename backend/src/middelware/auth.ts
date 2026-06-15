import type { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

export type AuthRequest = Request & {
  userId?: string;
};

export const protectRoute = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ message: "Unauthorized - no token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];

    // Verify with Supabase using the user's JWT
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error } = await userClient.auth.getUser();
    if (error || !user) {
      res.status(401).json({ message: "Unauthorized - invalid token" });
      return;
    }

    // Look up internal user record
    const { createClient: createAdmin } = await import("@supabase/supabase-js");
    const adminClient = createAdmin(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: dbUser } = await adminClient
      .from("users")
      .select("id")
      .eq("supabase_uid", user.id)
      .single();

    if (!dbUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    req.userId = dbUser.id;
    next();
  } catch (error) {
    res.status(500);
    next(error);
  }
};
