/** @jsxImportSource @emotion/react */
import { jsx } from '@emotion/react';
import DistributionStats from './DistributionStats';
import { useRouter } from 'next/router';
import { fieldsSlice } from '../../redux';
import { useSelector } from 'react-redux';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Bar as BarChart } from 'react-chartjs-2';
import moment from 'moment';
import { useWindowSize } from '../../hooks';
import Magnifier from 'react-magnifier';

function Chart({ data, type }) {
  const theme = useTheme();
  const upTablet = useMediaQuery(theme.breakpoints.up('tablet'));

  return (
    <BarChart
      css={{ height: upTablet ? 380 : '30vh' }}
      data={{
        labels: data.map(point => point.x),
        datasets: [
          {
            data: data.map(point => point.y)
          }
        ]
      }}
      options={{
        backgroundColor: ['rgba(63,78,162,0.7)'],
        maintainAspectRatio: false,
        indexAxis: type === 'categorical' ? 'y' : 'x',
        layout: {
          padding: 0
        },
        plugins: {
          title: {
            display: false
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: context => context.dataset.label,
              title: context =>
                type === 'accumulation'
                  ? moment(context[0].raw.x).format('MMM yyyy')
                  : context[0].raw.x
            }
          }
        },
        scales: {
          y: {},
          x: Object.assign(
            {
              grid: {
                display: false
                // drawTicks: false
              },
              // bounds: 'data',
              ticks: {
                minRotation: 0,
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 5
                // For a category axis, the val is the index so the lookup via getLabelForValue is needed
                // callback: function (val, index) {
                //   return moment(val).format('MMM yyyy');
                // }
              }
            },
            type === 'accumulation'
              ? {
                  type: type,
                  time: {
                    unit: 'month',
                    displayFormats: {
                      month: 'MMM yyyy'
                    }
                  }
                }
              : {}
          )
        }
      }}
    />
  );
}

function GraphContent({
  selectedView,
  selectedCohort,
  selectedInstance,
  views
}) {
  const windowSize = useWindowSize();
  const theme = useTheme();
  const upTablet = useMediaQuery(theme.breakpoints.up('tablet'));
  const width = 'calc(100vw - 72px)';
  const height = upTablet ? 396 : '30vh';
  const router = useRouter();
  const field = useSelector(state =>
    fieldsSlice.selectors.field(state, router.query.fieldID)
  );

  return (
    <div
      css={{
        width: '100%',
        overflow: 'hidden'
      }}
    >
      <motion.div
        css={{
          display: 'inline-flex',
          height: '100%'
        }}
        animate={{
          x:
            (windowSize.width - 72) *
            -1 *
            views.findIndex(g => g === selectedView)
        }}
        transition={{
          type: 'spring',
          damping: 20
        }}
      >
        {field.dataDistribution && (
          <motion.div
            animate={{
              opacity: selectedView === 'Data Distribution' ? 1 : 0,
              height:
                selectedView === 'Data Distribution'
                  ? upTablet
                    ? height
                    : 'auto'
                  : 0
            }}
            css={{
              width,
              display: 'flex',
              alignItems: 'center',
              flexDirection: upTablet ? 'row' : 'column'
            }}
          >
            <div css={{ width: '100%' }}>
              <Chart
                type={
                  typeof field.dataDistribution[0].x === 'string'
                    ? 'categorical'
                    : 'distribution'
                }
                data={field.dataDistribution.filter(
                  point =>
                    point.cohort === selectedCohort &&
                    point.instance === selectedInstance
                )}
              />
            </div>
            <DistributionStats />
          </motion.div>
        )}
        {field.dataAccumulation && (
          <motion.div
            css={{ width, height }}
            animate={{
              opacity: selectedView === 'Data Accumulation' ? 1 : 0
            }}
          >
            <Chart
              type='time'
              data={field.dataAccumulation.filter(
                point =>
                  point.cohort === selectedCohort &&
                  point.instance === selectedInstance
              )}
            />
          </motion.div>
        )}
        {field.sampleImage && (
          <motion.div
            css={{
              width,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'black',
              boxSizing: 'border-box',
              borderRadius: 4,
              overflow: 'hidden'
            }}
            animate={{
              padding: selectedView === 'Sample Image' ? '24' : 0,
              opacity: selectedView === 'Sample Image' ? 1 : 0,
              height:
                selectedView === 'Sample Image'
                  ? upTablet
                    ? '50vh'
                    : '55vw'
                  : 0
            }}
            transition={{
              delay: selectedView === 'Sample Image' ? 0 : 0.5,
              type: 'spring',
              damping: 20,
              opacity: {
                delay: 0
              }
            }}
          >
            <Magnifier
              mgWidth={upTablet ? 200 : 150}
              mgHeight={upTablet ? 200 : 150}
              src={`/images/fields/${field.sampleImage.src}`}
              height='100%'
              width='auto'
            />
            {/* <img
              css={{
                objectFit: 'contain',
                objectPosition: 'center center',
                height: '100%'
              }}
              src={`/images/fields/${field.sampleImage.src}`}
              alt={field.sampleImage.caption}
            /> */}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default GraphContent;
