create table if not exists onboarding (
  id integer primary key default 1,
  full_name text, age text, location text, experience_years text,
  coaching_since text, instagram_handle text, current_monthly_revenue text,
  revenue_goal_90_days text, revenue_goal_12_months text, followers_now text,
  followers_goal_90_days text, niche text, transformation_promise text,
  content_formats text, posting_frequency text, best_performing_content text,
  content_topics text, tone_of_voice text, content_that_failed text,
  biggest_challenge text, what_tried text, bottleneck text,
  fear_about_content text, why_not_growing text, biggest_frustration text,
  ideal_outcome_90_days text, ideal_client text, dream_day text,
  income_goal_why text, what_success_looks_like text,
  philosophy text, differentiator text, things_disagree_with text, controversial_take text,
  origin_story text, biggest_transformation text, credibility text,
  defining_moment text, failure_story text, why_this_niche text,
  ai_niche_summary text, ai_ideal_client_summary text,
  updated_at timestamptz default now()
);
