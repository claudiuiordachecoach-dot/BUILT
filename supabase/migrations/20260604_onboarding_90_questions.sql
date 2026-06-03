-- Extinde onboarding cu câmpurile noi pentru cele 90 de întrebări
ALTER TABLE onboarding
  -- Cine Ești (câmpuri noi)
  ADD COLUMN IF NOT EXISTS three_words text,
  ADD COLUMN IF NOT EXISTS built_personal_meaning text,
  ADD COLUMN IF NOT EXISTS life_outside_fitness text,
  ADD COLUMN IF NOT EXISTS typical_day_now text,
  ADD COLUMN IF NOT EXISTS proudest_achievement text,
  ADD COLUMN IF NOT EXISTS biggest_personal_weakness text,
  ADD COLUMN IF NOT EXISTS how_people_describe_you text,

  -- Conținutul Tău (câmpuri noi)
  ADD COLUMN IF NOT EXISTS best_hook_ever text,
  ADD COLUMN IF NOT EXISTS favourite_topic text,
  ADD COLUMN IF NOT EXISTS avoided_topic text,
  ADD COLUMN IF NOT EXISTS content_inspiration_source text,
  ADD COLUMN IF NOT EXISTS creator_you_admire text,
  ADD COLUMN IF NOT EXISTS content_creation_process text,
  ADD COLUMN IF NOT EXISTS biggest_content_win text,
  ADD COLUMN IF NOT EXISTS content_goal_next_90_days text,

  -- Clientul Ideal (secțiune nouă)
  ADD COLUMN IF NOT EXISTS client_pain_1 text,
  ADD COLUMN IF NOT EXISTS client_pain_2 text,
  ADD COLUMN IF NOT EXISTS client_pain_3 text,
  ADD COLUMN IF NOT EXISTS client_tried_before text,
  ADD COLUMN IF NOT EXISTS client_objection_1 text,
  ADD COLUMN IF NOT EXISTS client_objection_2 text,
  ADD COLUMN IF NOT EXISTS client_objection_3 text,
  ADD COLUMN IF NOT EXISTS why_client_stays text,
  ADD COLUMN IF NOT EXISTS why_client_quits text,
  ADD COLUMN IF NOT EXISTS client_transformation_story text,
  ADD COLUMN IF NOT EXISTS client_age_range text,
  ADD COLUMN IF NOT EXISTS client_income_level text,
  ADD COLUMN IF NOT EXISTS client_daily_struggle text,
  ADD COLUMN IF NOT EXISTS client_secret_desire text,
  ADD COLUMN IF NOT EXISTS client_before_after text,

  -- Oferta & Vânzare (secțiune nouă)
  ADD COLUMN IF NOT EXISTS offer_30_sec_pitch text,
  ADD COLUMN IF NOT EXISTS why_500_eur text,
  ADD COLUMN IF NOT EXISTS offer_what_included text,
  ADD COLUMN IF NOT EXISTS offer_what_not_included text,
  ADD COLUMN IF NOT EXISTS hardest_part_of_call text,
  ADD COLUMN IF NOT EXISTS price_objection_response text,
  ADD COLUMN IF NOT EXISTS best_dm_opener text,
  ADD COLUMN IF NOT EXISTS qualify_or_disqualify text,
  ADD COLUMN IF NOT EXISTS follow_up_strategy text,
  ADD COLUMN IF NOT EXISTS close_rate_estimate text,
  ADD COLUMN IF NOT EXISTS what_makes_client_say_yes text,
  ADD COLUMN IF NOT EXISTS what_makes_client_say_no text,

  -- Unde Te Blochezi (câmpuri noi)
  ADD COLUMN IF NOT EXISTS biggest_time_waster text,
  ADD COLUMN IF NOT EXISTS task_you_hate text,
  ADD COLUMN IF NOT EXISTS last_major_doubt text,
  ADD COLUMN IF NOT EXISTS recurring_negative_thought text,
  ADD COLUMN IF NOT EXISTS imposter_syndrome_trigger text,
  ADD COLUMN IF NOT EXISTS comparison_trap text,

  -- Mindset & Opinii (câmpuri noi)
  ADD COLUMN IF NOT EXISTS morning_routine text,
  ADD COLUMN IF NOT EXISTS how_handle_failure text,
  ADD COLUMN IF NOT EXISTS motivation_vs_discipline text,
  ADD COLUMN IF NOT EXISTS biggest_mindset_shift text,
  ADD COLUMN IF NOT EXISTS book_that_changed_you text,
  ADD COLUMN IF NOT EXISTS mentor_or_model text,

  -- Viziune & Misiune (secțiune nouă)
  ADD COLUMN IF NOT EXISTS built_in_3_years text,
  ADD COLUMN IF NOT EXISTS impact_on_romanian_fitness text,
  ADD COLUMN IF NOT EXISTS legacy_you_want text,
  ADD COLUMN IF NOT EXISTS if_money_not_issue text,
  ADD COLUMN IF NOT EXISTS why_this_work_matters text,
  ADD COLUMN IF NOT EXISTS world_without_built text,
  ADD COLUMN IF NOT EXISTS values_non_negotiable text,
  ADD COLUMN IF NOT EXISTS what_would_stop_you text,

  -- Povestea Ta (câmpuri noi)
  ADD COLUMN IF NOT EXISTS darkest_moment text,
  ADD COLUMN IF NOT EXISTS turning_point text,
  ADD COLUMN IF NOT EXISTS first_client_story text,
  ADD COLUMN IF NOT EXISTS moment_you_almost_quit text,
  ADD COLUMN IF NOT EXISTS unexpected_lesson text;
