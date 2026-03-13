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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      custom_assuntos: {
        Row: {
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      custom_orgaos: {
        Row: {
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          created_at: string
          id: string
          pergunta: string
          resposta: string
        }
        Insert: {
          created_at?: string
          id?: string
          pergunta: string
          resposta: string
        }
        Update: {
          created_at?: string
          id?: string
          pergunta?: string
          resposta?: string
        }
        Relationships: []
      }
      operadores: {
        Row: {
          ativo: boolean
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          nivel: string
          nome: string
          senha: string
        }
        Insert: {
          ativo?: boolean
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          nivel?: string
          nome: string
          senha: string
        }
        Update: {
          ativo?: boolean
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          nivel?: string
          nome?: string
          senha?: string
        }
        Relationships: []
      }
      quiz_perguntas: {
        Row: {
          created_at: string
          id: string
          opcoes: Json
          pergunta: string
          resposta_correta: number
          trilha_conteudo_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          opcoes?: Json
          pergunta: string
          resposta_correta?: number
          trilha_conteudo_id: string
        }
        Update: {
          created_at?: string
          id?: string
          opcoes?: Json
          pergunta?: string
          resposta_correta?: number
          trilha_conteudo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_perguntas_trilha_conteudo_id_fkey"
            columns: ["trilha_conteudo_id"]
            isOneToOne: false
            referencedRelation: "trilhas_conteudo"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_resultados: {
        Row: {
          acertos: number
          created_at: string
          email: string
          id: string
          modulo_ordem: number
          nome: string
          pontuacao: number
          total: number
          trilha: string
        }
        Insert: {
          acertos?: number
          created_at?: string
          email: string
          id?: string
          modulo_ordem?: number
          nome: string
          pontuacao?: number
          total?: number
          trilha?: string
        }
        Update: {
          acertos?: number
          created_at?: string
          email?: string
          id?: string
          modulo_ordem?: number
          nome?: string
          pontuacao?: number
          total?: number
          trilha?: string
        }
        Relationships: []
      }
      solicitacoes: {
        Row: {
          assunto: string
          avaliacao: Json | null
          canal: string
          categoria: string
          created_at: string
          data: string
          data_resposta: string | null
          descricao: string
          email: string
          id: string
          impacto: string
          nome: string
          prioridade: string
          protocolo: string
          responsavel: string | null
          resposta: string | null
          secretaria: string
          setor: string
          sla_limite: string
          status: string
          tipo: string
        }
        Insert: {
          assunto: string
          avaliacao?: Json | null
          canal?: string
          categoria: string
          created_at?: string
          data?: string
          data_resposta?: string | null
          descricao: string
          email: string
          id?: string
          impacto: string
          nome: string
          prioridade?: string
          protocolo: string
          responsavel?: string | null
          resposta?: string | null
          secretaria: string
          setor: string
          sla_limite: string
          status?: string
          tipo: string
        }
        Update: {
          assunto?: string
          avaliacao?: Json | null
          canal?: string
          categoria?: string
          created_at?: string
          data?: string
          data_resposta?: string | null
          descricao?: string
          email?: string
          id?: string
          impacto?: string
          nome?: string
          prioridade?: string
          protocolo?: string
          responsavel?: string | null
          resposta?: string | null
          secretaria?: string
          setor?: string
          sla_limite?: string
          status?: string
          tipo?: string
        }
        Relationships: []
      }
      trilha_progresso: {
        Row: {
          concluido: boolean
          concluido_em: string | null
          created_at: string
          email: string
          etapas_concluidas: Json
          id: string
          medalhas: Json
          nivel: string
          nome: string
          pontuacao: number
          tempo_minutos: number
        }
        Insert: {
          concluido?: boolean
          concluido_em?: string | null
          created_at?: string
          email: string
          etapas_concluidas?: Json
          id?: string
          medalhas?: Json
          nivel?: string
          nome: string
          pontuacao?: number
          tempo_minutos?: number
        }
        Update: {
          concluido?: boolean
          concluido_em?: string | null
          created_at?: string
          email?: string
          etapas_concluidas?: Json
          id?: string
          medalhas?: Json
          nivel?: string
          nome?: string
          pontuacao?: number
          tempo_minutos?: number
        }
        Relationships: []
      }
      trilhas_conteudo: {
        Row: {
          checklist: Json
          conteudo: string
          created_at: string
          id: string
          modulo_ordem: number
          pontos: number
          subtitulo: string
          titulo: string
          trilha: string
        }
        Insert: {
          checklist?: Json
          conteudo?: string
          created_at?: string
          id?: string
          modulo_ordem?: number
          pontos?: number
          subtitulo?: string
          titulo: string
          trilha?: string
        }
        Update: {
          checklist?: Json
          conteudo?: string
          created_at?: string
          id?: string
          modulo_ordem?: number
          pontos?: number
          subtitulo?: string
          titulo?: string
          trilha?: string
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
