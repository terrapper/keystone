-- Keystone Journey & Coaching Seed Data
-- Run via Supabase REST API or directly against the database

-- ============================================================
-- JOURNEYS
-- ============================================================

-- 1. Build a Morning Routine (7 days)
INSERT INTO journeys (id, title, description, category, duration_days, content_json, source)
VALUES (
  'a1b2c3d4-1111-4000-8000-000000000001',
  'Build a Morning Routine',
  'Start with one small habit and add a new one each day. By the end of the week, you''ll have a personalized morning routine built on the science of habit stacking.',
  'habits',
  7,
  '[
    {
      "day": 1,
      "title": "Your First Keystone",
      "coaching_text": "Here''s the truth about morning routines: most people try to overhaul their entire morning on Day 1. They set 6 alarms, plan a workout, meditation, journaling, and a green smoothie. By Wednesday, they''re hitting snooze.\n\nWe''re doing the opposite. Today, you pick ONE thing. Just one. The smaller, the better.\n\nThis is based on a concept called habit stacking, from behavioral researcher BJ Fogg. The idea is simple: attach a new behavior to something you already do. You already wake up. You already get out of bed. You already brush your teeth. So your first habit gets anchored to one of those existing moments.\n\nFor example: \"After I turn off my alarm, I will drink a glass of water.\" That''s it. One action, one anchor.\n\nThe goal today isn''t transformation. It''s proving to yourself that you can add one small thing and actually do it.",
      "action": "Choose one small habit and anchor it to something you already do each morning. Write it as: \"After I [existing habit], I will [new habit].\" Then do it tomorrow morning.",
      "reflection_prompt": "What habit did you choose, and why does it feel manageable?"
    },
    {
      "day": 2,
      "title": "The Power of Sequence",
      "coaching_text": "You did it. One habit, one morning. That might not sound like much, but you just did something most people never do — you started small enough to actually follow through.\n\nToday we add a second habit. But here''s the key: it goes right after the first one. Not at a random time. Not \"sometime this morning.\" Immediately after.\n\nThis is the stacking part. Each habit becomes the trigger for the next one. Drink water → stretch for 60 seconds. Brush teeth → write one gratitude. The sequence creates momentum. Your brain starts to anticipate the chain.\n\nNeuroscientifically, what''s happening is that your basal ganglia — the part of your brain that automates behaviors — is starting to chunk these actions together. The more consistent the sequence, the less willpower each step requires.\n\nKeep both habits small. We''re building the chain, not the weight.",
      "action": "Add a second habit immediately after your first one. Write your updated stack: \"After I [habit 1], I will [habit 2].\" Do both tomorrow morning.",
      "reflection_prompt": "How did it feel to complete your first habit today? Was there any resistance?"
    },
    {
      "day": 3,
      "title": "Friction Is the Enemy",
      "coaching_text": "Two habits in a row. You''re building something real.\n\nToday, before we add a third habit, let''s talk about friction. Friction is anything that makes a habit harder to start. It''s the yoga mat in the closet instead of unrolled on the floor. It''s the journal in a drawer instead of on the nightstand. It''s the water glass in the cabinet instead of filled and waiting.\n\nBJ Fogg calls this \"designing for laziness.\" The easier you make the right behavior, the more likely you''ll do it — especially on days when motivation is low.\n\nSo today''s task has two parts: add your third habit AND reduce the friction for all three. Set up your environment tonight so tomorrow morning requires zero decisions.\n\nThis is why environment design matters more than motivation. Motivation fluctuates. Your nightstand doesn''t.",
      "action": "Add a third habit to your stack. Then prepare your environment tonight: lay out everything you need so each habit is effortless to start.",
      "reflection_prompt": "What friction did you notice in your current routine? What did you change?"
    },
    {
      "day": 4,
      "title": "The Two-Minute Rule",
      "coaching_text": "You have a three-habit chain now. Today we''re going to apply a powerful filter before adding the fourth.\n\nJames Clear''s Two-Minute Rule says: when you''re building a new habit, scale it down until it takes two minutes or less. \"Read before bed\" becomes \"read one page.\" \"Meditate\" becomes \"sit and take three breaths.\" \"Exercise\" becomes \"put on your running shoes.\"\n\nThe point isn''t that two minutes is enough. The point is that showing up matters more than performance. You''re not optimizing your routine yet — you''re building the identity of someone who does a morning routine. Every time you show up, even for two minutes, that identity gets stronger.\n\nSo when you add your fourth habit today, make it laughably small. If it feels too easy, you''ve got it right.",
      "action": "Add a fourth habit to your stack, scaled down to two minutes or less. Run through all four tomorrow morning.",
      "reflection_prompt": "Which habit in your stack feels most natural? Which one still requires effort?"
    },
    {
      "day": 5,
      "title": "Expect the Miss",
      "coaching_text": "Five days in. Let''s talk about what happens when you miss a day.\n\nBecause you will. Everyone does. The question isn''t whether you''ll miss — it''s what you do after.\n\nResearch from University College London shows that missing a single day has no measurable impact on habit formation. The danger is the \"what-the-hell effect\" — where one miss turns into two, then three, then you''ve quietly abandoned the whole thing.\n\nThe antidote is simple: never miss twice. One miss is human. Two misses is the start of a new pattern. So if you miss tomorrow morning, your only job is to show up the next day. Not perfectly. Not with all five habits. Just show up with one.\n\nToday, add your fifth habit. But also make a plan for your next miss. What''s your \"minimum viable morning\"? Maybe it''s just one habit and a glass of water. Define it now, so future-you doesn''t have to make that decision in a low-motivation moment.",
      "action": "Add a fifth habit to your stack. Then write down your \"minimum viable morning\" — the smallest version of your routine you can do on a hard day.",
      "reflection_prompt": "Have you missed a day yet? If so, how did you handle it? If not, what would your minimum viable morning look like?"
    },
    {
      "day": 6,
      "title": "Feel the Chain",
      "coaching_text": "Six days. Five habits. You''re no longer experimenting — you''re practicing.\n\nToday, instead of adding a new habit, we''re going to refine the chain. Run through your full stack and pay attention to the transitions. Where does the flow feel smooth? Where does it stall? Is there a moment where you have to think about what comes next?\n\nThe goal is to make your routine feel like one continuous motion, not five separate decisions. Each habit should flow into the next with minimal cognitive load. If something feels out of order, move it. If a habit doesn''t fit, swap it.\n\nThis is also a good day to time yourself. How long does your full routine take? Most people overestimate. A five-habit stack often takes 10-15 minutes. That''s it. That''s your morning.\n\nOptionally, add a sixth habit if you have room. But only if the chain feels solid first.",
      "action": "Run your full routine and time it. Reorder any habits that feel out of place. Optionally add a sixth habit if the chain is flowing well.",
      "reflection_prompt": "How long did your routine take? Were there any surprises?"
    },
    {
      "day": 7,
      "title": "This Is Yours Now",
      "coaching_text": "Seven mornings. You built a morning routine from nothing.\n\nLet''s be honest about what you actually did. You didn''t follow a guru''s 5AM protocol. You didn''t buy a course. You started with one small thing and added to it, one day at a time. That''s habit stacking in practice.\n\nHere''s what the research says happens next: it takes an average of 66 days for a behavior to become automatic (not 21 — that''s a myth). You''re at Day 7. The routine isn''t automatic yet, and that''s fine. What you''ve built is the scaffolding. The structure is in place. Now you just keep showing up.\n\nYour job going forward is simple: do your routine every morning. When you miss, do your minimum viable morning. When it feels stale, swap a habit. The stack is yours to evolve.\n\nYou showed up for seven days. That''s not nothing. That''s everything.",
      "action": "Do your full routine one final time as a journey participant. Then decide: keep it as your daily Morning Keystone, or adjust it.",
      "reflection_prompt": "What did you learn about yourself this week? What habit surprised you the most?"
    }
  ]'::jsonb,
  'curated'
);

