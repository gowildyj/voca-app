-- words 테이블에 deck_id 추가 (decks.id FK)
-- 같은 덱 이름 중복·덱 이름 변경 시에도 안전하게 구분하기 위함

-- 1. deck_id 컬럼 추가 (nullable)
ALTER TABLE public.words
  ADD COLUMN IF NOT EXISTS deck_id uuid REFERENCES public.decks(id) ON DELETE CASCADE;

-- 2. 기존 deck(이름) 값으로 deck_id 채우기 (이름이 같은 덱이 여러 개면 그중 하나로 매칭됨)
UPDATE public.words w
SET deck_id = d.id
FROM public.decks d
WHERE w.deck = d.name
  AND w.deck_id IS NULL;

-- 3. 매칭 안 된 단어(이미 삭제된 덱 등) 제거 후 진행
DELETE FROM public.words WHERE deck_id IS NULL;

-- 4. deck 컬럼 제거
ALTER TABLE public.words
  DROP COLUMN IF EXISTS deck;

-- 5. deck_id NOT NULL로 변경
ALTER TABLE public.words
  ALTER COLUMN deck_id SET NOT NULL;

-- 6. (선택) 인덱스로 덱별 조회 속도 개선
CREATE INDEX IF NOT EXISTS words_deck_id_idx ON public.words(deck_id);
