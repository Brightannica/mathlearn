-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_attempts ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Topics and lessons are readable by all authenticated users
CREATE POLICY "Authenticated users can view topics" ON public.topics
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view published lessons" ON public.lessons
  FOR SELECT TO authenticated USING (is_published = true);

CREATE POLICY "Authenticated users can view published exercises" ON public.exercises
  FOR SELECT TO authenticated USING (is_published = true);

-- Users can manage their own progress
CREATE POLICY "Users can view own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Forum posts
CREATE POLICY "Authenticated users can view posts" ON public.forum_posts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create posts" ON public.forum_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.forum_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.forum_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Forum replies
CREATE POLICY "Authenticated users can view replies" ON public.forum_replies
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create replies" ON public.forum_replies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own replies" ON public.forum_replies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own replies" ON public.forum_replies
  FOR DELETE USING (auth.uid() = user_id);

-- Forum votes
CREATE POLICY "Users can view votes" ON public.forum_votes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create votes" ON public.forum_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes" ON public.forum_votes
  FOR UPDATE USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Exercise attempts
CREATE POLICY "Users can view own attempts" ON public.exercise_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create attempts" ON public.exercise_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Favorites
CREATE POLICY "Users can view own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);