-- 2. Deep Focus (14 days)
INSERT INTO journeys (id, title, description, category, duration_days, content_json, source)
VALUES (
  'a1b2c3d4-2222-4000-8000-000000000002',
  'Deep Focus',
  'Train your brain for sustained attention. Based on Cal Newport''s deep work principles and flow state research, this 14-day program progressively builds your capacity for distraction-free focus.',
  'focus',
  14,
  '[
    {
      "day": 1,
      "title": "The Attention Crisis",
      "coaching_text": "The average knowledge worker checks email every 6 minutes. Switches tasks every 3 minutes. Gets interrupted or self-interrupts every 40 seconds when working on a computer.\n\nThis isn''t a personal failing. It''s an environment designed to fragment your attention. Notifications, open offices, Slack channels, infinite scroll — every one of these is an attention extraction machine.\n\nCal Newport defines deep work as \"professional activities performed in a state of distraction-free concentration that push your cognitive capabilities to their limit.\" It''s the opposite of what most of us do all day.\n\nHere''s the uncomfortable truth: deep work is a skill, not a personality trait. You don''t \"have\" focus or \"lack\" focus. You train it, like a muscle. And right now, most of us have let that muscle atrophy.\n\nToday, we''re establishing your baseline. You''re going to attempt 15 minutes of focused, uninterrupted work. No phone. No notifications. Just you and one task. Notice what happens. Notice when the urge to check something hits. Notice how it feels.\n\nFifteen minutes. That''s all.",
      "action": "Set a timer for 15 minutes. Pick one task. Put your phone in another room. Work without switching until the timer ends. Note how many times you felt the urge to check something.",
      "reflection_prompt": "How many times did you feel the urge to switch? What triggered it?"
    },
    {
      "day": 2,
      "title": "The Switching Cost",
      "coaching_text": "Yesterday you did 15 minutes. Today, same thing — but with one new piece of knowledge.\n\nResearcher Gloria Mark found that after an interruption, it takes an average of 23 minutes and 15 seconds to fully return to the original task. Not to start working on it again — but to reach the same depth of cognitive engagement.\n\nThat means every \"quick check\" of your phone costs you 23 minutes of depth, even if the check itself takes 10 seconds.\n\nThis is called attention residue. When you switch from Task A to Task B, part of your attention stays on Task A. Your brain is still processing it in the background. The more you switch, the more residue accumulates, and the shallower your work becomes.\n\nSo today, do your 15 minutes again. But this time, when the urge to switch comes — and it will — name it out loud: \"That''s a switch impulse.\" Don''t fight it. Just notice it and return to your work. The urge passes in about 10 seconds.\n\nYou''re not building discipline. You''re building awareness.",
      "action": "Another 15-minute focus session. When you feel the urge to check something, say \"switch impulse\" quietly and return to your task. Count the impulses.",
      "reflection_prompt": "Did naming the impulse change how you responded to it?"
    },
    {
      "day": 3,
      "title": "Design Your Cave",
      "coaching_text": "Two days of 15 minutes. Now let''s set up your environment.\n\nEvery deep worker in history had a space. Virginia Woolf called it \"a room of one''s own.\" Cal Newport calls it a \"deep work ritual.\" The principle is the same: your environment should signal to your brain that it''s time to focus.\n\nThis doesn''t require a home office or a cabin in the woods. It requires intentional cues. A specific spot at your desk. A pair of headphones that you only use for focus work. A browser with all tabs closed. A phone face-down in a drawer.\n\nThe power of a ritual isn''t mystical — it''s neurological. Consistent environmental cues create a conditioned response. Over time, sitting in your focus spot with your headphones on will automatically shift your brain into a more focused state.\n\nToday, design your focus ritual. Choose your spot, your signals, and your rules. Then do a 20-minute session in that environment. Five more minutes than yesterday.",
      "action": "Define your focus ritual: specific location, environmental cues (headphones, app blockers, phone location), start signal. Then do a 20-minute focus session using it.",
      "reflection_prompt": "What did you include in your ritual? Did the environment change how the session felt?"
    },
    {
      "day": 4,
      "title": "The Lead Measure",
      "coaching_text": "You''re three sessions in. Time to start tracking.\n\nIn \"The 4 Disciplines of Execution,\" there''s a distinction between lead measures and lag measures. Lag measures are outcomes — the report you finished, the project you shipped. They''re important, but they happen after the work. Lead measures are the behaviors that drive outcomes. For deep work, the lead measure is simple: hours of deep work per day.\n\nNot hours worked. Not hours at your desk. Hours of genuine, deep, focused work.\n\nMost people are shocked when they start tracking this number. Even busy professionals often find they do less than 1 hour of true deep work per day. The rest is email, meetings, chat, and shallow tasks that feel productive but don''t push meaningful work forward.\n\nToday, do your 20-minute session. But also, start a simple tally: how many total minutes of deep work did you do today? Not just in your formal session — any block where you were genuinely focused counts.\n\nThe number will be small. That''s fine. Now you know where you''re starting.",
      "action": "Complete a 20-minute focus session. Then track your total deep work minutes for the rest of the day. Keep a simple tally on paper or in a note.",
      "reflection_prompt": "How many total minutes of deep work did you log today? Does the number surprise you?"
    },
    {
      "day": 5,
      "title": "The Pomodoro Foundation",
      "coaching_text": "Let''s give you a structure that scales.\n\nThe Pomodoro Technique was developed by Francesco Cirillo in the late 1980s. It''s simple: 25 minutes of focused work, followed by a 5-minute break. After four rounds, take a longer break (15-30 minutes).\n\nThe genius of Pomodoro isn''t the timing — it''s the commitment contract. When you start a Pomodoro, you''re making a deal with yourself: for the next 25 minutes, I do nothing but this task. If a distraction comes to mind, you write it on a piece of paper and return to work. The distraction gets handled in the break.\n\nToday, try your first full Pomodoro: 25 minutes on, 5 minutes off. During the break, actually rest. Stand up. Look out a window. Don''t check your phone — that''s not rest, that''s a different kind of stimulation.\n\nWe just leveled up from 20 to 25 minutes. If that feels hard, good. Growth lives at the edge of your current capacity.",
      "action": "Complete one full Pomodoro: 25 minutes focused work + 5 minutes genuine rest (no screens). Keep a distraction list — write down anything that pops into your head during the session.",
      "reflection_prompt": "How many items ended up on your distraction list? Did any of them actually need immediate attention?"
    },
    {
      "day": 6,
      "title": "Productive Meditation",
      "coaching_text": "Today, we''re going to take focus off the screen.\n\nCal Newport recommends a practice called productive meditation: take a period where you''re physically occupied but mentally free — walking, driving, showering — and focus your attention on a single well-defined problem.\n\nThis is harder than it sounds. Your mind will wander. It will try to loop on the easy parts of the problem or jump to something more interesting. Your job is to notice the wandering and gently return to the problem.\n\nThis practice does two things: it trains your attention muscle in a different context, and it helps you make progress on important thinking work during time you''d otherwise lose to podcasts or daydreams.\n\nThe key is having a specific question before you start. Not \"think about the project\" but \"What are the three main risks in this plan, and what would I do about each one?\"\n\nToday: do your regular 25-minute Pomodoro. Then, during a walk or commute, try 10 minutes of productive meditation on a specific problem.",
      "action": "Complete a 25-minute Pomodoro. Then take a walk or commute and spend 10 minutes thinking about one specific question without reaching for your phone.",
      "reflection_prompt": "What was your question for productive meditation? Did you make any progress on it?"
    },
    {
      "day": 7,
      "title": "Midpoint: Double Pomodoro",
      "coaching_text": "One week in. You''ve gone from 15 minutes to 25. Today, we''re going to 50.\n\nTwo back-to-back Pomodoros with a 5-minute break between them. Fifty minutes of deep work in a single session.\n\nThis is where things get interesting. Around the 30-minute mark, you may hit what psychologist Mihaly Csikszentmihalyi calls the \"flow channel\" — that state where you''re fully absorbed, time distorts, and the work feels almost effortless. Flow doesn''t happen in 15-minute blocks. It needs sustained, uninterrupted attention to activate.\n\nNot every session will produce flow. That''s normal. The conditions for flow include: clear goals for the session, immediate feedback on your work, and a challenge level that matches your skill. Too easy and you''re bored. Too hard and you''re anxious. The sweet spot is where focus happens naturally.\n\nTwo Pomodoros. Fifty minutes. You can do this.",
      "action": "Complete two consecutive Pomodoros (25 min + 5 min break + 25 min). Try to work on the same project across both blocks.",
      "reflection_prompt": "Did you experience any moments of flow? What did the 30-minute mark feel like?"
    },
    {
      "day": 8,
      "title": "Shutdown Ritual",
      "coaching_text": "Deep work isn''t just about the work sessions. It''s also about how you end your day.\n\nCal Newport practices a \"shutdown complete\" ritual: at the end of each workday, he reviews every task, makes a plan for tomorrow, and then says the words \"shutdown complete\" out loud. After that, no work email, no work thinking, no work anxiety.\n\nThis sounds almost comically simple, but it''s backed by the Zeigarnik effect — your brain keeps processing incomplete tasks in the background. That''s why you lie awake thinking about work. A shutdown ritual signals your brain that everything is captured and planned, so it can let go.\n\nThe ritual doesn''t have to be elaborate: review your task list, write tomorrow''s top 3 priorities, close your laptop, say \"done for today.\" The key is doing it consistently.\n\nToday: do your double Pomodoro. Then, at the end of your workday, try a shutdown ritual. Write tomorrow''s priorities. Close everything. Say you''re done. See if your evening feels different.",
      "action": "Complete two Pomodoros. At the end of your workday, do a shutdown ritual: review tasks, write tomorrow''s top 3 priorities, close your laptop, say \"shutdown complete\" out loud.",
      "reflection_prompt": "How did your evening feel after the shutdown ritual? Did your brain try to pull you back to work?"
    },
    {
      "day": 9,
      "title": "Boredom Is a Feature",
      "coaching_text": "Here''s a counterintuitive principle: if you want to concentrate better at work, you need to be comfortable with boredom outside of work.\n\nEvery time you pull out your phone in a line, at a red light, or during a commercial break, you''re training your brain that boredom is intolerable. Your brain adapts by demanding stimulation constantly — including during your focus sessions.\n\nThe fix is simple but uncomfortable: create pockets of boredom in your day. Wait in line without your phone. Eat lunch without a screen. Sit with the discomfort of having nothing to do for a few minutes.\n\nThis isn''t about deprivation. It''s about recalibrating your brain''s baseline. When boredom becomes tolerable, the urge to switch during focus sessions weakens. You regain the ability to be alone with your thoughts.\n\nToday: do your double Pomodoro. And at some point today, deliberately choose boredom over your phone for at least 10 minutes.",
      "action": "Complete two Pomodoros. Also, find one moment today where you would normally reach for your phone, and choose to sit with the boredom instead for 10 minutes.",
      "reflection_prompt": "How did the boredom feel? Was it harder or easier than you expected?"
    },
    {
      "day": 10,
      "title": "Time Blocking",
      "coaching_text": "You''re doing focused sessions. Now let''s protect them at the calendar level.\n\nTime blocking means assigning every hour of your workday to a specific task or category. Not every minute — that''s too rigid. But every hour should have a purpose: deep work, email, meetings, admin, break.\n\nThe power of time blocking is that it forces you to be intentional about how you spend your attention. Without it, your day gets hijacked by whatever feels urgent. With it, you decide in advance when deep work happens — and you defend that time.\n\nCal Newport time blocks every workday. He uses a simple notebook: left side is the schedule, right side captures changes as they happen. It doesn''t have to be perfect. The act of planning is what matters.\n\nToday: block out tomorrow''s schedule. Give deep work at least one 50-minute block. Then do today''s double Pomodoro.",
      "action": "Time block tomorrow''s schedule, including at least one 50-minute deep work block. Then complete today''s two Pomodoros.",
      "reflection_prompt": "How does it feel to see your whole day planned out? Where did you place your deep work block, and why?"
    },
    {
      "day": 11,
      "title": "Three Pomodoros",
      "coaching_text": "Today, we push to three Pomodoros. Seventy-five minutes of deep work in one session.\n\nBy now, you''ve been training for 10 days. Your attention muscle is measurably stronger. Let''s test it.\n\nThree Pomodoros (25 on, 5 off, 25 on, 5 off, 25 on) on a single meaningful project. This is a real deep work session — the kind that moves projects forward, produces insights, and creates work you''re proud of.\n\nA few tips for the extended session:\n- Have water at your desk. Dehydration kills focus.\n- If you finish the task before 75 minutes, go deeper. Review what you just did. Improve it. Think about edge cases.\n- The third Pomodoro is where the magic happens. Push through the resistance.\n\nYou''re not dabbling anymore. You''re doing the work.",
      "action": "Complete three consecutive Pomodoros (75 min total) on one meaningful project. Track your distraction count.",
      "reflection_prompt": "How did the third Pomodoro compare to the first? What was different about your mental state?"
    },
    {
      "day": 12,
      "title": "The Deep Life",
      "coaching_text": "Let''s zoom out.\n\nCal Newport argues that deep work isn''t just a productivity technique — it''s a path to a meaningful life. The craftsman who loses themselves in their work, the writer who disappears into a manuscript, the programmer in flow state — they''re not just being productive. They''re experiencing one of the deepest forms of satisfaction available to humans.\n\nCsikszentmihalyi''s research on flow found that people report their highest levels of happiness not during leisure, but during challenging, absorbing work. The state of deep focus is inherently rewarding.\n\nThis means that building your focus capacity isn''t just about getting more done. It''s about experiencing more satisfaction, more meaning, and more of the \"good hard\" that makes a day feel worthwhile.\n\nToday: do your three Pomodoros. But before you start, take a moment to connect your focus work to something you care about. Why does this project matter? Who benefits? What does it build toward?",
      "action": "Before your focus session, write one sentence about why today''s work matters. Then complete three Pomodoros.",
      "reflection_prompt": "Did connecting your work to meaning change the quality of the session?"
    },
    {
      "day": 13,
      "title": "The Social Media Question",
      "coaching_text": "Let''s address the elephant in the room: social media.\n\nNewport''s position is clear — most knowledge workers would benefit from quitting social media entirely. His reasoning isn''t about willpower. It''s about opportunity cost. Every minute spent scrolling is a minute not spent on deep work, genuine rest, or real human connection.\n\nYou don''t have to quit. But today, I want you to run a simple experiment: estimate how many minutes you spent on social media yesterday. Then ask: what would I have done with that time if the apps didn''t exist?\n\nThe honest answers are usually: read, exercise, work on a project, have a conversation, rest, think. All of which build more satisfaction than the scroll.\n\nThis isn''t a judgment call. It''s an attention audit. Know where your attention goes, and you can choose to redirect it.\n\nDo your three Pomodoros today. And be honest with yourself about where the other hours went.",
      "action": "Estimate your social media time from yesterday. Write down what you would have done with that time instead. Then complete three Pomodoros.",
      "reflection_prompt": "What did your attention audit reveal? Any changes you want to make?"
    },
    {
      "day": 14,
      "title": "Your Deep Work Practice",
      "coaching_text": "Fourteen days. You went from 15 minutes of shaky focus to 75 minutes of intentional deep work.\n\nLet''s inventory what you''ve built:\n- A focus ritual with environmental cues\n- The ability to sit with boredom and switch impulses\n- A shutdown ritual that protects your evenings\n- Time blocking to defend your deep work sessions\n- Awareness of your attention leaks\n- Direct experience with flow states\n\nThis isn''t a program you completed. It''s a practice you started. The people who do remarkable work — in any field — aren''t more talented or more disciplined. They protect their attention like it''s their most valuable resource. Because it is.\n\nYour capacity will keep growing if you keep practicing. Three hours of deep work per day is elite performance — most experts top out there. You''re building toward that.\n\nDo your final three Pomodoros. Then decide: what does your daily deep work practice look like going forward? How many sessions per day? When? On what?\n\nYou trained the muscle. Now use it to build something that matters.",
      "action": "Complete your final three Pomodoros. Then write your ongoing deep work plan: when, where, how many sessions per day, and what you''ll work on.",
      "reflection_prompt": "How has your relationship with focus changed over these 14 days? What will you carry forward?"
    }
  ]'::jsonb,
  'curated'
);

