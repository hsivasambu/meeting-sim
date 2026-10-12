import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';
import refresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import { dirname, relative, resolve } from 'node:path';

const mutations = ['initialState', 'drawEvent', 'resolve', 'release', 'callIt'];
const api = [
  ...mutations,
  'score',
  'earnedTitles',
  'displayCost',
  'formatCost',
  'previewResponse',
  'previewRelease',
  'getDrawCandidates',
  'ENGINE_LIMITS',
];
const boundary = {
  meta: { type: 'problem', schema: [], messages: { boundary: '{{reason}}' } },
  create(context) {
    const file = context.filename.replaceAll('\\', '/');
    const layer = (path) =>
      path.match(/\/(core\/engine|core\/content|store|ui|stage|sim)\//)?.[1];
    const from = layer(file);
    const report = (node, reason) =>
      context.report({ node, messageId: 'boundary', data: { reason } });
    function check(node) {
      const source = node.source?.value;
      if (typeof source !== 'string') return;
      if (
        file.endsWith('.test.ts') &&
        ['vitest', 'fast-check'].includes(source)
      )
        return;
      const target = source.startsWith('.')
        ? resolve(dirname(file), source).replaceAll('\\', '/')
        : source;
      const to = layer(target);
      const internal =
        source.startsWith('.') &&
        !relative(dirname(file), target)
          .replaceAll('\\', '/')
          .startsWith('../');
      if (from?.startsWith('core/') && !to?.startsWith('core/') && !internal)
        report(node, 'Core imports only core modules.');
      if (
        from === 'core/engine' &&
        to === 'core/content' &&
        !file.endsWith('/engine/index.ts')
      )
        report(node, 'Only engine/index.ts imports content.');
      if (
        from === 'core/content' &&
        to === 'core/engine' &&
        (!target.match(/\/engine\/types(?:\.ts)?$/) ||
          !(
            node.importKind === 'type' ||
            (node.specifiers?.length > 0 &&
              node.specifiers.every((s) => s.importKind === 'type'))
          ))
      )
        report(
          node,
          'Content imports only types directly from engine/types.ts.',
        );
      if (
        from &&
        !from.startsWith('core/') &&
        to === 'core/engine' &&
        !target.match(/\/engine\/index(?:\.ts)?$/)
      )
        report(node, 'External callers use engine/index.ts.');
      if (from !== 'sim' && to === 'sim')
        report(node, 'Simulation is never browser code.');
      if (from === 'store' && ['ui', 'stage'].includes(to))
        report(node, 'Store imports only core and store modules.');
      if (from === 'stage' && to === 'ui')
        report(node, 'Stage cannot import UI.');
      if (['ui', 'stage'].includes(from) && to === 'core/engine') {
        for (const specifier of node.specifiers ?? []) {
          if (
            specifier.type !== 'ImportSpecifier' ||
            mutations.includes(specifier.imported?.name)
          )
            report(
              node,
              'Only the store calls state-changing engine functions in the browser.',
            );
        }
      }
      if (from === 'stage' && to === 'store') {
        for (const specifier of node.specifiers ?? []) {
          if (
            specifier.type !== 'ImportSpecifier' ||
            !specifier.imported?.name.startsWith('use')
          )
            report(
              node,
              'Stage reads selector hooks only; never import actions or the writable store.',
            );
        }
      }
    }
    return {
      ImportDeclaration: check,
      ExportAllDeclaration: check,
      ExportNamedDeclaration(node) {
        check(node);
        if (file.endsWith('/engine/index.ts') && node.exportKind !== 'type') {
          const names = node.specifiers
            .filter((s) => s.exportKind !== 'type')
            .map((s) => s.exported.name);
          if (node.declaration?.id) names.push(node.declaration.id.name);
          if (node.declaration?.declarations)
            names.push(...node.declaration.declarations.map((d) => d.id.name));
          for (const name of names)
            if (!api.includes(name))
              report(
                node,
                'Only locked runtime API exports belong in engine/index.ts.',
              );
        }
      },
    };
  },
};
const forbidden = [
  {
    selector:
      "CallExpression[callee.object.name='Math'][callee.property.name='random']",
    message: 'Use the seeded core RNG or store seed entropy.',
  },
  {
    selector:
      "TSAsExpression:not([typeAnnotation.type='TSTypeReference'][typeAnnotation.typeName.name='const'])",
    message: 'Only as const is allowed.',
  },
  {
    selector: 'TSNonNullExpression',
    message: 'Handle missing values explicitly.',
  },
  { selector: 'TSEnumDeclaration', message: 'Use string-literal unions.' },
  {
    selector: 'ImportExpression',
    message: 'Use static imports so architecture boundaries are checked.',
  },
  {
    selector: "CallExpression[callee.name='require']",
    message: 'Use static imports.',
  },
  {
    selector: 'ExportAllDeclaration',
    message: 'Export explicit public names.',
  },
];
export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', '.tools/**', 'coverage/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { architecture: { rules: { boundary } } },
    rules: {
      'architecture/boundary': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: 'Use the seeded RNG.' },
      ],
      'no-restricted-syntax': ['error', ...forbidden],
      'no-restricted-exports': [
        'error',
        {
          restrictDefaultExports: {
            direct: true,
            named: true,
            defaultFrom: true,
            namedFrom: true,
            namespaceFrom: true,
          },
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': hooks, 'react-refresh': refresh },
    rules: {
      ...hooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'error',
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ['src/core/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-globals': [
        'error',
        'window',
        'document',
        'Date',
        'setTimeout',
        'setInterval',
        'requestAnimationFrame',
        'fetch',
        'localStorage',
        'crypto',
        'performance',
        'process',
        'console',
        'globalThis',
      ],
      'no-restricted-syntax': [
        'error',
        ...forbidden,
        {
          selector:
            'MemberExpression[property.name=/^(window|document|Date|setTimeout|setInterval|fetch|localStorage|crypto|performance)$/]',
          message: 'No browser, clock, timer or I/O access in core.',
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      'src/core/content/**',
      'src/core/engine/constants.ts',
      '**/*.test.ts',
      '**/fixtures/**',
    ],
    rules: { 'no-magic-numbers': ['error', { ignoreArrayIndexes: true }] },
  },
  {
    files: ['src/stage/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...forbidden,
        {
          selector:
            'CallExpression[callee.property.name=/^(setAssetStatus|start|finishTyping|choose|continue|release|callIt|restart|setState)$/]',
          message: 'Stage must never dispatch actions.',
        },
      ],
    },
  },
  {
    files: ['src/core/content/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...forbidden,
        {
          selector:
            'FunctionDeclaration, FunctionExpression, ArrowFunctionExpression',
          message: 'Content is plain data.',
        },
      ],
    },
  },
  {
    files: ['src/**/*.test.ts', 'src/core/engine/fixtures/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...forbidden.filter(
          (rule) => !rule.selector.startsWith('TSAsExpression'),
        ),
      ],
    },
  },
  {
    files: ['vite.config.ts', 'playwright.config.ts'],
    rules: { 'no-restricted-exports': 'off' },
  },
  {
    files: ['src/core/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^(?!\\.)',
              message: 'Core imports local core modules only.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/core/engine/**/*.ts'],
    ignores: ['src/core/engine/index.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^(?!\\.)|^\\..*/content(?:/|$)',
              message:
                'Engine internals receive ContentPack; only index.ts imports content.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/core/content/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^(?!\\.)|^\\..*/engine/(?!types(?:\\.ts)?$)',
              message: 'Content imports only local content and engine types.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/ui/**/*.{ts,tsx}', 'src/stage/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^\\..*/engine(?:/index(?:\\.ts)?)?$',
              importNames: mutations,
              message: 'Only store invokes browser engine mutations.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/core/**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^(?!\\.|vitest$|fast-check$)',
              message:
                'Core tests import only local core modules or approved test libraries.',
            },
          ],
        },
      ],
    },
  },
  { files: ['eslint.config.js'], languageOptions: { globals: globals.node } },
);
