-- Create game saves table for storing player progress
CREATE TABLE IF NOT EXISTS public.game_saves (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  game_type TEXT NOT NULL,
  save_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_type)
);

-- Enable Row Level Security
ALTER TABLE public.game_saves ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to access their own saves
CREATE POLICY "Users can access own saves" ON public.game_saves
  FOR ALL USING (user_id = auth.uid()::text);

-- Create policy for guest users (allow access based on user_id)
CREATE POLICY "Allow guest access" ON public.game_saves
  FOR ALL USING (user_id LIKE 'guest_%');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_game_saves_updated_at
  BEFORE UPDATE ON public.game_saves
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_game_saves_user_id ON public.game_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_game_saves_game_type ON public.game_saves(game_type);
CREATE INDEX IF NOT EXISTS idx_game_saves_updated_at ON public.game_saves(updated_at);

-- Insert example data (optional - can be removed for production)
INSERT INTO public.game_saves (user_id, game_type, save_data) VALUES
('guest_demo', 'pixel-quest', '{
  "level": 1,
  "score": 150,
  "lives": 3,
  "health": 80,
  "inventory": [
    {"id": "coin", "name": "Gold Coin", "type": "coin", "quantity": 5, "description": "Shiny gold coins"}
  ],
  "position": {"x": 100, "y": 300},
  "checkpoints": [{"level": 1, "position": {"x": 100, "y": 300}}],
  "customizations": {"characterName": "Demo Hero", "theme": "classic", "difficulty": "medium"},
  "achievements": [],
  "playtime": 45
}');

-- Grant permissions
GRANT ALL ON public.game_saves TO anon;
GRANT ALL ON public.game_saves TO authenticated;
GRANT ALL ON public.game_saves TO service_role;

-- Grant sequence permissions
GRANT ALL ON SEQUENCE public.game_saves_id_seq TO anon;
GRANT ALL ON SEQUENCE public.game_saves_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.game_saves_id_seq TO service_role;