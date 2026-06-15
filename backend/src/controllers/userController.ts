import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth";
import { supabase } from "../config/database";

export async function getUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;

    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, email, avatar")
      .neq("id", userId)
      .limit(50);

    if (error) throw error;

    res.json(users);
  } catch (error) {
    res.status(500);
    next(error);
  }
}
