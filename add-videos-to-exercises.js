const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyAoDCmpyPRWZKKpoTznftSwZ7uOJjud4bI';

async function searchYouTubeVideo(query) {
  try {
    // Search query with exercise name + tutorial keywords
    const searchQuery = `${query} how to form tutorial exercise`;
    
    const url = `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&` +
      `q=${encodeURIComponent(searchQuery)}&` +
      `type=video&` +
      `videoEmbeddable=true&` +
      `maxResults=1&` +
      `key=${YOUTUBE_API_KEY}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`YouTube API error for "${query}":`, errorData);
      return null;
    }

    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      const embedUrl = `https://www.youtube.com/embed/${video.id.videoId}`;
      return {
        videoId: video.id.videoId,
        title: video.snippet.title,
        embedUrl: embedUrl,
        thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error searching YouTube for "${query}":`, error.message);
    return null;
  }
}

async function addVideosToExercises() {
  try {
    console.log('Starting to add videos to exercises...\n');

    // Get all exercises without videos
    const exercisesWithoutVideos = await prisma.exercise.findMany({
      where: {
        OR: [
          { videoUrl: null },
          { videoUrl: '' }
        ],
        isActive: true
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











