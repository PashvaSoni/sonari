/** Where Supabase sends users after email confirm / magic link. Must be allow-listed in Auth → URL Configuration. */
export function authEmailRedirectTo(origin: string): string {
  return `${origin.replace(/\/$/, '')}/login`
}
