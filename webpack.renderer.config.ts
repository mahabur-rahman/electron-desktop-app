import type { Configuration } from 'webpack';
import path from 'node:path';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

export const rendererConfig: Configuration & { devServer?: unknown } = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
  // Ensures changes to `src/index.html` trigger a full reload in dev.
  // (Webpack's HMR mostly targets JS/CSS; HTML template changes may not be watched by default.)
  devServer: {
    hot: true,
    liveReload: true,
    watchFiles: [path.resolve(__dirname, 'src/index.html')],
  },
};
