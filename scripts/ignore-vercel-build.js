import { execSync } from 'node:child_process';

function getLastCommitMessage() {
  try {
    return execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
  } catch (error) {
    console.error('Could not read last commit message:', error?.message || error);
    return '';
  }
}

const message = getLastCommitMessage();
const ignoredPrefixes = [
  'Increment download count',
  'Update compact download badge',
];

const shouldIgnore = ignoredPrefixes.some((prefix) => message.startsWith(prefix));

if (shouldIgnore) {
  console.log(`Skipping Vercel build for automatic stats commit: ${message}`);
  process.exit(0);
}

console.log('Running Vercel build for regular project change.');
process.exit(1);
