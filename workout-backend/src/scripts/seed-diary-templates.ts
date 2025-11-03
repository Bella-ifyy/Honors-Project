import { createConnection } from 'typeorm';
import ormconfig from '../ormconfig';
import { DiaryEntryEntity } from '../entities/diary-entry.entity';

const SYSTEM_TEMPLATE_UUID = '00000000-0000-0000-0000-000000000000';

type DiaryTemplate = {
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
};

const diaryTemplates: DiaryTemplate[] = [
  {
    title: 'Morning Reflection',
    content: `Good morning! Today is a fresh start.

## How am I feeling this morning?
- 

## What am I grateful for today?
- 
- 
- 

## What are my intentions for today?
- 
- 
- 

## Energy level: [Low / Medium / High]

Let's make today count!`,
    mood: 'reflective',
    tags: ['morning', 'reflection'],
  },
  {
    title: 'Evening Reflection',
    content: `Ending the day with reflection.

## What went well today?
- 
- 
- 

## What challenged me today?
- 

## What did I learn today?
- 

## How am I feeling now?
- 

## Tomorrow's focus:
- 

Rest well!`,
    mood: 'reflective',
    tags: ['evening', 'reflection'],
  },
  {
    title: 'Gratitude Journal',
    content: `# Gratitude Entry - [Date]

## Three things I'm grateful for today:
1. 
2. 
3. 

## A moment that made me smile:
- 

## Someone I'm thankful for:
- 

Gratitude transforms what we have into enough.`,
    mood: 'grateful',
    tags: ['gratitude', 'positive'],
  },
  {
    title: 'Weekly Review',
    content: `# Weekly Review - Week of [Date]

## Highlights of the week:
- 
- 
- 

## Challenges faced:
- 
- 

## Goals progress:
- [ ] Goal 1: 
- [ ] Goal 2: 
- [ ] Goal 3: 

## What I learned this week:
- 

## Next week's priorities:
- 
- 
- 

## How I'm feeling:
- 

Here's to growth and progress!`,
    mood: 'reflective',
    tags: ['weekly', 'review'],
  },
  {
    title: 'Goal Setting',
    content: `# Goal Setting - [Date]

## What do I want to achieve?
- 
- 
- 

## Why is this important to me?
- 

## What steps will I take?
- [ ] 
- [ ] 
- [ ] 

## Timeline:
- Start: [Date]
- Target completion: [Date]

## How will I measure success?
- 

## Potential obstacles:
- 

## Support needed:
- 

Let's make it happen!`,
    mood: 'motivated',
    tags: ['goals', 'planning'],
  },
  {
    title: 'Emotional Check-in',
    content: `# Emotional Check-in - [Date]

## Current emotional state:
- Primary emotion: 
- Intensity (1-10): 

## What's contributing to how I feel?
- 
- 

## Physical sensations:
- 

## What do I need right now?
- 

## Self-care actions I can take:
- [ ] 
- [ ] 
- [ ] 

## Affirmations:
- 

Taking care of myself is important.`,
    mood: 'reflective',
    tags: ['emotions', 'self-care'],
  },
];

async function seedDiaryTemplates() {
  console.log('🌱 Starting diary template seeding...');

  try {
    const connection = await createConnection({
      ...ormconfig,
      name: 'seed-diary-templates',
    });

    const diaryRepository = connection.getRepository(DiaryEntryEntity);

    // Check if templates already exist
    const existingTemplates = await diaryRepository.find({
      where: { userUUID: SYSTEM_TEMPLATE_UUID },
    });

    if (existingTemplates.length > 0) {
      console.log(`⚠️  Found ${existingTemplates.length} existing templates. Clearing...`);
      await diaryRepository.delete({ userUUID: SYSTEM_TEMPLATE_UUID });
    }

    console.log(`📝 Creating ${diaryTemplates.length} diary templates...`);

    let createdCount = 0;
    for (const template of diaryTemplates) {
      const entry = diaryRepository.create({
        title: template.title,
        content: template.content,
        mood: template.mood || 'reflective',
        tags: template.tags || [],
        favorite: false,
        userUUID: SYSTEM_TEMPLATE_UUID,
      });

      await diaryRepository.save(entry);
      createdCount += 1;
      console.log(`✅ Created template: "${template.title}"`);
    }

    console.log(`🎯 Finished seeding ${createdCount} diary templates.`);
    await connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding diary templates:', error);
    process.exit(1);
  }
}

seedDiaryTemplates();

