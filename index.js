#!/usr/bin/env node

const chalk = require('chalk');
const prompt = require('prompt');
const getVersion = require('./utils/version');
const getIssues = require('./utils/issues');
const createChangelog = require('./utils/changelog');
const commitAndTag = require('./utils/commit-and-tag');
const release = require('./utils/release');
const { error } = require('./utils/console-messages');

async function main(input) {
  const {
    versionOverride, append, issues, closeIssues, publish, token, dryRun,
  } = input;

  const version = await getVersion(versionOverride, append, dryRun);
  const issuesToInclude = await getIssues({
    issues, closeIssues, version, token,
  });
  const changelog = await createChangelog(version, issuesToInclude, dryRun);
  await commitAndTag(version, dryRun);

  if (publish) {
    release(version, changelog, token, dryRun);
  }
}

console.log(chalk.magenta('Github Releaser') + chalk.yellow(' by ') + chalk.cyan('Tom Hewitt'));
const schema = {
  properties: {
    versionOverride: {
      type: 'string',
      description: 'Specify a version (hit enter to skip)',
    },
    append: {
      type: 'string',
      description: 'Append to version (hit enter to skip)',
    },
    issues: {
      type: 'string',
      message: chalk.yellow('Issue labels are required!'),
      description: 'Issue labels (e.g. bug coded)',
    },
    closeIssues: {
      type: 'boolean',
      message: chalk.yellow('Must be one of \'true\', \'t\', \'false\', \'f\''),
      description: 'Close issues? (t/f)',
    },
    publish: {
      required: true,
      type: 'boolean',
      message: chalk.yellow('Must be one of \'true\', \'t\', \'false\', \'f\''),
      description: 'Push to Github? (t/f)',
    },
    token: {
      type: 'string',
      hidden: true,
      replace: '*',
      description: 'Github token (hit enter to skip)',
    },
    dryRun: {
      type: 'boolean',
      message: chalk.yellow('Must be one of \'true\', \'t\', \'false\', \'f\''),
      description: 'Dry run? (t/f)',
    },
  },
};
prompt.message = '';
prompt.delimeter = '';

prompt.start();

prompt.get(schema, (err, input) => {
  if (err) {
    error(`There was an error with prompt: ${err.message}`);
    process.exit(1);
  }

  const { publish, closeIssues, token } = input;

  if ((publish || closeIssues) && (!token || token.length === 0)) {
    error('No Github token has been specified');
    process.exit(1);
  }

  main(input);
});