-- 3. Executive Function Toolkit (14 days)
INSERT INTO journeys (id, title, description, category, duration_days, content_json, source)
VALUES (
  'a1b2c3d4-3333-4000-8000-000000000003',
  'Executive Function Toolkit',
  'Practical strategies for managing ADHD and executive function challenges. Build systems for task initiation, time awareness, working memory, and emotional regulation — grounded in clinical research.',
  'adhd',
  14,
  '[
    {
      "day": 1,
      "title": "Understanding Your Brain",
      "coaching_text": "Let''s start with what executive function actually is — and why it matters more than willpower.\n\nExecutive functions are the brain''s management system. They include: working memory (holding information while you use it), task initiation (starting things), cognitive flexibility (shifting between tasks), impulse control, planning, and emotional regulation.\n\nIn ADHD, these functions aren''t absent — they''re inconsistent. Some days you can hyperfocus for hours. Other days you can''t start a simple email. The variability is the hallmark.\n\nDr. Russell Barkley, one of the leading ADHD researchers, frames it this way: ADHD isn''t a deficit of attention. It''s a deficit of self-regulation. You can pay attention — you just can''t always direct it where you want it to go.\n\nThe good news: executive function can be supported with external systems. You can''t will yourself into better working memory, but you can build a capture system. You can''t force yourself to start tasks, but you can design triggers that lower the initiation barrier.\n\nThis journey builds those systems, one day at a time.\n\nToday, just notice. Throughout the day, pay attention to moments when you struggle to start something, forget what you were doing, or feel stuck between tasks. Don''t judge it. Just observe.",
      "action": "Carry a small note or open a note on your phone. Throughout the day, jot down moments when you notice an executive function challenge: trouble starting, forgetting mid-task, difficulty switching, or feeling overwhelmed.",
      "reflection_prompt": "What patterns did you notice today? Which executive function challenges show up most often?"
    },
    {
      "day": 2,
      "title": "The Capture System",
      "coaching_text": "Working memory in ADHD is like a desk with no drawers. Everything sits on the surface until it falls off.\n\nThe fix isn''t to get a bigger desk. It''s to get drawers. That''s what a capture system does — it gives every thought, task, and idea a place to land so your brain doesn''t have to hold it.\n\nDavid Allen''s Getting Things Done methodology starts with one principle: your brain is for having ideas, not holding them. When something enters your mind — a task, a worry, an errand, an idea — it goes immediately into a trusted capture system. Not later. Immediately.\n\nFor ADHD brains, this is even more critical. Uncaptured thoughts create anxiety (\"I''m forgetting something\"), fragment attention (your brain keeps looping on open items), and lead to dropped balls.\n\nYour capture system needs three qualities:\n1. Always available — phone note, pocket notebook, voice memo\n2. Fast — under 10 seconds to capture a thought\n3. Trusted — you check it regularly, so your brain can let go\n\nToday, set up your capture system. It doesn''t have to be fancy. A single note app or a pocket notebook works. Then use it all day — every time something pops into your head, capture it immediately.",
      "action": "Set up a simple capture system (note app, notebook, or voice memos). Use it all day — capture every task, idea, and random thought the moment it arises. Don''t organize yet, just capture.",
      "reflection_prompt": "How many items did you capture today? Did externalizing your thoughts change how your brain felt?"
    },
    {
      "day": 3,
      "title": "The 5-4-3-2-1 Launch",
      "coaching_text": "Task initiation is the executive function that trips up most ADHD brains. You know what you need to do. You want to do it. You just... can''t start.\n\nThis isn''t laziness. Dr. William Dodson describes it as a failure of the brain''s activation system. The prefrontal cortex isn''t generating enough dopamine to initiate the action. Your brain is literally waiting for enough neurochemical fuel to start.\n\nThat''s why urgency works — deadlines, last-minute pressure, someone waiting for you. These create the neurochemical spike that overrides the initiation barrier. But living in crisis mode is exhausting.\n\nThere are healthier activation tools:\n\n**The 5-4-3-2-1 Launch:** When you need to start something, count backward from 5 and physically move on 1. Stand up, open the document, pick up the tool. The countdown interrupts the procrastination loop and the physical movement engages a different neural pathway.\n\n**The 2-Minute Start:** Promise yourself you''ll only work for 2 minutes. That''s the deal. If you want to stop after 2 minutes, you can. (You usually won''t.)\n\nToday, use one of these techniques every time you need to start a task. Track how many times you use it and what happens.",
      "action": "Every time you need to start a task today, use either the 5-4-3-2-1 countdown or the 2-minute start commitment. Tally how many times you used it and whether it worked.",
      "reflection_prompt": "Which technique worked better for you? How many times did you use it?"
    },
    {
      "day": 4,
      "title": "Body Doubling and Accountability",
      "coaching_text": "Here''s something most productivity advice ignores: ADHD brains work differently in the presence of other people.\n\nBody doubling is the practice of having another person nearby while you work — not helping, not talking, just present. For many people with ADHD, this dramatically reduces the initiation barrier and increases sustained focus.\n\nWhy does it work? Several theories: the social pressure creates a mild accountability cue, the presence of another person reduces the sense of isolation that makes tasks feel heavier, and the mirror neuron system may help regulate your own attention by observing someone else focusing.\n\nYou don''t need someone in the room. Virtual body doubling works too — a friend on FaceTime while you both work, a focus-with-me livestream, even a busy coffee shop.\n\nRelated to this is verbal accountability: telling someone what you plan to do and when. \"I''m going to finish this report by 3pm\" creates a social commitment that activates a different motivation pathway than willpower alone.\n\nToday, try body doubling or verbal accountability for at least one task. Tell someone what you plan to do, or work alongside someone (in person or virtually).",
      "action": "Try body doubling (work near someone, use a virtual coworking session, or go to a coffee shop) OR tell someone specifically what you plan to accomplish today and by when.",
      "reflection_prompt": "How did the presence of others (real or virtual) affect your ability to work?"
    },
    {
      "day": 5,
      "title": "Time Blindness",
      "coaching_text": "ADHD doesn''t just affect attention — it warps time perception.\n\nDr. Russell Barkley calls it \"time blindness.\" People with ADHD consistently underestimate how long tasks will take, overestimate how much time they have, and struggle to feel the passage of time. It''s not that you don''t care about being late — it''s that your brain doesn''t accurately perceive the ticking clock.\n\nThis explains why you''re \"always running 5 minutes late,\" why projects take three times longer than planned, and why deadlines sneak up on you.\n\nThe fix is to make time visible:\n\n**Analog clocks:** Digital clocks show a number. Analog clocks show the passage of time visually — you can see how much of the hour is gone.\n\n**Time timers:** A visual timer that shows a shrinking colored disc. As time passes, you literally watch the color disappear.\n\n**The \"times three\" rule:** Whatever you think a task will take, multiply by three. That''s usually closer to reality.\n\nToday, make time visible. Use a timer for tasks. Estimate how long things will take, then track the actual time. Build your personal calibration data.",
      "action": "For every task today, estimate how long it will take BEFORE starting. Then time yourself. Write down the estimate vs. actual time. Also, try using a visible timer (phone timer facing you, or a Time Timer app).",
      "reflection_prompt": "How did your estimates compare to reality? Were you consistently over or under?"
    },
    {
      "day": 6,
      "title": "The Power of Externalization",
      "coaching_text": "A core principle of ADHD management: if it''s not visible, it doesn''t exist.\n\nThis sounds extreme, but think about it. The task you wrote on a sticky note gets done. The task you \"kept in your head\" gets forgotten. The deadline on your calendar triggers action. The deadline you vaguely remember does not.\n\nDr. Barkley''s framework for ADHD management centers on externalization: taking the internal executive functions your brain struggles with and making them external, physical, and visible.\n\n- Working memory problems → write everything down\n- Task initiation problems → set alarms and timers\n- Planning problems → use physical planning tools (whiteboards, sticky notes, kanban boards)\n- Time perception problems → use visible clocks and timers\n- Motivation problems → make rewards immediate and tangible\n\nThe goal isn''t to \"fix\" your executive functions. It''s to build an external scaffolding that does the job for you. The most successful ADHD adults aren''t the ones who overcame their symptoms through willpower. They''re the ones who built the best external systems.\n\nToday, identify one area where you''ve been trying to \"just remember\" or \"just do it.\" Build an external system for it.",
      "action": "Pick one thing you''ve been trying to manage internally (remembering tasks, tracking time, staying on schedule). Build an external system for it: a physical list, a timer, an alarm, a whiteboard, whatever makes it visible and automatic.",
      "reflection_prompt": "What did you externalize? How does it feel to stop relying on your memory for it?"
    },
    {
      "day": 7,
      "title": "Emotional Regulation",
      "coaching_text": "Executive function isn''t just cognitive. It''s emotional.\n\nADHD includes a dimension that most people don''t talk about: emotional dysregulation. Emotions hit harder, faster, and linger longer. Frustration spikes instantly. Rejection stings disproportionately. Excitement can override all rational planning.\n\nDr. Dodson''s concept of Rejection Sensitive Dysphoria (RSD) describes the intense emotional pain triggered by perceived rejection or criticism. It''s not sensitivity or overreacting — it''s a neurological response that feels overwhelming in the moment.\n\nThe RAIN technique from mindfulness research helps:\n\n**R** — Recognize: \"I''m having a strong emotional reaction.\"\n**A** — Allow: Let the feeling be there without fighting it.\n**I** — Investigate: Where do I feel this in my body? What triggered it?\n**N** — Non-identification: \"I am having this feeling\" not \"I am this feeling.\"\n\nEmotions in ADHD are like weather — intense, passing, and not your fault. You can''t stop the storm, but you can learn not to make decisions while it''s raging.\n\nToday, practice RAIN when a strong emotion arises. If nothing triggers you today, practice it retroactively on a recent emotional moment.",
      "action": "When a strong emotion arises today, walk through RAIN: Recognize, Allow, Investigate, Non-identify. If the day is calm, apply RAIN retroactively to a recent emotional experience.",
      "reflection_prompt": "What emotion came up? How did RAIN change your experience of it?"
    },
    {
      "day": 8,
      "title": "Decision Fatigue",
      "coaching_text": "Every decision uses executive function. And ADHD brains start with less of that resource.\n\nDecision fatigue explains why you can make good choices in the morning but terrible ones at night. Why grocery shopping is exhausting. Why picking what to wear can derail your entire morning.\n\nThe solution is to eliminate unnecessary decisions:\n\n**Routines:** A morning routine removes decisions about what to do first. That''s why we build them.\n\n**Defaults:** Choose your default lunch, default outfit, default work playlist. The choice is already made.\n\n**Rules:** \"I check email at 10am and 3pm\" is a rule that eliminates the constant decision of whether to check email.\n\n**Batching:** Group similar decisions together. Plan all meals on Sunday. Pick all outfits for the week. Batch errands into one trip.\n\nThe fewer decisions you make about unimportant things, the more executive function you have for things that matter.\n\nToday, identify three recurring decisions that drain you. Create a default or rule for each one.",
      "action": "List three decisions you make repeatedly that drain your energy (what to eat, what to wear, when to check email, etc.). Create a default, rule, or pre-decision for each one.",
      "reflection_prompt": "Which decisions drain you most? How do your new defaults feel?"
    },
    {
      "day": 9,
      "title": "The Transition Problem",
      "coaching_text": "Transitions are where ADHD brains get stuck.\n\nSwitching from one activity to another requires multiple executive functions firing at once: disengaging from the current task, holding the next task in working memory, initiating the new behavior, and managing the emotional resistance to change.\n\nThat''s why you can spend 45 minutes \"getting ready to leave\" or why moving from a fun activity to a boring one feels physically painful.\n\nStrategies for smoother transitions:\n\n**Transition rituals:** A specific action that signals the shift. Close the laptop. Stand up. Take three breaths. Walk to a different room. The physical action bridges the mental gap.\n\n**Warnings:** Set a 10-minute and 2-minute warning before transitions. This gives your brain time to prepare instead of being yanked from one thing to another.\n\n**Transition objects:** Keep something from the next activity visible during the current one. Your gym bag by the door. Tomorrow''s work folder on your desk.\n\nToday, design transition rituals for your two hardest transitions (e.g., getting out of bed, starting work, leaving for appointments). Use the 10-minute warning for at least one transition.",
      "action": "Identify your two hardest daily transitions. Create a ritual for each one (a physical action, a warning timer, a visible cue). Use them today.",
      "reflection_prompt": "Which transitions are hardest for you? Did the rituals help?"
    },
    {
      "day": 10,
      "title": "Interest-Based Motivation",
      "coaching_text": "Neurotypical brains run on importance-based motivation: \"This matters, so I''ll do it.\" ADHD brains run on interest-based motivation: \"This is interesting/urgent/novel/challenging, so I''ll do it.\"\n\nDr. Dodson identifies four ADHD motivation triggers: interest, challenge, novelty, and urgency. If a task has none of these, the ADHD brain struggles to engage — regardless of how important it is.\n\nThis isn''t a character flaw. It''s neurochemistry. The ADHD brain needs more dopamine to initiate action, and these four triggers are reliable dopamine generators.\n\nSo instead of fighting your motivation system, work with it:\n\n- **Make boring tasks interesting:** Listen to music, gamify it, set a speed challenge\n- **Add novelty:** Do the task in a new location, with a new tool, in a new order\n- **Create challenge:** Set a timer and try to beat it. Compete with yourself.\n- **Manufacture urgency:** Create a deadline. Tell someone. Set a public commitment.\n\nToday, take your most dreaded task and add at least one motivation trigger before starting it.",
      "action": "Pick your most dreaded task. Before starting, add an interest trigger: gamify it, set a speed challenge, change the location, create a deadline, or find what makes it novel. Then do it.",
      "reflection_prompt": "What trigger did you add? Did it change your experience of the task?"
    },
    {
      "day": 11,
      "title": "Sleep and Executive Function",
      "coaching_text": "Sleep is the most underrated executive function intervention.\n\nResearch consistently shows that sleep deprivation impairs executive function more than it impairs any other cognitive ability. Working memory, impulse control, emotional regulation, task initiation — all significantly worse after poor sleep.\n\nFor ADHD brains, which already have lower executive function baselines, poor sleep is catastrophic. Dr. Barkley estimates that inadequate sleep makes ADHD symptoms 30-40% worse.\n\nThe challenge: ADHD makes it hard to sleep. Racing thoughts, difficulty with the transition from awake to asleep, revenge bedtime procrastination (staying up late to reclaim the free time you didn''t get during the day), and inconsistent circadian rhythms all conspire against you.\n\nBasic sleep hygiene for ADHD:\n- Same bedtime and wake time, even weekends (consistency regulates circadian rhythm)\n- No screens 30 minutes before bed (the light suppresses melatonin)\n- Cool, dark room\n- A wind-down routine that signals sleep is coming\n- If thoughts race, do a \"brain dump\" — write everything on paper before bed\n\nToday, set a specific bedtime and create a simple 15-minute wind-down routine. Try it tonight.",
      "action": "Set a specific bedtime for tonight. Create a 15-minute wind-down routine (brain dump, dim lights, no screens, light reading or stretching). Follow it tonight.",
      "reflection_prompt": "What does your wind-down routine include? Did you follow it? How did sleep feel?"
    },
    {
      "day": 12,
      "title": "Movement as Medicine",
      "coaching_text": "Exercise is the single most effective non-pharmaceutical intervention for ADHD.\n\nDr. John Ratey, author of \"Spark,\" describes exercise as \"Miracle-Gro for the brain.\" Just 20-30 minutes of moderate cardio increases dopamine, norepinephrine, and serotonin — the same neurotransmitters targeted by ADHD medication.\n\nThe effects are immediate: improved focus, better emotional regulation, reduced impulsivity, and enhanced working memory. A single session of moderate exercise can improve executive function for 2-4 hours afterward.\n\nYou don''t need a gym membership or a training plan. The most effective exercise for ADHD is whatever you''ll actually do:\n- A 20-minute walk\n- Dancing to three songs\n- 10 minutes of bodyweight exercises\n- A bike ride\n- Playing with your dog\n\nThe key is doing it before your most demanding cognitive work. Exercise first, deep work second.\n\nToday, do at least 20 minutes of movement before your most important task. Notice the difference in your focus afterward.",
      "action": "Do 20+ minutes of movement (walk, dance, exercise, bike — anything that raises your heart rate) BEFORE your most demanding task. Notice how your focus changes.",
      "reflection_prompt": "What movement did you do? How did your focus and mood change afterward?"
    },
    {
      "day": 13,
      "title": "Building Your Toolkit",
      "coaching_text": "You''ve spent 12 days trying different strategies. Not all of them will stick — and that''s the point.\n\nADHD management is deeply personal. What works for one person may not work for another. The goal of this journey isn''t to implement every strategy. It''s to build a personal toolkit — a set of 3-5 strategies that work for YOUR brain.\n\nLet''s review what you''ve tried:\n- Capture system (Day 2)\n- Task initiation techniques: 5-4-3-2-1 and 2-minute start (Day 3)\n- Body doubling and accountability (Day 4)\n- Making time visible (Day 5)\n- Externalization of executive functions (Day 6)\n- RAIN for emotional regulation (Day 7)\n- Reducing decision fatigue (Day 8)\n- Transition rituals (Day 9)\n- Interest-based motivation (Day 10)\n- Sleep hygiene (Day 11)\n- Exercise before cognitive work (Day 12)\n\nToday, reflect on all of these. Which 3-5 strategies made the biggest difference? Those are your core toolkit. Write them down. These are the ones you keep practicing.",
      "action": "Review all 12 strategies. Pick your top 3-5 and write them on a card or note you''ll see daily. These are your Executive Function Toolkit.",
      "reflection_prompt": "Which strategies made your top list? Why those ones?"
    },
    {
      "day": 14,
      "title": "Compassion and the Long Game",
      "coaching_text": "Fourteen days. You showed up and built something real.\n\nBut I want to end with the most important thing — something that no productivity system can replace.\n\nSelf-compassion.\n\nLiving with executive function challenges means a lifetime of hearing — from others and from yourself — that you should \"just try harder,\" \"just focus,\" \"just be on time.\" This creates a shame narrative that is, in many ways, more disabling than the ADHD itself.\n\nDr. Kristin Neff''s research on self-compassion shows that people who treat themselves with kindness after failures are more likely to try again, more resilient, and more motivated — not less. Self-compassion isn''t letting yourself off the hook. It''s recognizing that struggling isn''t a personal failing.\n\nYou have a brain that works differently. Not worse. Differently. The strategies you''ve learned are accommodations, not crutches. Using a planner isn''t cheating, just like wearing glasses isn''t cheating.\n\nYour toolkit will evolve. Some strategies will stop working and you''ll need new ones. Some days you''ll forget everything and that''s okay. The systems are there when you need them.\n\nYou showed up for 14 days to understand your own brain better. That takes courage. Carry it forward.",
      "action": "Write yourself a brief letter of compassion — acknowledge what you''ve learned, what''s still hard, and what you''re proud of. Keep it where you''ll find it on a tough day.",
      "reflection_prompt": "What would you tell a friend who struggles with the same things you do?"
    }
  ]'::jsonb,
  'curated'
);


