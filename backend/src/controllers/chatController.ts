import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { supabase } from "../config/database";

export async function getChats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;

    const { data: chats, error } = await supabase
      .from("chats")
      .select(`
        id,
        last_message_at,
        created_at,
        last_message:messages!chats_last_message_id_fkey(id, text, created_at),
        participant_1:users!chats_participant_1_id_fkey(id, name, email, avatar),
        participant_2:users!chats_participant_2_id_fkey(id, name, email, avatar)
      `)
      .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
      .order("last_message_at", { ascending: false });

    if (error) throw error;

    const formattedChats = chats.map((chat: any) => {
      const participant =
        chat.participant_1?.id === userId ? chat.participant_2 : chat.participant_1;
      return {
        id: chat.id,
        participant,
        lastMessage: chat.last_message,
        lastMessageAt: chat.last_message_at,
        createdAt: chat.created_at,
      };
    });

    res.json(formattedChats);
  } catch (error) {
    res.status(500);
    next(error);
  }
}

export async function getOrCreateChat(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const { participantId } = req.params;

    if (!participantId) {
      res.status(400).json({ message: "Participant ID is required" });
      return;
    }

    if (userId === participantId) {
      res.status(400).json({ message: "Cannot create chat with yourself" });
      return;
    }

    // Check if chat already exists (either direction)
    const { data: existing } = await supabase
      .from("chats")
      .select(`
        id, last_message_at, created_at,
        last_message:messages!chats_last_message_id_fkey(id, text, created_at),
        participant_1:users!chats_participant_1_id_fkey(id, name, email, avatar),
        participant_2:users!chats_participant_2_id_fkey(id, name, email, avatar)
      `)
      .or(
        `and(participant_1_id.eq.${userId},participant_2_id.eq.${participantId}),and(participant_1_id.eq.${participantId},participant_2_id.eq.${userId})`
      )
      .maybeSingle();

    let chat = existing;

    if (!chat) {
      const { data: newChat, error } = await supabase
        .from("chats")
        .insert({ participant_1_id: userId, participant_2_id: participantId })
        .select(`
          id, last_message_at, created_at,
          last_message:messages!chats_last_message_id_fkey(id, text, created_at),
          participant_1:users!chats_participant_1_id_fkey(id, name, email, avatar),
          participant_2:users!chats_participant_2_id_fkey(id, name, email, avatar)
        `)
        .single();
      if (error) throw error;
      chat = newChat;
    }

    const participant =
      (chat as any).participant_1?.id === userId
        ? (chat as any).participant_2
        : (chat as any).participant_1;

    res.json({
      id: chat.id,
      participant,
      lastMessage: (chat as any).last_message,
      lastMessageAt: chat.last_message_at,
      createdAt: chat.created_at,
    });
  } catch (error) {
    res.status(500);
    next(error);
  }
}
