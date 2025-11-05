# Exercise Animations Guide

## Overview

The workout session component supports exercise animations to help users understand proper form. This guide explains how to add animations to your exercises.

## How It Works

1. **Primary Source**: Animations come from the backend API via the `mediaUrl` field in exercise data
2. **Fallback System**: If no `mediaUrl` is provided, the app uses a fallback mapping in `src/utils/exerciseAnimations.ts`

## Adding Animations

### Option 1: Backend API (Recommended)

Add `mediaUrl` to your exercise data in the backend. The app will automatically use it:

```json
{
  "id": 1,
  "name": "Squats",
  "mediaUrl": "https://your-cdn.com/animations/squats.mp4",
  ...
}
```

### Option 2: Fallback Mapping

Edit `src/utils/exerciseAnimations.ts` and add your animation URLs:

```typescript
const EXERCISE_ANIMATION_MAP: ExerciseAnimationMap = {
  'squats': 'https://your-cdn.com/animations/squats.mp4',
  'push ups': 'https://your-cdn.com/animations/push-ups.mp4',
  // Add more exercises...
};
```

## Where to Get Exercise Animations

### Free Resources

1. **Pexels Videos** (https://www.pexels.com/videos/)
   - Free stock videos
   - Search for "exercise", "workout", "fitness"
   - Download and host on your CDN

2. **Pixabay Videos** (https://pixabay.com/videos/)
   - Free stock videos
   - Good selection of fitness content

3. **Create Your Own**
   - Record simple form demonstrations
   - Use animation software (After Effects, Blender)
   - Keep videos short (5-15 seconds, looping)

### Paid Services

1. **Shutterstock** - Professional exercise videos
2. **Getty Images** - High-quality fitness content
3. **Custom Production** - Hire a videographer for branded content

### Hosting Your Animations

1. **Cloud Storage**
   - AWS S3 + CloudFront
   - Google Cloud Storage
   - Azure Blob Storage

2. **CDN Services**
   - Cloudflare
   - Fastly
   - Bunny CDN

3. **Video Hosting**
   - Vimeo (private videos)
   - YouTube (unlisted videos)
   - Mux (video API)

## Video Requirements

- **Format**: MP4 (H.264 codec recommended)
- **Duration**: 5-15 seconds (looping)
- **Resolution**: 720p minimum, 1080p preferred
- **Aspect Ratio**: 16:9 or 9:16 (portrait for mobile)
- **File Size**: Keep under 5MB for mobile performance

## Example: Adding a New Exercise Animation

1. **Get or create the video**
   ```bash
   # Example: squats.mp4
   ```

2. **Upload to your CDN**
   ```bash
   # Upload to S3, CloudFront, etc.
   # Get URL: https://cdn.example.com/animations/squats.mp4
   ```

3. **Add to fallback mapping** (if not in backend)
   ```typescript
   // src/utils/exerciseAnimations.ts
   const EXERCISE_ANIMATION_MAP: ExerciseAnimationMap = {
     'squats': 'https://cdn.example.com/animations/squats.mp4',
   };
   ```

4. **Or add to backend** (recommended)
   ```typescript
   // Backend: Update exercise in database
   {
     name: "Squats",
     mediaUrl: "https://cdn.example.com/animations/squats.mp4"
   }
   ```

## Testing

1. Open a workout session
2. Navigate to an exercise with an animation
3. Verify the video plays correctly
4. Check that it loops properly
5. Test on different devices/screen sizes

## Troubleshooting

### "No animation available" message

- Check that `mediaUrl` exists in exercise data
- Verify the URL is accessible (not 404)
- Check CORS settings if hosting externally
- Ensure video format is supported (MP4 recommended)

### Video not playing

- Check network connectivity
- Verify video URL is correct
- Check video codec compatibility
- Ensure video file isn't corrupted

### Performance issues

- Optimize video file size
- Use CDN for faster delivery
- Consider lower resolution for mobile
- Implement lazy loading if needed

## Current Default Exercises

The following exercises have placeholder mappings ready:

**Cardio:**
- Jump Rope
- High Knees
- Mountain Climbers

**Strength:**
- Squats
- Push Ups
- Bent Over Rows

**Mobility:**
- Worlds Greatest Stretch
- Hip Openers
- Thoracic Rotations

**Sports:**
- Agility Ladder
- Sprint Drills
- Plyometric Jumps

## Next Steps

1. ✅ Fallback system is set up
2. ⏳ Add your animation URLs to `exerciseAnimations.ts` or backend
3. ⏳ Upload videos to your CDN
4. ⏳ Test animations in the app
5. ⏳ Update backend to include `mediaUrl` for all exercises

