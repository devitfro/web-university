export interface Group { id: string | number; name: string; }
export interface Contact {
  id: string | number;
  name: string;
  email?: string | null;
  phone?: string | null;
  groupId?: number | string | null;
}
