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
      admin_alert_settings: {
        Row: {
          alert_on_failure: boolean
          alert_on_new_device: boolean
          alert_on_success: boolean
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          alert_on_failure?: boolean
          alert_on_new_device?: boolean
          alert_on_success?: boolean
          email?: string
          id?: string
          updated_at?: string
        }
        Update: {
          alert_on_failure?: boolean
          alert_on_new_device?: boolean
          alert_on_success?: boolean
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      admin_devices: {
        Row: {
          created_at: string
          fingerprint: string
          id: string
          label: string
          last_seen_at: string
          trusted: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          fingerprint?: string
          id?: string
          label?: string
          last_seen_at?: string
          trusted?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          fingerprint?: string
          id?: string
          label?: string
          last_seen_at?: string
          trusted?: boolean
          updated_at?: string
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
      admin_login_history: {
        Row: {
          browser: string
          created_at: string
          device: string
          id: string
          identifier: string
          ip: string
          location_label: string
          os: string
          outcome: string
        }
        Insert: {
          browser?: string
          created_at?: string
          device?: string
          id?: string
          identifier?: string
          ip?: string
          location_label?: string
          os?: string
          outcome?: string
        }
        Update: {
          browser?: string
          created_at?: string
          device?: string
          id?: string
          identifier?: string
          ip?: string
          location_label?: string
          os?: string
          outcome?: string
        }
        Relationships: []
      }
      admin_passkeys: {
        Row: {
          algorithm: number
          created_at: string
          credential_id: string
          id: string
          label: string
          last_used_at: string | null
          public_key: string
          sign_count: number
          updated_at: string
        }
        Insert: {
          algorithm?: number
          created_at?: string
          credential_id: string
          id?: string
          label?: string
          last_used_at?: string | null
          public_key: string
          sign_count?: number
          updated_at?: string
        }
        Update: {
          algorithm?: number
          created_at?: string
          credential_id?: string
          id?: string
          label?: string
          last_used_at?: string | null
          public_key?: string
          sign_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      admin_totp: {
        Row: {
          confirmed_at: string | null
          created_at: string
          enabled: boolean
          id: string
          recovery_codes: string[]
          secret: string
          updated_at: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          recovery_codes?: string[]
          secret?: string
          updated_at?: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          recovery_codes?: string[]
          secret?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_site_builds: {
        Row: {
          created_at: string
          html: string
          id: string
          model: string
          name: string
          notes: string
          prompt: string
          published: boolean
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          html?: string
          id?: string
          model?: string
          name?: string
          notes?: string
          prompt?: string
          published?: boolean
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          html?: string
          id?: string
          model?: string
          name?: string
          notes?: string
          prompt?: string
          published?: boolean
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      booking_reminders: {
        Row: {
          body: string
          booking_id: string | null
          channel: string
          created_at: string
          id: string
          kind: string
          send_at: string
          sent_at: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          body?: string
          booking_id?: string | null
          channel?: string
          created_at?: string
          id?: string
          kind?: string
          send_at?: string
          sent_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Update: {
          body?: string
          booking_id?: string | null
          channel?: string
          created_at?: string
          id?: string
          kind?: string
          send_at?: string
          sent_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_reminders_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          notes: string
          scheduled_for: string | null
          session_type: string
          status: string
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string
          scheduled_for?: string | null
          session_type?: string
          status?: string
          updated_at?: string
          value?: number
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string
          scheduled_for?: string | null
          session_type?: string
          status?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      business_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          id: string
          label: string
          notes: string
          spent_on: string
          updated_at: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          id?: string
          label?: string
          notes?: string
          spent_on?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          id?: string
          label?: string
          notes?: string
          spent_on?: string
          updated_at?: string
        }
        Relationships: []
      }
      business_goals: {
        Row: {
          category: string
          created_at: string
          current_value: number
          due_on: string | null
          id: string
          notes: string
          status: string
          target_value: number
          title: string
          unit: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          current_value?: number
          due_on?: string | null
          id?: string
          notes?: string
          status?: string
          target_value?: number
          title?: string
          unit?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          current_value?: number
          due_on?: string | null
          id?: string
          notes?: string
          status?: string
          target_value?: number
          title?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_projects: {
        Row: {
          api_docs: string
          archived: boolean
          budget: string
          client_id: string | null
          completed_hours: number
          created_at: string
          deadline: string | null
          deployment_notes: string
          design_assets: Json
          estimated_hours: number
          id: string
          live_url: string
          meeting_notes: string
          milestones: Json
          name: string
          progress: number
          repo_url: string
          requirements: string
          state: string
          summary: string
          tasks: Json
          updated_at: string
        }
        Insert: {
          api_docs?: string
          archived?: boolean
          budget?: string
          client_id?: string | null
          completed_hours?: number
          created_at?: string
          deadline?: string | null
          deployment_notes?: string
          design_assets?: Json
          estimated_hours?: number
          id?: string
          live_url?: string
          meeting_notes?: string
          milestones?: Json
          name: string
          progress?: number
          repo_url?: string
          requirements?: string
          state?: string
          summary?: string
          tasks?: Json
          updated_at?: string
        }
        Update: {
          api_docs?: string
          archived?: boolean
          budget?: string
          client_id?: string | null
          completed_hours?: number
          created_at?: string
          deadline?: string | null
          deployment_notes?: string
          design_assets?: Json
          estimated_hours?: number
          id?: string
          live_url?: string
          meeting_notes?: string
          milestones?: Json
          name?: string
          progress?: number
          repo_url?: string
          requirements?: string
          state?: string
          summary?: string
          tasks?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string
          archived: boolean
          billing_info: string
          communication_log: string
          company: string
          contract_notes: string
          created_at: string
          documents: Json
          email: string
          feedback: string
          follow_up_at: string | null
          id: string
          name: string
          phone: string
          priority: string
          project_notes: string
          reminder: string
          status: string
          updated_at: string
          website: string
        }
        Insert: {
          address?: string
          archived?: boolean
          billing_info?: string
          communication_log?: string
          company?: string
          contract_notes?: string
          created_at?: string
          documents?: Json
          email?: string
          feedback?: string
          follow_up_at?: string | null
          id?: string
          name: string
          phone?: string
          priority?: string
          project_notes?: string
          reminder?: string
          status?: string
          updated_at?: string
          website?: string
        }
        Update: {
          address?: string
          archived?: boolean
          billing_info?: string
          communication_log?: string
          company?: string
          contract_notes?: string
          created_at?: string
          documents?: Json
          email?: string
          feedback?: string
          follow_up_at?: string | null
          id?: string
          name?: string
          phone?: string
          priority?: string
          project_notes?: string
          reminder?: string
          status?: string
          updated_at?: string
          website?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          client_id: string | null
          client_name: string
          created_at: string
          ends_on: string | null
          id: string
          signature_data: string
          signed_at: string | null
          signed_ip: string
          signer_email: string
          signer_name: string
          starts_on: string | null
          status: string
          terms: string
          title: string
          updated_at: string
          value: number
        }
        Insert: {
          client_id?: string | null
          client_name?: string
          created_at?: string
          ends_on?: string | null
          id?: string
          signature_data?: string
          signed_at?: string | null
          signed_ip?: string
          signer_email?: string
          signer_name?: string
          starts_on?: string | null
          status?: string
          terms?: string
          title?: string
          updated_at?: string
          value?: number
        }
        Update: {
          client_id?: string | null
          client_name?: string
          created_at?: string
          ends_on?: string | null
          id?: string
          signature_data?: string
          signed_at?: string | null
          signed_ip?: string
          signer_email?: string
          signer_name?: string
          starts_on?: string | null
          status?: string
          terms?: string
          title?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
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
      invoices: {
        Row: {
          amount: number
          client_id: string | null
          client_name: string
          created_at: string
          due_on: string | null
          id: string
          issued_on: string | null
          notes: string
          number: string
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          client_id?: string | null
          client_name?: string
          created_at?: string
          due_on?: string | null
          id?: string
          issued_on?: string | null
          notes?: string
          number?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          client_name?: string
          created_at?: string
          due_on?: string | null
          id?: string
          issued_on?: string | null
          notes?: string
          number?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_items: {
        Row: {
          body: string
          created_at: string
          favorite: boolean
          id: string
          kind: string
          tags: string[]
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          body?: string
          created_at?: string
          favorite?: boolean
          id?: string
          kind?: string
          tags?: string[]
          title: string
          updated_at?: string
          url?: string
        }
        Update: {
          body?: string
          created_at?: string
          favorite?: boolean
          id?: string
          kind?: string
          tags?: string[]
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          budget: string | null
          company: string | null
          created_at: string
          cv_link_sent: boolean
          email: string
          id: string
          message: string | null
          name: string | null
          notes: string | null
          services: string[]
          source: string
          welcome_email_status: string
        }
        Insert: {
          budget?: string | null
          company?: string | null
          created_at?: string
          cv_link_sent?: boolean
          email: string
          id?: string
          message?: string | null
          name?: string | null
          notes?: string | null
          services?: string[]
          source?: string
          welcome_email_status?: string
        }
        Update: {
          budget?: string | null
          company?: string | null
          created_at?: string
          cv_link_sent?: boolean
          email?: string
          id?: string
          message?: string | null
          name?: string | null
          notes?: string | null
          services?: string[]
          source?: string
          welcome_email_status?: string
        }
        Relationships: []
      }
      login_alerts: {
        Row: {
          acknowledged: boolean
          created_at: string
          detail: string
          event: string
          id: string
          identifier: string
          severity: string
        }
        Insert: {
          acknowledged?: boolean
          created_at?: string
          detail?: string
          event: string
          id?: string
          identifier?: string
          severity?: string
        }
        Update: {
          acknowledged?: boolean
          created_at?: string
          detail?: string
          event?: string
          id?: string
          identifier?: string
          severity?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          created_at: string
          currency: string
          customer_email: string
          customer_name: string
          id: string
          notes: string
          product_name: string
          product_type: string
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string
          id?: string
          notes?: string
          product_name?: string
          product_type?: string
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string
          id?: string
          notes?: string
          product_name?: string
          product_type?: string
          source?: string
          status?: string
          updated_at?: string
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
      product_bundles: {
        Row: {
          active: boolean
          created_at: string
          currency: string
          discount_label: string
          id: string
          image_url: string
          name: string
          price: number
          product_slugs: string[]
          slug: string
          summary: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          currency?: string
          discount_label?: string
          id?: string
          image_url?: string
          name: string
          price?: number
          product_slugs?: string[]
          slug: string
          summary?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          currency?: string
          discount_label?: string
          id?: string
          image_url?: string
          name?: string
          price?: number
          product_slugs?: string[]
          slug?: string
          summary?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_downloads: {
        Row: {
          country: string
          created_at: string
          id: string
          product_name: string
          product_type: string
          referrer: string
          session_id: string
        }
        Insert: {
          country?: string
          created_at?: string
          id?: string
          product_name?: string
          product_type?: string
          referrer?: string
          session_id?: string
        }
        Update: {
          country?: string
          created_at?: string
          id?: string
          product_name?: string
          product_type?: string
          referrer?: string
          session_id?: string
        }
        Relationships: []
      }
      product_licenses: {
        Row: {
          activations: number
          created_at: string
          customer_email: string
          customer_name: string
          expires_on: string | null
          id: string
          license_key: string
          max_activations: number
          notes: string
          product_slug: string
          status: string
          updated_at: string
        }
        Insert: {
          activations?: number
          created_at?: string
          customer_email?: string
          customer_name?: string
          expires_on?: string | null
          id?: string
          license_key: string
          max_activations?: number
          notes?: string
          product_slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          activations?: number
          created_at?: string
          customer_email?: string
          customer_name?: string
          expires_on?: string | null
          id?: string
          license_key?: string
          max_activations?: number
          notes?: string
          product_slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          approved: boolean
          author_email: string
          author_name: string
          body: string
          created_at: string
          id: string
          product_slug: string
          rating: number
          updated_at: string
        }
        Insert: {
          approved?: boolean
          author_email?: string
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          product_slug: string
          rating?: number
          updated_at?: string
        }
        Update: {
          approved?: boolean
          author_email?: string
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          product_slug?: string
          rating?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          category: string
          changelog: string
          created_at: string
          currency: string
          description: string
          downloads_count: number
          featured: boolean
          file_url: string
          id: string
          image_url: string
          name: string
          price: number
          slug: string
          summary: string
          tags: string[]
          updated_at: string
          version: string
        }
        Insert: {
          active?: boolean
          category?: string
          changelog?: string
          created_at?: string
          currency?: string
          description?: string
          downloads_count?: number
          featured?: boolean
          file_url?: string
          id?: string
          image_url?: string
          name: string
          price?: number
          slug: string
          summary?: string
          tags?: string[]
          updated_at?: string
          version?: string
        }
        Update: {
          active?: boolean
          category?: string
          changelog?: string
          created_at?: string
          currency?: string
          description?: string
          downloads_count?: number
          featured?: boolean
          file_url?: string
          id?: string
          image_url?: string
          name?: string
          price?: number
          slug?: string
          summary?: string
          tags?: string[]
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          client_email: string
          client_name: string
          created_at: string
          currency: string
          deliverables: string
          id: string
          notes: string
          price: number
          scope: Json
          status: string
          summary: string
          timeline: string
          title: string
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          client_email?: string
          client_name?: string
          created_at?: string
          currency?: string
          deliverables?: string
          id?: string
          notes?: string
          price?: number
          scope?: Json
          status?: string
          summary?: string
          timeline?: string
          title?: string
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          client_email?: string
          client_name?: string
          created_at?: string
          currency?: string
          deliverables?: string
          id?: string
          notes?: string
          price?: number
          scope?: Json
          status?: string
          summary?: string
          timeline?: string
          title?: string
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      security_findings: {
        Row: {
          category: string
          created_at: string
          id: string
          remediation: string
          severity: string
          source: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          remediation?: string
          severity?: string
          source?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          remediation?: string
          severity?: string
          source?: string
          status?: string
          title?: string
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
      site_visits: {
        Row: {
          browser: string
          city: string
          country: string
          created_at: string
          device: string
          duration_seconds: number
          id: string
          ip: string
          is_bounce: boolean
          is_returning: boolean
          language: string
          os: string
          path: string
          referrer: string
          region: string
          screen: string
          session_id: string
          timezone: string
          user_agent: string
        }
        Insert: {
          browser?: string
          city?: string
          country?: string
          created_at?: string
          device?: string
          duration_seconds?: number
          id?: string
          ip?: string
          is_bounce?: boolean
          is_returning?: boolean
          language?: string
          os?: string
          path?: string
          referrer?: string
          region?: string
          screen?: string
          session_id?: string
          timezone?: string
          user_agent?: string
        }
        Update: {
          browser?: string
          city?: string
          country?: string
          created_at?: string
          device?: string
          duration_seconds?: number
          id?: string
          ip?: string
          is_bounce?: boolean
          is_returning?: boolean
          language?: string
          os?: string
          path?: string
          referrer?: string
          region?: string
          screen?: string
          session_id?: string
          timezone?: string
          user_agent?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          notes: string
          permissions: string[]
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string
          permissions?: string[]
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string
          permissions?: string[]
          role?: string
          status?: string
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
      wishlist_items: {
        Row: {
          created_at: string
          id: string
          product_slug: string
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_slug: string
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_slug?: string
          session_id?: string
        }
        Relationships: []
      }
      workspace_tools: {
        Row: {
          category: string
          created_at: string
          favorite: boolean
          icon: string
          id: string
          last_opened_at: string | null
          name: string
          notes: string
          open_count: number
          pinned: boolean
          updated_at: string
          url: string
        }
        Insert: {
          category?: string
          created_at?: string
          favorite?: boolean
          icon?: string
          id?: string
          last_opened_at?: string | null
          name: string
          notes?: string
          open_count?: number
          pinned?: boolean
          updated_at?: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          favorite?: boolean
          icon?: string
          id?: string
          last_opened_at?: string | null
          name?: string
          notes?: string
          open_count?: number
          pinned?: boolean
          updated_at?: string
          url?: string
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
