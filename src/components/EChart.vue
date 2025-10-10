<template>
    <v-chart class="chart" :option="props.option" autoresize />
</template>


<script lang="ts" setup>
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
} from 'echarts/components';
import VChart, { THEME_KEY } from 'vue-echarts';
import { ref, provide } from 'vue';

use([
    CanvasRenderer,
    PieChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
]);

provide(THEME_KEY, 'light');


interface EChartProps{
    option:{}
}

const props = defineProps<EChartProps>()
</script>

<style scoped>
.chart {
    min-height: 200px;
    min-width: 200px;
}
</style>