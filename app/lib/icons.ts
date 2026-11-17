// app/lib/icons.ts
// Daftar ikon layanan. iconKey disimpan di database, komponennya dipakai di admin dan situs publik.
import { Briefcase, Building2, Heart, Music, Presentation, Users, type LucideIcon } from 'lucide-react';

export const serviceIcons = {
  briefcase: { label: 'Korporat', Icon: Briefcase },
  heart: { label: 'Pernikahan', Icon: Heart },
  music: { label: 'Konser dan hiburan', Icon: Music },
  presentation: { label: 'Seminar dan konferensi', Icon: Presentation },
  users: { label: 'Gathering dan komunitas', Icon: Users },
  building: { label: 'Peresmian dan pembukaan', Icon: Building2 },
} as const satisfies Record<string, { label: string; Icon: LucideIcon }>;

export type ServiceIconKey = keyof typeof serviceIcons;

export const serviceIconKeys = Object.keys(serviceIcons) as [ServiceIconKey, ...ServiceIconKey[]];

export const serviceIconOptions = serviceIconKeys.map((value) => ({
  value,
  label: serviceIcons[value].label,
}));

export function getServiceIcon(key: string): LucideIcon {
  return (serviceIcons as Record<string, { Icon: LucideIcon }>)[key]?.Icon ?? Briefcase;
}
