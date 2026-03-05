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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      stock_financials: {
        Row: {
          cash_and_equivalents: number | null
          created_at: string | null
          ebitda: number | null
          id: string
          net_profit: number | null
          operating_profit: number | null
          period_end_date: string
          period_type: string
          revenue: number | null
          stock_id: string | null
          total_assets: number | null
          total_debt: number | null
          total_equity: number | null
          total_liabilities: number | null
        }
        Insert: {
          cash_and_equivalents?: number | null
          created_at?: string | null
          ebitda?: number | null
          id?: string
          net_profit?: number | null
          operating_profit?: number | null
          period_end_date: string
          period_type: string
          revenue?: number | null
          stock_id?: string | null
          total_assets?: number | null
          total_debt?: number | null
          total_equity?: number | null
          total_liabilities?: number | null
        }
        Update: {
          cash_and_equivalents?: number | null
          created_at?: string | null
          ebitda?: number | null
          id?: string
          net_profit?: number | null
          operating_profit?: number | null
          period_end_date?: string
          period_type?: string
          revenue?: number | null
          stock_id?: string | null
          total_assets?: number | null
          total_debt?: number | null
          total_equity?: number | null
          total_liabilities?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_financials_stock_id_fkey"
            columns: ["stock_id"]
            isOneToOne: false
            referencedRelation: "stocks"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_peers: {
        Row: {
          created_at: string | null
          id: string
          peer_stock_id: string | null
          stock_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          peer_stock_id?: string | null
          stock_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          peer_stock_id?: string | null
          stock_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_peers_peer_stock_id_fkey"
            columns: ["peer_stock_id"]
            isOneToOne: false
            referencedRelation: "stocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_peers_stock_id_fkey"
            columns: ["stock_id"]
            isOneToOne: false
            referencedRelation: "stocks"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_shareholding: {
        Row: {
          created_at: string | null
          dii_holding: number | null
          fii_holding: number | null
          government_holding: number | null
          id: string
          others_holding: number | null
          promoter_holding: number | null
          quarter_end_date: string
          retail_holding: number | null
          stock_id: string | null
        }
        Insert: {
          created_at?: string | null
          dii_holding?: number | null
          fii_holding?: number | null
          government_holding?: number | null
          id?: string
          others_holding?: number | null
          promoter_holding?: number | null
          quarter_end_date: string
          retail_holding?: number | null
          stock_id?: string | null
        }
        Update: {
          created_at?: string | null
          dii_holding?: number | null
          fii_holding?: number | null
          government_holding?: number | null
          id?: string
          others_holding?: number | null
          promoter_holding?: number | null
          quarter_end_date?: string
          retail_holding?: number | null
          stock_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_shareholding_stock_id_fkey"
            columns: ["stock_id"]
            isOneToOne: false
            referencedRelation: "stocks"
            referencedColumns: ["id"]
          },
        ]
      }
      stocks: {
        Row: {
          book_value: number | null
          change_percent: number | null
          company_name: string
          created_at: string | null
          current_price: number | null
          day_high: number | null
          day_low: number | null
          dividend_yield: number | null
          eps: number | null
          exchange: string
          face_value: number | null
          id: string
          industry: string | null
          last_updated: string | null
          market_cap: number | null
          market_cap_category: string | null
          pb_ratio: number | null
          pe_ratio: number | null
          previous_close: number | null
          roce: number | null
          roe: number | null
          sector: string | null
          symbol: string
          volume: number | null
          week_52_high: number | null
          week_52_low: number | null
        }
        Insert: {
          book_value?: number | null
          change_percent?: number | null
          company_name: string
          created_at?: string | null
          current_price?: number | null
          day_high?: number | null
          day_low?: number | null
          dividend_yield?: number | null
          eps?: number | null
          exchange?: string
          face_value?: number | null
          id?: string
          industry?: string | null
          last_updated?: string | null
          market_cap?: number | null
          market_cap_category?: string | null
          pb_ratio?: number | null
          pe_ratio?: number | null
          previous_close?: number | null
          roce?: number | null
          roe?: number | null
          sector?: string | null
          symbol: string
          volume?: number | null
          week_52_high?: number | null
          week_52_low?: number | null
        }
        Update: {
          book_value?: number | null
          change_percent?: number | null
          company_name?: string
          created_at?: string | null
          current_price?: number | null
          day_high?: number | null
          day_low?: number | null
          dividend_yield?: number | null
          eps?: number | null
          exchange?: string
          face_value?: number | null
          id?: string
          industry?: string | null
          last_updated?: string | null
          market_cap?: number | null
          market_cap_category?: string | null
          pb_ratio?: number | null
          pe_ratio?: number | null
          previous_close?: number | null
          roce?: number | null
          roe?: number | null
          sector?: string | null
          symbol?: string
          volume?: number | null
          week_52_high?: number | null
          week_52_low?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
