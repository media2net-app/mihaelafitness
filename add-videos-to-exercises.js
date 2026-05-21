require('dotenv').config();
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
if (!YOUTUBE_API_KEY) {
  console.error('Missing YOUTUBE_API_KEY in .env or .env.local. Get one at https://console.cloud.google.com/apis/credentials');
  process.exit(1);
}

async function searchYouTubeWithQuery(searchQuery, apiKey) {
  const url = `https://www.googleapis.com/youtube/v3/search?` +
    `part=snippet&` +
    `q=${encodeURIComponent(searchQuery)}&` +
    `type=video&` +
    `videoEmbeddable=true&` +
    `maxResults=1&` +
    `key=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json();
    console.error(`YouTube API error:`, errorData?.error?.message || response.status);
    return null;
  }

  const data = await response.json();
  if (data.items && data.items.length > 0) {
    const video = data.items[0];
    return {
      videoId: video.id.videoId,
      title: video.snippet.title,
      embedUrl: `https://www.youtube.com/embed/${video.id.videoId}`,
      thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url
    };
  }
  return null;
}

async function searchYouTubeVideo(exerciseName) {
  const queries = [
    `${exerciseName} how to form tutorial exercise`,
    `${exerciseName} exercise tutorial`,
    `${exerciseName} workout`
  ];
  for (const q of queries) {
    const result = await searchYouTubeWithQuery(q, YOUTUBE_API_KEY);
    if (result) return result;
    await new Promise(r => setTimeout(r, 150));
  }
  return null;
}

async function addVideosToExercises() {
  try {
    console.log('Starting to add videos to exercises...\n');

    // Get all exercises without videos (active and inactive)
    const exercisesWithoutVideos = await prisma.exercise.findMany({
      where: {
        OR: [
          { videoUrl: null },
          { videoUrl: '' }
        ]
      },
      select: {
        id: true,
        name: true,
        videoUrl: true
      }
    });

    console.log(`Found ${exercisesWithoutVideos.length} exercises without videos.\n`);

    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < exercisesWithoutVideos.length; i++) {
      const exercise = exercisesWithoutVideos[i];
      console.log(`[${i + 1}/${exercisesWithoutVideos.length}] Processing: "${exercise.name}"...`);

      // Check if exercise already has a video (double check)
      if (exercise.videoUrl) {
        console.log(`  ✓ Already has video, skipping\n`);
        skippedCount++;
        continue;
      }

      // Search for video
      const videoResult = await searchYouTubeVideo(exercise.name);
      
      if (videoResult && videoResult.embedUrl) {
        try {
          // Update exercise with video URL
          await prisma.exercise.update({
            where: { id: exercise.id },
            data: { videoUrl: videoResult.embedUrl }
          });
          
          console.log(`  ✓ Video added: ${videoResult.title}`);
          console.log(`    URL: ${videoResult.embedUrl}\n`);
          successCount++;
          
          // Rate limiting: wait 100ms between requests to avoid hitting quota too fast
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`  ✗ Failed to update exercise: ${error.message}\n`);
          failCount++;
        }
      } else {
        console.log(`  ✗ No video found\n`);
        failCount++;
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Total exercises processed: ${exercisesWithoutVideos.length}`);
    console.log(`✓ Successfully added videos: ${successCount}`);
    console.log(`✗ Failed to add videos: ${failCount}`);
    console.log(`⊘ Skipped (already had video): ${skippedCount}`);

  } catch (error) {
    console.error('Error adding videos to exercises:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addVideosToExercises();











