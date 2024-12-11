export interface Inotification {
  title: string;
  body: string;
  event: string; // vacation, task, etc.
  target_id: string;
  source_id: string;
  provider_id: string;
  context: string; // user, settings
}
