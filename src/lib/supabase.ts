import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kpsfhtsljnjigsrmpoay.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwc2ZodHNsam5qaWdzcm1wb2F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMDUwODEsImV4cCI6MjA2NzU4MTA4MX0.j4jaLB5VZqel-_sFM5UoNr8yMaiSi74d-chZkZBVobY';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
});

export interface Registro {
  id: string;
  socio: string;
  fecha: string;
  entradas: number;
  salidas: number;
  saldo: number;
  kg_totales: number;
  vr_kilo: number;
  fletes: number;
  comision: number;
  valor_animal: number;
  total: number;
  created_at?: string;
  updated_at?: string;
}

export interface SalidaDetalle {
  id: string;
  registro_id: string;
  socio: string;
  fecha: string;
  cantidad: number;
  causa: 'ventas';
  created_at?: string;
}

export interface Venta {
  id: string;
  registro_id: string;
  socio: string;
  fecha: string;
  valor_kilo_venta: number;
  total_kilos: number;
  valor_venta: number;
  observaciones: string;
  total_venta: number;
  created_at?: string;
}

export type CausaSalida = 'ventas';

export const causaSalidaLabels: Record<CausaSalida, string> = {
  ventas: 'Ventas'
};