-- ============================================================
-- COACHING SESSIONS
-- ============================================================

INSERT INTO coaching_sessions (id, title, category, content_type, content_text, audio_url, duration_seconds, source) VALUES
(
  'b1b2c3d4-0001-4000-8000-000000000001',
  'The 3-3-3 Grounding',
  'anxiety',
  'text',
  'When anxiety spikes, your nervous system is in fight-or-flight. Your prefrontal cortex — the rational, planning part of your brain — goes offline. You can''t think your way out of a panic response. You have to regulate your body first.

The 3-3-3 technique interrupts the anxiety loop by forcing your brain to engage the present moment:

**Name 3 things you can see.** Look around. A coffee mug. A tree outside. Your hands on the keyboard. Be specific — not "my desk" but "the scratch on the corner of my desk."

**Name 3 things you can hear.** Close your eyes for a moment. Air conditioning. A car outside. Your own breathing. Listen for the quietest sound.

**Move 3 parts of your body.** Roll your shoulders. Flex your fingers. Shift your feet. Physical movement tells your nervous system that you''re safe — you''re choosing to move, not fleeing from danger.

This takes 30 seconds. It works because anxiety lives in the future — "what if this happens, what if that goes wrong." Sensory grounding yanks your attention back to right now. And right now, in this moment, you are safe.

If the anxiety is still high after one round, do it again. Each round brings your nervous system down a notch. You''re not eliminating the anxiety. You''re giving your prefrontal cortex a chance to come back online so you can respond rather than react.

You can do this in a meeting, on a plane, in a conversation. No one needs to know.',
  NULL,
  180,
  'curated'
),
(
  'b1b2c3d4-0002-4000-8000-000000000002',
  'Box Breathing Reset',
  'anxiety',
  'text',
  'Box breathing is used by Navy SEALs, first responders, and surgeons to regulate their nervous system under pressure. If it works in combat and operating rooms, it works in your day.

Here''s how:

**Inhale** for 4 seconds — slow, through your nose, filling your belly (not your chest).
**Hold** for 4 seconds — lungs full, body still.
**Exhale** for 4 seconds — slow, controlled, through your mouth.
**Hold** for 4 seconds — lungs empty, body still.

That''s one cycle. Do four cycles.

The mechanism: slow, controlled breathing activates the vagus nerve, which triggers the parasympathetic nervous system — your "rest and digest" mode. Heart rate drops. Blood pressure falls. Cortisol production slows.

The 4-second hold is what makes this different from regular deep breathing. It creates a moment of complete stillness where your body has to reset its respiratory rhythm. That reset propagates to your entire autonomic nervous system.

Common mistakes:
- Breathing too deeply. You should feel comfortable, not lightheaded.
- Rushing the holds. Count "one-Mississippi" to keep the pace.
- Expecting instant calm. It usually takes 2-3 cycles to notice a shift.

Use box breathing:
- Before a difficult conversation
- When you notice your heart racing
- At the start of a focus session (transition ritual)
- Before sleep when your mind is racing

Four breaths. Sixteen seconds each. One minute to reset your entire nervous system.',
  NULL,
  240,
  'curated'
),
(
  'b1b2c3d4-0003-4000-8000-000000000003',
  'The Two-Minute Rule',
  'productivity',
  'text',
  'David Allen''s Two-Minute Rule is the simplest productivity principle that actually works: if a task will take less than two minutes, do it now. Don''t write it down. Don''t schedule it. Don''t think about it. Just do it.

Why? Because the overhead of capturing, organizing, and revisiting a two-minute task is greater than the task itself. Every item on your to-do list carries cognitive weight — it occupies working memory, creates decision points, and generates low-grade anxiety about undone things.

A two-minute task that sits on your list for three days has consumed far more mental energy than the two minutes it would have taken to complete.

Apply this ruthlessly:
- Reply to that email? Two minutes. Do it now.
- Put the dish in the dishwasher? Two minutes. Do it now.
- File that document? Two minutes. Do it now.
- Send that text? Two minutes. Do it now.

The accumulation effect is powerful. Ten two-minute tasks done immediately saves you 20 minutes of actual work AND eliminates 10 items of cognitive load from your mental RAM.

**The flip side is equally important:** if a task will take MORE than two minutes, don''t do it now. Capture it in your system and schedule it. The Two-Minute Rule is a filter, not a license to be reactive.

Here''s how to practice today: every time a small task comes to mind, ask "two minutes?" If yes, do it immediately. If no, write it down. Notice how much lighter your mental load feels by evening.',
  NULL,
  180,
  'curated'
),
(
  'b1b2c3d4-0004-4000-8000-000000000004',
  'Eat the Frog',
  'productivity',
  'text',
  'Mark Twain (allegedly) said: "If the first thing you do each morning is eat a live frog, you can go through the rest of the day with the satisfaction of knowing that is probably the worst thing that is going to happen to you all day long."

Your "frog" is your most important, most dreaded task. The one you''ve been avoiding. The one that would make the biggest difference if you did it.

The principle: do your frog first. Before email. Before meetings. Before the day''s small tasks chip away at your energy and willpower.

Why this works:

**Willpower is a depletable resource.** Research by Roy Baumeister shows that self-control diminishes throughout the day as you make decisions and resist impulses. Your morning is when you have the most executive function available. Spending it on email is like using premium fuel to idle in a parking lot.

**Completion creates momentum.** Finishing your hardest task early creates a psychological win that powers the rest of the day. You''ve already accomplished the most important thing — everything else is bonus.

**Avoidance compounds.** The frog you don''t eat today becomes a bigger frog tomorrow. It accumulates anxiety, guilt, and the growing dread of eventually having to face it. Eating it early breaks the cycle.

How to identify your frog: Tonight, before bed, ask yourself: "If I could only complete ONE task tomorrow, which one would make the biggest difference?" That''s your frog.

Tomorrow morning, do that task before anything else. No email, no news, no social media. Frog first. Then you''re free.',
  NULL,
  210,
  'curated'
),
(
  'b1b2c3d4-0005-4000-8000-000000000005',
  'Body Scan for Calm',
  'mindfulness',
  'text',
  'The body scan is one of the foundational practices in Mindfulness-Based Stress Reduction (MBSR), developed by Jon Kabat-Zinn at the University of Massachusetts Medical Center. It''s been clinically validated for reducing stress, anxiety, chronic pain, and insomnia.

The practice is simple: systematically move your attention through each part of your body, noticing sensations without trying to change them.

**Here''s a quick 3-minute version:**

Start with your feet. Notice any sensations — warmth, pressure, tingling, nothing at all. Don''t judge. Just notice.

Move to your lower legs. Calves, shins. Whatever is there.

Knees and thighs. You might notice tension you weren''t aware of. Let it be.

Hips and pelvis. Where is your weight resting?

Lower back and belly. This is where many people hold stress. Notice without fixing.

Chest and upper back. Feel your breath moving here.

Shoulders and neck. Probably tight. That''s okay.

Arms and hands. Down to your fingertips.

Face and head. Jaw (probably clenched). Forehead (probably furrowed). Eyes (probably straining).

Now take one breath and feel your entire body at once, as one field of sensation.

What the body scan does neurologically: it activates the insular cortex, which is responsible for interoception — your brain''s awareness of your body''s internal state. Most of us are disconnected from our bodies during the workday. We don''t notice tension building until it becomes a headache. We don''t notice stress until it becomes anxiety.

Regular body scanning rewires this connection. Over time, you become aware of stress patterns earlier, which means you can intervene before they escalate.

Try this once a day — first thing in the morning, during a break, or before bed.',
  NULL,
  180,
  'curated'
),
(
  'b1b2c3d4-0006-4000-8000-000000000006',
  'Noting: The Simplest Meditation',
  'mindfulness',
  'text',
  'If you''ve tried meditation and "failed" because your mind kept wandering — congratulations. You were doing it right.

Meditation isn''t about stopping your thoughts. It''s about noticing them. The moment you realize your mind has wandered IS the practice. That moment of awareness — "oh, I was thinking about lunch" — is a mental bicep curl for your attention.

The noting technique makes this explicit:

**Sit comfortably.** Close your eyes or soften your gaze.

**Breathe naturally.** Don''t control it.

**When a thought arises, label it.** Just one word:
- Planning: "planning"
- Worrying: "worrying"
- Remembering: "remembering"
- Judging: "judging"
- Wanting: "wanting"
- Feeling: "feeling"

Then gently return to the breath.

That''s it. You''re not trying to stop the thoughts. You''re labeling them and letting them pass. Like watching cars on a highway — you see each one, you note what kind it is, and you let it drive by.

Research from UCLA found that labeling emotions (a process called "affect labeling") actually reduces amygdala activity — the brain''s alarm system. When you name "anxiety" instead of just feeling it, the emotion literally becomes less intense.

Start with 5 minutes. Set a timer so you''re not thinking about time. Every time you realize you''ve been lost in thought, celebrate that moment of awareness. Then label what you were doing: "planning." "Worrying." And return.

Over weeks, you''ll notice something shift. The gap between getting lost in a thought and noticing you''re lost gets shorter. That gap is mindfulness. And it extends to the rest of your life — you start noticing stress, reactivity, and unhelpful patterns in real time.',
  NULL,
  300,
  'curated'
),
(
  'b1b2c3d4-0007-4000-8000-000000000007',
  'Self-Compassion Break',
  'self-compassion',
  'text',
  'When you mess up, miss a deadline, say the wrong thing, or fall short of your own standards — what does your inner voice say?

For most people, the answer is something like: "You''re so stupid." "Why can''t you just get it together?" "Everyone else can handle this." "You always do this."

Now imagine a friend came to you with the same situation. Would you say those things to them? Of course not. You''d be kind. You''d offer perspective. You''d remind them they''re human.

Dr. Kristin Neff''s research at the University of Texas shows that self-compassion — treating yourself with the same kindness you''d offer a friend — is more effective than self-criticism for motivation, resilience, and performance. Self-criticism triggers the threat system (fight-or-flight). Self-compassion activates the care system (calm, connected, able to think clearly).

**The Self-Compassion Break has three steps:**

**1. Acknowledge the suffering.** "This is hard right now." Not dramatic. Not minimized. Just honest.

**2. Recognize common humanity.** "Other people struggle with this too. I''m not the only one." This breaks the isolation that makes suffering worse.

**3. Offer yourself kindness.** Place your hand on your chest if it helps. Say: "May I be kind to myself in this moment." Or simply: "It''s okay. You''re doing your best."

This is not weakness. This is not letting yourself off the hook. This is giving yourself the emotional support you need to try again. The research is clear: people who practice self-compassion are MORE likely to take responsibility, MORE motivated to improve, and MORE resilient after setbacks.

Try this the next time you catch your inner critic going hard. Three steps. Thirty seconds. A fundamentally different relationship with yourself.',
  NULL,
  240,
  'curated'
),
(
  'b1b2c3d4-0008-4000-8000-000000000008',
  'The ADHD Task Initiation Hack',
  'adhd',
  'text',
  'You know what you need to do. You''re staring at it. Your body won''t move.

This is the ADHD initiation wall. It''s not laziness. It''s not a lack of caring. It''s your prefrontal cortex failing to generate enough activation energy to start the task. Your brain is literally stuck between "I should do this" and "I am doing this."

Here are five research-backed techniques to break through the wall. Not all will work every time. Try them in order until one clicks.

**1. Shrink the task.** "Write the report" is paralyzing. "Open the document and write one sentence" is doable. Make the first step so small it feels stupid. That''s the right size.

**2. The 5-4-3-2-1 launch.** Count backward from 5, then physically move on 1. Stand up. Walk to your desk. Open the app. The countdown interrupts the freeze loop.

**3. Pair it with dopamine.** Put on a specific playlist. Make your favorite drink. Work in a cafe. ADHD brains need more dopamine to initiate — so stack the environment with dopamine sources.

**4. Body double.** Call a friend. Say "I''m going to work on X for 20 minutes, can you stay on the phone?" The social presence changes the neurochemistry of the task.

**5. Manufacture urgency.** Set a timer for 15 minutes and tell someone: "I''ll have the first draft to you in 15 minutes." Artificial deadlines activate the urgency pathway that ADHD brains respond to.

The key insight: you don''t need to feel ready to start. You need to start to feel ready. Action creates motivation, not the other way around. The feeling of "now I''m in the zone" comes AFTER the first few minutes of work, not before.

Pick a task you''ve been avoiding. Try technique #1. If it doesn''t work, try #2. Keep going until one breaks through. Then ride the momentum.',
  NULL,
  300,
  'curated'
),
(
  'b1b2c3d4-0009-4000-8000-000000000009',
  'Working Memory Workarounds',
  'adhd',
  'text',
  'You walk into a room and forget why you''re there. You start a sentence and lose the point halfway through. Someone gives you three instructions and you remember one.

This is working memory — the cognitive scratchpad your brain uses to hold and manipulate information in real time. In ADHD, it''s smaller, less reliable, and more easily disrupted.

Working memory isn''t something you can strengthen through brain games (despite what the apps promise). But you can build systems that compensate for it brilliantly.

**The "Say It Out Loud" technique.** When someone gives you instructions or you have a thought you need to remember, say it out loud. "I''m going to the kitchen to get the scissors." Vocalizing engages a different memory system (echoic memory) that reinforces the working memory trace.

**The "Write It Down Immediately" rule.** Not in 5 minutes. Not when you get to your desk. Right now. Keep a capture tool (phone note, pocket notebook) within arm''s reach at all times. The thought you don''t write down in the next 10 seconds is gone.

**The "One Thing at a Time" protocol.** Don''t try to hold multiple tasks in working memory. Finish one, check your list, do the next. Your list is your external working memory.

**The "Leave Yourself Breadcrumbs" trick.** Before you switch tasks, write yourself a note: "I was working on the Johnson report, paragraph 3, about to add the revenue table." When you come back, you don''t have to reconstruct your mental context from scratch.

**The "Visual Dashboard" approach.** Put today''s top 3 tasks on a sticky note attached to your monitor. Your working memory can''t hold them, but your eyeballs can see them.

These aren''t crutches. They''re tools. A carpenter doesn''t try to hammer nails with their hand because "I should be able to do this myself." They use a hammer. These are your hammers.',
  NULL,
  300,
  'curated'
),
(
  'b1b2c3d4-0010-4000-8000-000000000010',
  'The Energy Audit',
  'energy',
  'text',
  'You don''t have a time management problem. You have an energy management problem.

Jim Loehr and Tony Schwartz, in "The Power of Full Engagement," argue that managing energy — not time — is the key to high performance and personal renewal. You can have 16 available hours in a day, but if your energy is depleted, those hours are worthless.

Energy operates in four dimensions:

**Physical:** Sleep, nutrition, exercise, hydration. The foundation. Everything else collapses without this.

**Emotional:** Positive emotions (joy, gratitude, connection) generate energy. Negative emotions (anxiety, frustration, resentment) drain it. Relationships and self-talk directly affect your fuel tank.

**Mental:** Focus, creativity, and cognitive performance. Depleted by constant task-switching, decision fatigue, and information overload.

**Spiritual:** Alignment with purpose and values. The feeling that what you''re doing matters. This is the deepest and most sustainable energy source.

**Today''s exercise — The Energy Audit:**

Take the last 24 hours and rate each dimension from 1-10:
- Physical energy: ___/10
- Emotional energy: ___/10
- Mental energy: ___/10
- Spiritual energy: ___/10

Now identify your biggest energy drain in each dimension:
- Physical: What depleted you? (poor sleep, skipped meals, no movement?)
- Emotional: What drained you? (a difficult conversation, self-criticism, loneliness?)
- Mental: What fragmented you? (too many meetings, constant notifications?)
- Spiritual: What felt meaningless? (busywork, tasks misaligned with values?)

And your biggest energy source in each:
- Physical: What fueled you?
- Emotional: What lifted you?
- Mental: What engaged you?
- Spiritual: What felt meaningful?

The audit gives you a map. The drains are what you reduce. The sources are what you protect and expand. Start with the dimension that scored lowest.',
  NULL,
  300,
  'curated'
),
(
  'b1b2c3d4-0011-4000-8000-000000000011',
  'The 10-Minute Energy Reset',
  'energy',
  'text',
  'It''s 2:30 PM. Your energy has cratered. You''re staring at your screen, reading the same paragraph for the fourth time. You reach for coffee or your phone — but you know neither will actually help.

Here''s a 10-minute reset that actually restores energy, based on the ultradian rhythm research of Peretz Lavie and the recovery principles from performance science.

Your body operates on 90-120 minute energy cycles (ultradian rhythms). After each cycle, your body signals the need for recovery: yawning, difficulty concentrating, hunger, restlessness. Most people ignore these signals and push through with caffeine and willpower. This works short-term but creates an energy debt that compounds through the day.

**The 10-Minute Reset Protocol:**

**Minutes 1-2: Stand and stretch.** Get blood moving. Reach overhead. Twist your torso. Roll your neck. Touch your toes (or try). Physical movement tells your brain the sitting marathon is over.

**Minutes 3-5: Walk outside.** Even 3 minutes of natural light and fresh air resets your circadian alertness system. If you can''t go outside, stand by a window. Look at something far away — this relaxes the muscles in your eyes that have been locked in screen-distance focus.

**Minutes 6-8: Hydrate and breathe.** Drink a full glass of water (dehydration is a leading cause of afternoon fatigue). Take 5 slow breaths — 4 seconds in, 6 seconds out. This activates parasympathetic recovery.

**Minutes 9-10: Micro-plan.** Before diving back in, write down the ONE thing you''re going to work on next. Just one. This eliminates the "what should I do now?" decision fatigue that makes returning to work feel hard.

Try this at your first afternoon slump today. It''s not about powering through — it''s about working WITH your body''s natural rhythm.',
  NULL,
  240,
  'curated'
),
(
  'b1b2c3d4-0012-4000-8000-000000000012',
  'The Motivation Myth',
  'motivation',
  'text',
  'Waiting for motivation is the most reliable way to never start anything.

Here''s what most people believe: Motivation → Action → Results. Feel motivated first, then start working, then see progress.

Here''s what actually happens: Action → Results → Motivation. Start working (however imperfectly), see some progress (however small), and motivation follows.

This is called the "action-motivation feedback loop," and behavioral research confirms it repeatedly. You don''t need to feel like running to benefit from a run. You don''t need to feel inspired to write something good. You don''t need to be "in the mood" to start your hardest task.

**Why does motivation fail?**

Motivation is an emotion. Emotions are transient, unreliable, and heavily influenced by sleep, blood sugar, weather, and whether someone cut you off in traffic this morning. Building your life on motivation is like building a house on a foundation that moves.

**What works instead?**

**Systems, not goals.** A system is a daily practice you follow regardless of how you feel. "I write for 30 minutes every morning" is a system. "I want to write a book" is a goal. The system produces the goal, but it doesn''t depend on motivation.

**Identity, not outcomes.** James Clear: "Every action you take is a vote for the person you want to become." You''re not trying to get motivated. You''re trying to become someone who does the thing. Each time you show up — motivated or not — you cast a vote for that identity.

**Tiny starts, not grand launches.** Motivation loves grand gestures: the 5 AM alarm, the complete diet overhaul, the 90-minute gym session. All of which crash by week two. Start so small that not doing it feels absurd. Then build.

The next time you''re waiting to feel motivated, remember: the feeling comes after the action, not before. Start anyway. Start badly. Start for two minutes. But start.',
  NULL,
  270,
  'curated'
),
(
  'b1b2c3d4-0013-4000-8000-000000000013',
  'The Done List',
  'motivation',
  'text',
  'To-do lists are motivational black holes. You add 15 items, complete 10, and feel bad about the 5 remaining. Your brain fixates on what''s undone, not what you accomplished. This is the Zeigarnik effect — incomplete tasks occupy more mental space than completed ones.

The antidote is the Done List.

At the end of each day, write down everything you actually did. Not what you planned to do. What you did.

Include everything:
- Made breakfast. (That counts.)
- Responded to 12 emails. (Each one was a decision.)
- Had a difficult conversation with a coworker. (That took courage.)
- Helped a colleague with their project. (That had value.)
- Drove the kids to practice. (Logistics are real work.)
- Did a 25-minute focus session. (That''s training a skill.)

The Done List serves three purposes:

**1. It counteracts negativity bias.** Your brain is wired to notice threats and failures. The Done List forces it to register accomplishments.

**2. It reveals hidden work.** So much of what you do each day is invisible — emotional labor, context switching, supporting others, making decisions. The Done List makes it visible.

**3. It builds evidence for your identity.** When your inner critic says "you didn''t do anything today," you have a list that proves otherwise.

Try it tonight. Before bed, write down everything you did today. Don''t curate. Don''t judge. Just list. You''ll be surprised how long it is.

If you want to level up: keep a running Done List throughout the day. Every time you complete something, add it. By evening, you won''t have to reconstruct your day from memory — and you''ll have a tangible record of what you accomplished.',
  NULL,
  240,
  'curated'
);
