import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth";
import { supabase } from "../config/database";

export async function getMessages(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const { chatId } = req.params;

    // Verify user is a participant
    const { data: chat } = await supabase
      .from("chats")
      .select("id")
      .eq("id", chatId)
      .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
      .maybeSingle();

    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    const { data: messages, error } = await supabase
      .from("messages")
      .select("id, text, created_at, sender:users!messages_sender_id_fkey(id, name, email, avatar)")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    res.json(messages);
  } catch (error) {
    res.status(500);
    next(error);
  }
}
