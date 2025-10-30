<template lang="pug">
	el-dialog(
		v-model="dialogVisible"
		draggable
		title="回测图表"
		@close="closeDialog"
		width="90%")
		.echarts(ref="chartRef" style="width: 100%; height: 800px;")
</template>

<script setup>
import {defineProps, defineEmits, onMounted, ref, watch, reactive} from 'vue'
import * as echarts from "echarts";

const emit = defineEmits(['update:visible']);

const dialogVisible = ref(false)
const props = defineProps({
	visible: Boolean,
	dates: Array,
	values: Array
})

const form = reactive({
	dates: [],
	data: []
})

const chartRef = ref(null)


watch(() => props.visible, () => {
	dialogVisible.value = props.visible;
	form.dates = props.dates.map(function (item) {
		return item[0];
	});
	form.data = props.dates.map(function (item) {
		return [+item[1], +item[2], +item[3], +item[4]];
	});
	if (props.visible) init()
})
const closeDialog = () => {
	emit('close', false)
}

function calculateMA(dayCount, data) {
	let result = [];
	for (let i = 0, len = data.length; i < len; i++) {
		if (i < dayCount) {
			result.push('-');
			continue;
		}
		let sum = 0;
		for (let j = 0; j < dayCount; j++) {
			sum += +data[i - j][1];
		}
		result.push(sum / dayCount);
	}
	return result;
}

const init = () => {
	setTimeout(() => {
		const myChart = echarts.init(chartRef.value)
		const option = {
			legend: {
				data: ['MA5', 'MA10', 'MA20', 'MA30'],
				inactiveColor: '#777'
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					animation: false,
					type: 'cross',
					lineStyle: {
						color: '#376df4',
						width: 2,
						opacity: 1
					}
				}
			},
			xAxis: {
				type: 'category',
				data: props.dates,
				axisLine: { lineStyle: { color: '#8392A5' } }
			},
			yAxis: {
				scale: true,
				axisLine: { lineStyle: { color: '#8392A5' } },
				splitLine: { show: false }
			},
			grid: {
				bottom: 80
			},
			dataZoom: [
				{
					textStyle: {
						color: '#8392A5'
					},
					handleIcon:
						'path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
					dataBackground: {
						areaStyle: {
							color: '#8392A5'
						},
						lineStyle: {
							opacity: 0.8,
							color: '#8392A5'
						}
					},
					brushSelect: true
				},
				{
					type: 'inside'
				}
			],
			series: [
				{
					type: 'candlestick',
					name: 'Day',
					data: form.data,
					itemStyle: {
						color: '#FD1050',
						color0: '#0CF49B',
						borderColor: '#FD1050',
						borderColor0: '#0CF49B'
					}
				},
				// {
				// 	name: 'MA5',
				// 	type: 'line',
				// 	data: calculateMA(5, form.data),
				// 	smooth: true,
				// 	showSymbol: false,
				// 	lineStyle: {
				// 		width: 1
				// 	}
				// },
				{
					name: 'MA10',
					type: 'line',
					data: calculateMA(10, form.data),
					smooth: true,
					showSymbol: false,
					lineStyle: {
						width: 1
					}
				},
				{
					name: 'MA20',
					type: 'line',
					data: calculateMA(20, form.data),
					smooth: true,
					showSymbol: false,
					lineStyle: {
						width: 1
					}
				},
				{
					name: 'MA30',
					type: 'line',
					data: calculateMA(30, form.data),
					smooth: true,
					showSymbol: false,
					lineStyle: {
						width: 1
					}
				}
			]
		};
		myChart.setOption(option)
	}, 0)
}

</script>

<style lang="scss" scoped>

</style>
