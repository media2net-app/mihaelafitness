-- SQL script to set profile pictures for Mihaela and Chiel
-- Replace the URLs with the actual image URLs after uploading the photos

-- For Mihaela
UPDATE users 
SET "profilePicture" = 'YOUR_MIHAELA_IMAGE_URL_HERE' 
WHERE email IN ('info@mihaelafitness.com', 'mihaela@mihaelafitness.com');

-- For Chiel
UPDATE users 
SET "profilePicture" = 'YOUR_CHIEL_IMAGE_URL_HERE' 
WHERE email = 'chiel@media2net.nl';

-- Verify the updates
SELECT id, name, email, "profilePicture" 
FROM users 
WHERE email IN ('info@mihaelafitness.com', 'mihaela@mihaelafitness.com', 'chiel@media2net.nl');


