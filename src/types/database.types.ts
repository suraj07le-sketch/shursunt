
import { Prediction, Coin } from './index';

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            predictions: {
                Row: Prediction
                Insert: Omit<Prediction, 'id' | 'created_at'> & { id?: string, created_at?: string }
                Update: Partial<Omit<Prediction, 'id' | 'created_at'>>
                Relationships: []
            }
            indian_stocks: {
                Row: Coin
                Insert: Omit<Coin, 'id'> & { id?: string }
                Update: Partial<Omit<Coin, 'id'>>
                Relationships: []
            }
            crypto_coins: {
                Row: Coin
                Insert: Omit<Coin, 'id'> & { id?: string }
                Update: Partial<Omit<Coin, 'id'>>
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
