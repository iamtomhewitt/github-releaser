const conventionalRecommendedBump = require('conventional-recommended-bump');

const fs = require('fs');
const { version } = require('../package.json');
const packageFile = require('../package.json');

const getVersion = (appendage) => new Promise(((resolve, reject) => {
  conventionalRecommendedBump({
    preset: 'angular',
  }, (error, recommendation) => {
    if (error) {
      reject(error);
    }

    const { releaseType } = recommendation;
    console.log(`Recommendation: ${recommendation.releaseType}`);

    let major = Number(version[0]);
    let minor = Number(version[2]);
    let patch = Number(version[4]);

    switch (releaseType) {
    case 'major':
      major += 1;
      break;
    case 'minor':
      minor += 1;
      break;
    case 'patch':
      patch += 1;
      break;
    default:
      throw new Error(`Invalid releaseType: ${releaseType}`);
    }

    let newVersion = `${major}.${minor}.${patch}`;

    if (appendage) {
      newVersion += appendage;
    }

    packageFile.version = newVersion;

    fs.writeFile(`${__dirname}/../package.json`, JSON.stringify(packageFile, null, 4), (err) => {
      if (err) {
        reject(err.message);
      }
      resolve(newVersion);
    });
  });
}));

module.exports = getVersion;
