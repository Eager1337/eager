export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_email: string
          created_at: string
          details: string | null
          id: string
          target_id: string | null
        }
        Insert: {
          action: string
          admin_email?: string
          created_at?: string
          details?: string | null
          id?: string
          target_id?: string | null
        }
        Update: {
          action?: string
          admin_email?: string
          created_at?: string
          details?: string | null
          id?: string
          target_id?: string | null
        }
        Relationships: []
      }
      admin_login_attempts: {
        Row: {
          fail_count: number
          identifier: string
          locked_until: string | null
          updated_at: string
        }
        Insert: {
          fail_count?: number
          identifier: string
          locked_until?: string | null
          updated_at?: string
        }
        Update: {
          fail_count?: number
          identifier?: string
          locked_until?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      intruder_events: {
        Row: {
          accuracy: number | null
          created_at: string
          id: string
          ip: string | null
          language: string | null
          latitude: number | null
          location_label: string | null
          longitude: number | null
          photo: string | null
          platform: string | null
          reason: string
          screen: string | null
          timezone: string | null
          user_agent: string | null
          username_tried: string
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          id?: string
          ip?: string | null
          language?: string | null
          latitude?: number | null
          location_label?: string | null
          longitude?: number | null
          photo?: string | null
          platform?: string | null
          reason?: string
          screen?: string | null
          timezone?: string | null
          user_agent?: string | null
          username_tried?: string
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          id?: string
          ip?: string | null
          language?: string | null
          latitude?: number | null
          location_label?: string | null
          longitude?: number | null
          photo?: string | null
          platform?: string | null
          reason?: string
          screen?: string | null
          timezone?: string | null
          user_agent?: string | null
          username_tried?: string
        }
        Relationships: []
      }
      portfolio_assets: {
        Row: {
          content_type: string | null
          created_at: string
          key: string
          updated_at: string
          url: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          key: string
          updated_at?: string
          url: string
        }
        Update: {
          content_type?: string | null
          created_at?: string
          key?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      privacy_settings: {
        Row: {
          auto_delete: boolean
          id: string
          last_cleanup_at: string | null
          last_cleanup_count: number | null
          last_cleanup_ok: boolean | null
          retention_days: number
          updated_at: string
        }
        Insert: {
          auto_delete?: boolean
          id?: string
          last_cleanup_at?: string | null
          last_cleanup_count?: number | null
          last_cleanup_ok?: boolean | null
          retention_days?: number
          updated_at?: string
        }
        Update: {
          auto_delete?: boolean
          id?: string
          last_cleanup_at?: string | null
          last_cleanup_count?: number | null
          last_cleanup_ok?: boolean | null
          retention_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      security_settings: {
        Row: {
          id: string
          lock_minutes: number
          max_fails: number
          updated_at: string
        }
        Insert: {
          id?: string
          lock_minutes?: number
          max_fails?: number
          updated_at?: string
        }
        Update: {
          id?: string
          lock_minutes?: number
          max_fails?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      purge_expired_intruders: { Args: never; Returns: number }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
