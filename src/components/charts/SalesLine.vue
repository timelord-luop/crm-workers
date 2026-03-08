<template>
	<div class="sales-chart-container">
		<!-- 右上角切换区域 -->
		<div class="chart-header">
			<div class="time-switch">
				<button
					v-for="item in timeRanges"
					:key="item.value"
					:class="{ active: currentRange === item.value }"
					@click="handleRangeChange(item.value)"
				>
					{{ item.label }}
				</button>
			</div>
		</div>
		<!-- ECharts 挂载点 -->
		<div ref="chartRef" class="chart-wrapper"></div>
	</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

// 定义组件props（允许外部传入数据，提供默认模拟数据）
const props = defineProps({
	monthlyData: {
		type: Array,
		default: () => [6.5, 8, 9.2, 12.6, 10.1, 7.8, 8.8, 11, 11.5, 12.6, 13, 13.5]
	},
	quarterlyData: {
		type: Array,
		default: () => [450, 520, 610, 720]
	},
	yearlyData: {
		type: Array,
		default: () => [2850, 3200, 3780, 4200, 4800]
	}
})

const currentRange = ref('month')

const timeRanges = [
	{ label: '月度', value: 'month' },
	{ label: '季度', value: 'quarter' },
	{ label: '年度', value: 'year' }
]

let chartInstance = null
const chartRef = ref(null)

// 获取CSS变量值
const getCSSVar = (varName) => {
	return getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
}

// 根据当前范围和主题获取图表配置
const getChartOptions = (range) => {
	let xAxisData = []
	let seriesData = []

	switch (range) {
		case 'month':
			xAxisData = ['2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03']
			seriesData = props.monthlyData
			break
		case 'quarter':
			xAxisData = ['一季度', '二季度', '三季度', '四季度']
			seriesData = props.quarterlyData
			break
		case 'year':
			xAxisData = ['2019', '2020', '2021', '2022', '2023']
			seriesData = props.yearlyData
			break
	}

	// 获取当前主题颜色
	const textColor = getCSSVar('--text-color') || '#303133'
	const textColor2 = getCSSVar('--text-color2') || '#494a4d'
	const textColor3 = getCSSVar('--text-color3') || '#6F6F6F'
	const border = getCSSVar('--border') || '#EEEEEE'
	const bgColorMute = getCSSVar('--bg-color-mute') || '#F5F6F8'

	// 判断是否为深色主题
	const isDark = document.documentElement.classList.contains('dark')

	// 主色调使用 --el-color-primary 或默认的紫色
	const primaryColor = getCSSVar('--el-color-primary') || '#7354AF'
	// 浅色版本用于面积图
	const primaryLight = isDark ? 'rgba(115, 84, 175, 0.3)' : 'rgba(115, 84, 175, 0.1)'

	return {
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'line', // 将 type 从 'shadow' 改为 'line'，避免出现背景遮罩
				lineStyle: {
					color: border,
					type: 'dashed',
					width: 1
				}
				// 移除 shadowStyle 配置
			},
			formatter: '{b}<br/>销售额: {c} 万',
			backgroundColor: getCSSVar('--bg-color-main') || '#FFFFFF',
			borderColor: border,
			textStyle: {
				color: textColor
			},
			extraCssText: 'box-shadow: 0 2px 8px var(--border-shadow); border-radius: 4px;' // 添加阴影和圆角让tooltip更好看
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			top: '10%',
			containLabel: true
		},
		xAxis: {
			type: 'category',
			data: xAxisData,
			axisLabel: {
				fontWeight: 500,
				color: textColor2
			},
			axisLine: {
				show: true,
				lineStyle: {
					color: border
				}
			},
			axisTick: { show: false }
		},
		yAxis: {
			type: 'value',
			name: '销售额 (万)',
			nameTextStyle: { color: textColor3 },
			splitLine: {
				show: true,
				lineStyle: {
					color: border,
					type: 'dashed'
				}
			},
			axisLabel: { color: textColor2 }
		},
		series: [
			{
				name: '销售额',
				type: 'line',
				smooth: true,
				symbol: 'circle',
				symbolSize: 8,
				data: seriesData,
				lineStyle: {
					width: 3,
					color: primaryColor
				},
				areaStyle: {
					color: primaryLight
				},
				itemStyle: {
					color: primaryColor
				},
				emphasis: {
					focus: 'series',
					lineStyle: {
						width: 4,
						shadowBlur: 10,
						shadowColor: primaryColor + '80'
					}
				}
			}
		]
	}
}

const updateChart = () => {
	if (!chartRef.value) return

	if (!chartInstance) {
		if (window.echarts) {
			chartInstance = window.echarts.init(chartRef.value)
		} else {
			console.error('ECharts 未从 CDN 加载，请检查 index.html 中的 script 引入')
			return
		}
	}

	const options = getChartOptions(currentRange.value)
	chartInstance.setOption(options, { notMerge: false })
}

const handleRangeChange = (range) => {
	currentRange.value = range
}

// 监听主题变化（通过MutationObserver监听dark类的变化）
let themeObserver = null

onMounted(() => {
	if (!window.echarts) {
		console.warn('等待 ECharts 加载...')
		const timer = setInterval(() => {
			if (window.echarts) {
				clearInterval(timer)
				updateChart()
			}
		}, 100)
		setTimeout(() => clearInterval(timer), 10000)
	} else {
		updateChart()
	}

	window.addEventListener('resize', handleResize)

	// 监听主题变化
	themeObserver = new MutationObserver(() => {
		updateChart()
	})

	themeObserver.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['class']
	})
})

onBeforeUnmount(() => {
	if (chartInstance) {
		chartInstance.dispose()
		chartInstance = null
	}
	window.removeEventListener('resize', handleResize)
	if (themeObserver) {
		themeObserver.disconnect()
	}
})

// 监听切换和数据变化，更新图表
watch([currentRange, () => props.monthlyData, () => props.quarterlyData, () => props.yearlyData], () => {
	updateChart()
}, { deep: false })

const handleResize = () => {
	chartInstance?.resize()
}
</script>

<style scoped>
.sales-chart-container {
	width: 100%;
	height: 100%;
	min-height: 400px;
	background-color: var(--bg-color-main);
	display: flex;
	flex-direction: column;
}

.chart-header {
	display: flex;
	justify-content: flex-end;
	margin-bottom: 16px;
}

.time-switch {
	display: inline-flex;
	background-color: var(--bg-color-mute);
	border-radius: 30px;
	padding: 4px;
	border: 1px solid var(--border);
}

.time-switch button {
	border: none;
	background: transparent;
	padding: 6px 20px;
	font-size: 14px;
	font-weight: 500;
	color: var(--text-color2);
	border-radius: 30px;
	cursor: pointer;
	transition: all 0.2s ease;
	outline: none;
}

.time-switch button.active {
	background-color: var(--el-color-primary, #7354AF);
	color: white;
	box-shadow: 0 2px 8px var(--border-shadow);
}

.time-switch button:hover:not(.active) {
	background-color: var(--border);
	color: var(--text-color);
}

.chart-wrapper {
	flex: 1;
	width: 100%;
	min-height: 300px;
}

/* 确保图表容器背景透明，继承父级背景 */
:deep(canvas) {
	background-color: transparent;
}
</style>
