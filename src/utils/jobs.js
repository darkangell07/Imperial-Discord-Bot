/**
 * Get a random job from the provided jobs array
 * @param {Array} jobs - Array of job objects
 * @returns {Object} A random job
 */
export function getRandomJob(jobs) {
  return jobs[Math.floor(Math.random() * jobs.length)];
} 