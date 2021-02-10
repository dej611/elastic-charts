/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { boolean, color, number, select } from '@storybook/addon-knobs';
import React from 'react';

import { switchTheme } from '../../.storybook/theme_service';
import { Axis, BarSeries, Chart, Position, ScaleType, Settings, DARK_THEME, LIGHT_THEME } from '../../src';
import { SeededDataGenerator } from '../../src/mocks/utils';
import { getChartRotationKnob } from '../utils/knobs';

const dataGen = new SeededDataGenerator();
function generateDataWithAdditional(num: number) {
  return [...dataGen.generateSimpleSeries(num), { x: num, y: 0.25, g: 0 }, { x: num + 1, y: 8, g: 0 }];
}
const frozenDataSmallVolume = generateDataWithAdditional(10);
const frozenDataMediumVolume = generateDataWithAdditional(50);
const frozenDataHighVolume = generateDataWithAdditional(1500);

const frozenData: { [key: string]: any[] } = {
  s: frozenDataSmallVolume,
  m: frozenDataMediumVolume,
  h: frozenDataHighVolume,
};

export const Example = () => {
  const darkmode = boolean('darkmode', true);
  const className = darkmode ? 'story-chart-dark' : 'story-chart';
  switchTheme(darkmode ? 'dark' : 'light');

  const showValueLabel = boolean('show value label', true);
  const isAlternatingValueLabel = boolean('alternating value label', false);
  const isValueContainedInElement = boolean('contain value label within bar element', false);
  const hideClippedValue = boolean('hide clipped value', false);

  const displayValueSettings = {
    showValueLabel,
    isAlternatingValueLabel,
    isValueContainedInElement,
    hideClippedValue,
  };

  const debug = boolean('debug', false);
  const useInverted = boolean('textInverted', false);
  const valueColor = color('value color', '#fff');
  const seriesColor = boolean('use series color', false);
  const borderColor = color('value border color', 'rgba(0,0,0,1)');
  const borderSize = number('value border width', 1.5);

  const fixedFontSize = number('Fixed font size', 10);
  const useFixedFontSize = boolean('Use fixed font size', false);

  const maxFontSize = number('Max font size', 25);
  const minFontSize = number('Min font size', 10);

  const offsetX = number('offsetX', 0);
  const offsetY = number('offsetY', 0);
  const putLabelOutside = boolean('Set label outside', false);

  const chartRotation = getChartRotationKnob();

  const isChartRotated = Math.abs(chartRotation) === 90;
  const isChartFlipped = chartRotation === 180;
  const offsetYWithDirectionFactor = isChartFlipped ? -1 : 1;
  const offsetXWithDirectionFactor = isChartRotated && chartRotation > 0 ? -1 : 1;

  // Use the function version of it for putOutsideLabel option
  const offsetXValue = putLabelOutside
    ? ({ width }: { width: number }) => (isChartRotated ? offsetXWithDirectionFactor * width : 0) + offsetX
    : offsetX;

  const offsetYValue = putLabelOutside
    ? ({ height }: { height: number }) => (isChartRotated ? 0 : offsetYWithDirectionFactor * height) + offsetY
    : offsetY;

  const theme = {
    barSeriesStyle: {
      displayValue: {
        fontSize: useFixedFontSize ? fixedFontSize : { max: maxFontSize, min: minFontSize },
        fontFamily: "'Open Sans', Helvetica, Arial, sans-serif",
        fontStyle: 'normal',
        padding: 0,
        fill: useInverted
          ? { textInverted: useInverted, textContrast: true, textBorder: borderSize }
          : { color: seriesColor ? 'series' : valueColor, borderColor, borderWidth: borderSize },
        offsetX: offsetXValue,
        offsetY: offsetYValue,
        alignment: {
          horizontal: select(
            'Horizontal alignment',
            {
              Default: undefined,
              Left: 'left',
              Center: 'center',
              Right: 'right',
            },
            undefined,
          ),
          vertical: select(
            'Vertical alignment',
            {
              Default: undefined,
              Top: 'top',
              Middle: 'middle',
              Bottom: 'bottom',
            },
            undefined,
          ),
        },
      },
    },
  };

  const dataSize = select(
    'data volume size',
    {
      'small volume': 's',
      'medium volume': 'm',
      'high volume': 'h',
    },
    's',
  );
  const data = frozenData[dataSize];

  const isSplitSeries = boolean('split series', false);
  const isStackedSeries = boolean('stacked series', false);

  const splitSeriesAccessors = isSplitSeries ? ['g'] : undefined;
  const stackAccessors = isStackedSeries ? ['x'] : undefined;
  return (
    <Chart renderer="canvas" className={className}>
      <Settings
        baseTheme={darkmode ? DARK_THEME : LIGHT_THEME}
        theme={theme}
        debug={debug}
        rotation={chartRotation}
        showLegend
        showLegendExtra
      />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(1)} />
      <BarSeries
        id="bars"
        displayValueSettings={displayValueSettings}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={splitSeriesAccessors}
        stackAccessors={stackAccessors}
        data={data}
      />
      <BarSeries
        id="bars2"
        displayValueSettings={displayValueSettings}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={['x']}
        splitSeriesAccessors={['g']}
        data={[
          { x: 0, y: 2, g: 'a' },
          { x: 1, y: 7, g: 'a' },
          { x: 2, y: 3, g: 'a' },
          { x: 3, y: 6, g: 'a' },
          { x: 0, y: 4, g: 'b' },
          { x: 1, y: 5, g: 'b' },
          { x: 2, y: 8, g: 'b' },
          { x: 3, y: 2, g: 'b' },
        ]}
      />
    </Chart>
  );
};
