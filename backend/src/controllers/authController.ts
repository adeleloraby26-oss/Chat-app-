import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { supabase } from "../config/database";
import { createClient } from "@supabase/supabase-js";

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, avatar, created_at, updated_at")
      .eq("id", req.userId)
      .single();

    if (error || !user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500);
    next(error);
  }
}

// Called right after Supabase sign-in to sync user profile
export async function authCallback(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const token = authHeader.split(" ")[1];

    // Verify token and get Supabase user
    const userClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error } = await userClient.auth.getUser();
    if (error || !user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Upsert user profile
    const name =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User";
    const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || "";

    const { data: dbUser, error: upsertError } = await supabase
      .from("users")
      .upsert(
        {
          supabase_uid: user.id,
          name,
          email: user.email!,
          avatar,
        },
        { onConflict: "supabase_uid" }
      )
      .select()
      .single();

    if (upsertError) throw upsertError;

    res.json(dbUser);
  } catch (error) {
    res.status(500);
    next(error);
  }
}
