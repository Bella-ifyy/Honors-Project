import { createConnection } from "typeorm";
import { ExerciseEntity } from "../entities/exercise.entity";
import ormconfig from "../ormconfig";

const exercises = [
  {
    name: "Bench Press",
    description: "Lie on a bench and press a barbell upward",
    type: "strength",
    targetMuscles: "Chest, Triceps, Shoulders",
    equipment: "Barbell, Bench",
    difficulty: "Intermediate",
    instructions:
      "Lie flat on bench, grip bar slightly wider than shoulders, lower to chest, press up",
    isPreDefined: true,
  },
  {
    name: "Push-ups",
    description: "Classic bodyweight chest exercise",
    type: "strength",
    targetMuscles: "Chest, Triceps, Shoulders",
    equipment: "None",
    difficulty: "Beginner",
    instructions:
      "Keep body straight, lower until chest nearly touches ground, push back up",
    isPreDefined: true,
  },
  {
    name: "Dumbbell Flyes",
    description: "Chest isolation exercise with dumbbells",
    type: "strength",
    targetMuscles: "Chest",
    equipment: "Dumbbells, Bench",
    difficulty: "Intermediate",
    instructions:
      "Lie on bench, arms extended with slight bend, lower weights out to sides, squeeze back up",
    isPreDefined: true,
  },

  {
    name: "Pull-ups",
    description: "Bodyweight back exercise using bar",
    type: "strength",
    targetMuscles: "Back, Biceps",
    equipment: "Pull-up Bar",
    difficulty: "Intermediate",
    instructions:
      "Hang from bar, pull body up until chin over bar, lower with control",
    isPreDefined: true,
  },
  {
    name: "Deadlift",
    description: "Compound exercise for posterior chain",
    type: "strength",
    targetMuscles: "Back, Glutes, Hamstrings",
    equipment: "Barbell",
    difficulty: "Advanced",
    instructions:
      "Stand with feet hip-width, grip bar, lift by extending hips and knees",
    isPreDefined: true,
  },
  {
    name: "Bent-Over Row",
    description: "Rowing movement for back thickness",
    type: "strength",
    targetMuscles: "Back, Biceps",
    equipment: "Barbell",
    difficulty: "Intermediate",
    instructions: "Bend at hips, keep back straight, pull bar to lower chest",
    isPreDefined: true,
  },

  {
    name: "Squats",
    description: "Fundamental lower body exercise",
    type: "strength",
    targetMuscles: "Quadriceps, Glutes, Hamstrings",
    equipment: "Barbell",
    difficulty: "Intermediate",
    instructions:
      "Bar on shoulders, lower by bending knees and hips, keep chest up",
    isPreDefined: true,
  },
  {
    name: "Lunges",
    description: "Unilateral leg exercise",
    type: "strength",
    targetMuscles: "Quadriceps, Glutes",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    instructions:
      "Step forward, lower back knee toward ground, push back to start",
    isPreDefined: true,
  },
  {
    name: "Leg Press",
    description: "Machine-based leg exercise",
    type: "strength",
    targetMuscles: "Quadriceps, Glutes",
    equipment: "Leg Press Machine",
    difficulty: "Beginner",
    instructions: "Sit in machine, press platform away by extending legs",
    isPreDefined: true,
  },

  {
    name: "Overhead Press",
    description: "Press weight overhead from shoulders",
    type: "strength",
    targetMuscles: "Shoulders, Triceps",
    equipment: "Barbell",
    difficulty: "Intermediate",
    instructions:
      "Bar at shoulders, press straight overhead, lower with control",
    isPreDefined: true,
  },
  {
    name: "Lateral Raises",
    description: "Shoulder isolation exercise",
    type: "strength",
    targetMuscles: "Shoulders",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    instructions:
      "Arms at sides, raise dumbbells out to sides until parallel to ground",
    isPreDefined: true,
  },

  {
    name: "Bicep Curls",
    description: "Classic arm exercise",
    type: "strength",
    targetMuscles: "Biceps",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    instructions:
      "Arms extended, curl weights toward shoulders, lower with control",
    isPreDefined: true,
  },
  {
    name: "Tricep Dips",
    description: "Bodyweight tricep exercise",
    type: "strength",
    targetMuscles: "Triceps",
    equipment: "Dip Bar",
    difficulty: "Intermediate",
    instructions:
      "Support body on bars, lower by bending elbows, press back up",
    isPreDefined: true,
  },

  {
    name: "Running",
    description: "Outdoor or treadmill running",
    type: "cardio",
    targetMuscles: "Legs, Cardiovascular",
    equipment: "Treadmill (optional)",
    difficulty: "Beginner",
    instructions: "Maintain steady pace, focus on breathing rhythm",
    isPreDefined: true,
  },
  {
    name: "Cycling",
    description: "Stationary or outdoor cycling",
    type: "cardio",
    targetMuscles: "Legs, Cardiovascular",
    equipment: "Bike",
    difficulty: "Beginner",
    instructions: "Maintain consistent cadence, adjust resistance as needed",
    isPreDefined: true,
  },
  {
    name: "Jump Rope",
    description: "High-intensity cardio exercise",
    type: "cardio",
    targetMuscles: "Full Body, Cardiovascular",
    equipment: "Jump Rope",
    difficulty: "Intermediate",
    instructions: "Jump continuously, maintain rhythm, stay on balls of feet",
    isPreDefined: true,
  },
  {
    name: "Burpees",
    description: "Full body cardio movement",
    type: "cardio",
    targetMuscles: "Full Body",
    equipment: "None",
    difficulty: "Advanced",
    instructions:
      "Squat, jump back to plank, do push-up, jump feet forward, jump up",
    isPreDefined: true,
  },

  {
    name: "Yoga Flow",
    description: "Flowing yoga sequence",
    type: "flexibility",
    targetMuscles: "Full Body",
    equipment: "Yoga Mat",
    difficulty: "Beginner",
    instructions: "Move through poses with breath, hold each 5-10 breaths",
    isPreDefined: true,
  },
  {
    name: "Static Stretching",
    description: "Hold stretches for flexibility",
    type: "flexibility",
    targetMuscles: "Full Body",
    equipment: "None",
    difficulty: "Beginner",
    instructions: "Hold each stretch 20-30 seconds, breathe deeply",
    isPreDefined: true,
  },
  {
    name: "Foam Rolling",
    description: "Self-myofascial release",
    type: "flexibility",
    targetMuscles: "Full Body",
    equipment: "Foam Roller",
    difficulty: "Beginner",
    instructions: "Roll slowly over muscles, pause on tight spots",
    isPreDefined: true,
  },

  {
    name: "Basketball",
    description: "Basketball game or practice",
    type: "sports",
    targetMuscles: "Full Body, Cardiovascular",
    equipment: "Basketball, Court",
    difficulty: "Intermediate",
    instructions: "Play game or practice drills",
    isPreDefined: true,
  },
  {
    name: "Swimming",
    description: "Swimming laps or practice",
    type: "sports",
    targetMuscles: "Full Body, Cardiovascular",
    equipment: "Pool",
    difficulty: "Intermediate",
    instructions: "Swim laps using various strokes",
    isPreDefined: true,
  },
  {
    name: "Tennis",
    description: "Tennis match or practice",
    type: "sports",
    targetMuscles: "Full Body, Cardiovascular",
    equipment: "Racket, Court",
    difficulty: "Intermediate",
    instructions: "Play match or practice strokes",
    isPreDefined: true,
  },
];

async function seedExercises() {
  console.log("🌱 Starting exercise seeding...");

  try {
    const connection = await createConnection(ormconfig);
    console.log("✅ Database connected");

    const exerciseRepository = connection.getRepository(ExerciseEntity);

    const existingCount = await exerciseRepository.count();
    if (existingCount > 0) {
      console.log(
        `⚠️  Database already has ${existingCount} exercises. Skipping seed.`,
      );
      await connection.close();
      return;
    }

    console.log(`📝 Inserting ${exercises.length} exercises...`);
    for (const exercise of exercises) {
      await exerciseRepository.save(exercise);
    }

    console.log("✅ Successfully seeded exercises!");
    console.log(
      `   - Strength exercises: ${
        exercises.filter((e) => e.type === "strength").length
      }`,
    );
    console.log(
      `   - Cardio exercises: ${
        exercises.filter((e) => e.type === "cardio").length
      }`,
    );
    console.log(
      `   - Flexibility exercises: ${
        exercises.filter((e) => e.type === "flexibility").length
      }`,
    );
    console.log(
      `   - Sports exercises: ${
        exercises.filter((e) => e.type === "sports").length
      }`,
    );

    await connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding exercises:", error);
    process.exit(1);
  }
}

seedExercises();
