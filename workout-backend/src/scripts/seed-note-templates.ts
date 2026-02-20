import { createConnection } from 'typeorm';
import ormconfig from '../ormconfig';
import { NoteEntity } from '../entities/note.entity';

const SYSTEM_TEMPLATE_UUID = '00000000-0000-0000-0000-000000000000';

type NoteTemplate = {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
};

const noteTemplates: NoteTemplate[] = [
  {
    title: 'Meeting Notes Template',
    content: `# Meeting Notes

## Date: [Date]
## Attendees: [Names]

### Agenda
- [ ] Item 1
- [ ] Item 2
- [ ] Item 3

### Discussion Points
- 

### Action Items
- [ ] 
- [ ] 
- [ ] 

### Next Steps
- `,
    category: 'Work',
    tags: ['meeting', 'work'],
  },
  {
    title: 'Project Planning Template',
    content: `# Project: [Project Name]

## Overview
[Brief description of the project]

## Goals
- [ ] Goal 1
- [ ] Goal 2
- [ ] Goal 3

## Timeline
- **Start Date:** [Date]
- **End Date:** [Date]
- **Milestones:**
  - [ ] Milestone 1
  - [ ] Milestone 2

## Resources Needed
- 
- 

## Notes
`,
    category: 'Work',
    tags: ['project', 'planning'],
  },
  {
    title: 'Daily Reflection Template',
    content: `# Daily Reflection - [Date]

## What went well today?
- 

## What could be improved?
- 

## What did I learn?
- 

## Gratitude
- 

## Tomorrow's Focus
- `,
    category: 'Personal',
    tags: ['reflection', 'daily'],
  },
  {
    title: 'Book Notes Template',
    content: `# [Book Title] by [Author]

## Key Takeaways
- 
- 
- 

## Favorite Quotes
> 

## Questions & Thoughts
- 

## Action Items
- [ ] 
- [ ] 
`,
    category: 'Learning',
    tags: ['books', 'learning'],
  },
  {
    title: 'Recipe Template',
    content: `# [Recipe Name]

## Ingredients
- 
- 
- 

## Instructions
1. 
2. 
3. 

## Notes
- Prep time: 
- Cook time: 
- Serves: 
`,
    category: 'Personal',
    tags: ['recipe', 'cooking'],
  },
  {
    title: 'Travel Planning Template',
    content: `# Trip to [Destination]

## Dates
- Departure: [Date]
- Return: [Date]

## Accommodation
- Location: 
- Booking reference: 

## Itinerary
### Day 1
- 

### Day 2
- 

## Packing List
- [ ] 
- [ ] 
- [ ] 

## Important Info
- Emergency contacts: 
- Travel insurance: 
- Documents needed: 
`,
    category: 'Personal',
    tags: ['travel', 'planning'],
  },
];

async function seedNoteTemplates() {
  console.log('🌱 Starting note template seeding...');

  try {
    const connection = await createConnection({
      ...ormconfig,
      name: 'seed-note-templates',
    });

    const noteRepository = connection.getRepository(NoteEntity);

    const existingTemplates = await noteRepository.find({
      where: { userUUID: SYSTEM_TEMPLATE_UUID },
    });

    if (existingTemplates.length > 0) {
      console.log(`⚠️  Found ${existingTemplates.length} existing templates. Clearing...`);
      await noteRepository.delete({ userUUID: SYSTEM_TEMPLATE_UUID });
    }

    console.log(`📝 Creating ${noteTemplates.length} note templates...`);

    let createdCount = 0;
    for (const template of noteTemplates) {
      const note = noteRepository.create({
        title: template.title,
        content: template.content,
        category: template.category || null,
        tags: template.tags || [],
        isFavorite: false,
        userUUID: SYSTEM_TEMPLATE_UUID,
      });

      await noteRepository.save(note);
      createdCount += 1;
      console.log(`✅ Created template: "${template.title}"`);
    }

    console.log(`🎯 Finished seeding ${createdCount} note templates.`);
    await connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding note templates:', error);
    process.exit(1);
  }
}

seedNoteTemplates();
