import {
  install,
  packageJson,
  template,
  deleteFiles,
  lines,
  makeDirs,
  json,
} from 'mrm-core';
import semver from 'semver';
import kleur from 'kleur';
import path from 'path';

const NodeVersion = '18';

function checkEnvironment() {
  const currentNodeVersion = semver.clean(process.version) as string;
  if (semver.lte(currentNodeVersion, `${NodeVersion}.0.0`)) {
    console.log(
      `${kleur.red(
        'error',
      )} @: expected node version "${NodeVersion}.x". Got "${currentNodeVersion}"`,
    );
    process.exit(1);
  }
}

function removeFiles() {
  deleteFiles([
    '.npmrc',
    'src/layouts/index.tsx',
    'src/layouts/index.less',
    'src/pages/index.tsx',
    'src/pages/docs.tsx',
    'src/assets/yay.jpg',
  ]);
}

function addFiles() {
  const files = [
    'src/layouts/default/index.tsx',
    'src/pages/home/index/index.tsx',
    'src/pages/home/index/styled.ts',
    'src/pages/document.ejs',
    'src/hooks/index.ts',
    'src/hooks/use-search-params.ts',
    'src/routes.ts',
    'src/utils/index.ts',
    'src/utils/merge-props.ts',
    'src/utils/merge-list.ts',
    'src/utils/parse-query.ts',
    'src/utils/storage.ts',
    'src/utils/toast.ts',
    'src/utils/yup.ts',
    'jest.config.js',
    'commitlint.config.js',
    '.umirc.local.ts',
    '.umirc.testing.ts',
    '.umirc.production.ts',
    '.umirc.ts',
    '.yarnrc',
    '.eslintrc.js',
    'src/app.tsx',
    'src/global.less',
  ];

  files.forEach((file) => {
    template(file, path.join(__dirname, 'templates', file)).apply().save();
  });
}

function addDirs() {
  makeDirs(['src/services', 'src/components', 'src/enums']);
}

function changeFiles() {
  lines('.prettierignore').add(['dist']).save();
  lines('.nvmrc').add([NodeVersion]).save();
  lines('.prettierrc.js')
    .add([
      "const fabric = require('@umijs/fabric');",
      '',
      'module.exports = {',
      '  ...fabric.prettier,',
      '};',
    ])
    .save();
  lines('typings.d.ts')
    .add([
      '',
      '// global variables',
      'declare const APP_NAME: string;',
      "declare const APP_ENV: 'production' | 'testing' | 'local';",
      'declare const API_URL: string;',
    ])
    .save();
  json('package.json')
    .merge({
      engines: {
        node: `${NodeVersion}.x`,
      },
      gitHooks: {
        'commit-msg': 'yarn commitlint --edit $1',
      },
    })
    .save();
}

function installDependencies() {
  install(
    [
      'ahooks',
      'styled-components',
      'query-string',
      'dayjs',
      'ts-pattern',
      'yup',
      '@ebay/nice-modal-react',
    ],
    {
      yarn: true,
      dev: false,
    },
  );
  install(
    [
      '@types/jest',
      '@types/styled-components',
      '@commitlint/config-conventional',
      '@commitlint/cli',
      '@umijs/fabric',
    ],
    {
      yarn: true,
      dev: true,
    },
  );
}

function changeScripts() {
  const pkg = packageJson();

  const postinstall = pkg.getScript('postinstall');
  const setup = pkg.getScript('setup');
  pkg
    .removeScript('dev')
    .removeScript('build')
    .removeScript('postinstall')
    .removeScript('setup')
    .removeScript('start')
    .save();
  pkg
    .setScript('start', 'yarn dev')
    .setScript('dev', 'UMI_ENV=local umi dev')
    .setScript('build:testing', 'UMI_ENV=testing umi build')
    .setScript('build:production', 'UMI_ENV=production umi build')
    .setScript('preinstall', 'npx only-allow yarn')
    .setScript('postinstall', postinstall)
    .setScript('setup', setup)
    .save();
}

module.exports = function task() {
  checkEnvironment();
  removeFiles();
  addFiles();
  addDirs();
  changeFiles();
  installDependencies();
  changeScripts();
};
