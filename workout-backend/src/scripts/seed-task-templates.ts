import { createConnection } from "typeorm";
import ormconfig from "../ormconfig";
import { TaskEntity } from "../entities/task.entity";

const SYSTEM_TEMPLATE_UUID = "00000000-0000-0000-0000-000000000000";

type TaskTemplate = {
  title: string;
  description?: string;
  priority?: string;
  category?: string;
  isRecurring?: boolean;
  recurringPattern?: string;
};

const taskTemplates: TaskTemplate[] = [
  {
    title: "Review weekly goals",
    description: "Take time to review and adjust your weekly objectives",
    priority: "High",
    category: "Personal",
    isRecurring: true,
    recurringPattern: "weekly",
  },
  {
    title: "Morning meditation",
    description: "Start your day with 10 minutes of mindfulness",
    priority: "Medium",
    category: "Health",
    isRecurring: true,
    recurringPattern: "daily",
  },
  {
    title: "Exercise session",
    description: "Dedicate time for physical activity",
    priority: "High",
    category: "Health",
    isRecurring: true,
    recurringPattern: "daily",
  },
  {
    title: "Read for 30 minutes",
    description: "Expand your knowledge through reading",
    priority: "Medium",
    category: "Learning",
    isRecurring: true,
    recurringPattern: "daily",
  },
  {
    title: "Plan tomorrow",
    description: "Review and plan tasks for the next day",
    priority: "Medium",
    category: "Personal",
    isRecurring: true,
    recurringPattern: "daily",
  },
  {
    title: "Weekly team meeting",
    description: "Sync with your team on progress and blockers",
    priority: "High",
    category: "Work",
    isRecurring: true,
    recurringPattern: "weekly",
  },
  {
    title: "Review monthly budget",
    description: "Track expenses and plan for the month ahead",
    priority: "High",
    category: "Personal",
    isRecurring: true,
    recurringPattern: "monthly",
  },
  {
    title: "Call family",
    description: "Stay connected with loved ones",
    priority: "Medium",
    category: "Personal",
    isRecurring: true,
    recurringPattern: "weekly",
  },
  {
    title: "Learn something new",
    description: "Dedicate time to learning a new skill or topic",
    priority: "Medium",
    category: "Learning",
  },
  {
    title: "Deep work session",
    description: "Focus on important work without distractions",
    priority: "High",
    category: "Work",
  },
];

async function seedTaskTemplates() {
  console.log("🌱 Starting task template seeding...");

  try {
    const connection = await createConnection({
      ...ormconfig,
      name: "seed-task-templates",
    });

    const taskRepository = connection.getRepository(TaskEntity);

    const existingTemplates = await taskRepository.find({
      where: { userUUID: SYSTEM_TEMPLATE_UUID },
    });

    if (existingTemplates.length > 0) {
      console.log(
        `⚠️  Found ${existingTemplates.length} existing templates. Clearing...`,
      );
      await taskRepository.delete({ userUUID: SYSTEM_TEMPLATE_UUID });
    }

    console.log(`📝 Creating ${taskTemplates.length} task templates...`);

    let createdCount = 0;
    for (const template of taskTemplates) {
      const task = taskRepository.create({
        title: template.title,
        description: template.description || null,
        priority: template.priority || "Medium",
        category: template.category || null,
        isCompleted: false,
        reminderSent: false,
        isRecurring: template.isRecurring || false,
        recurringPattern: template.recurringPattern || null,
        dueDate: null,
        recurringEndDate: null,
        userUUID: SYSTEM_TEMPLATE_UUID,
      });

      await taskRepository.save(task);
      createdCount += 1;
      console.log(`✅ Created template: "${template.title}"`);
    }

    console.log(`🎯 Finished seeding ${createdCount} task templates.`);
    await connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding task templates:", error);
    process.exit(1);
  }
}

seedTaskTemplates();
