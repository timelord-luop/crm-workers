<template>
	<div class="rose-chart-container">
		<!-- ECharts 挂载点 -->
		<div ref="chartRef" class="chart-wrapper"></div>
	</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
	// 允许外部传入数据，格式：{ name: string, value: number }[]
	stageData: {
		type: Array,
		default: () => [
			{ name: '初步接触', value: 18 },
			{ name: '需求确认', value: 24 },
			{ name: '方案报价', value: 30 },
			{ name: '谈判阶段', value: 16 },
			{ name: '已成交', value: 12 },
			{ name: '已流失', value: 8 }
		]
	}
})

const chartRef = ref(null)
let chartInstance = null

// 获取CSS变量值
const getCSSVar = (varName) => {
	return getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
}

// 获取图表配置
const getChartOptions = () => {
	// 为6个商机阶段配置平衡的颜色 - 既不太过鲜艳也不太过暗淡
	// 使用中度饱和度的配色，流失阶段使用中灰色
	const colorPalette = [
		'#5d8dc9', // 初步接触 - 明快的宝蓝色，有活力但不刺眼
		'#6bb36b', // 需求确认 - 适中的草绿色，代表进展顺利
		'#e6b450', // 方案报价 - 温暖的琥珀色，突出关键节点
		'#d27c7c', // 谈判阶段 - 柔和的珊瑚红，表现谈判的张力
		'#5fa8d4', // 已成交 - 清新的蔚蓝色，象征成功
		'#9e9e9e'  // 已流失 - 中性灰色，保持客观不突出
	]

	// 获取主题颜色
	const textColor = getCSSVar('--text-color') || '#303133'
	const textColor2 = getCSSVar('--text-color2') || '#494a4d'
	const border = getCSSVar('--border') || '#EEEEEE'
	const bgColorMain = getCSSVar('--bg-color-main') || '#FFFFFF'

	// 判断是否为深色主题
	const isDark = document.documentElement.classList.contains('dark')

	// 深色主题下微调颜色，保持明亮度
	const adjustedColors = isDark
		? colorPalette.map((color, index) => {
			// 所有颜色在深色模式下稍微提亮
			if (index === 5) return '#b8b8b8' // 流失阶段提亮一点
			return adjustColorForDark(color, 1.1)
		})
		: colorPalette

	return {
		tooltip: {
			trigger: 'item',
			formatter: '{b}<br/>商机数量: {c} ({d}%)',
			backgroundColor: bgColorMain,
			borderColor: border,
			textStyle: {
				color: textColor,
				fontSize: 12
			},
			extraCssText: 'box-shadow: 0 2px 8px var(--border-shadow); border-radius: 4px; padding: 8px 12px;'
		},
		legend: {
			orient: 'horizontal',
			bottom: 10,
			left: 'center',
			itemWidth: 10,
			itemHeight: 10,
			itemGap: 15,
			textStyle: {
				color: textColor2,
				fontSize: 12,
				fontWeight: 400
			},
			itemStyle: {
				borderRadius: 5
			}
		},
		series: [
			{
				name: '商机阶段分布',
				type: 'pie',
				radius: ['20%', '70%'],
				center: ['50%', '45%'],
				roseType: 'area',
				avoidLabelOverlap: true,
				itemStyle: {
					borderRadius: 8,
					borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.7)',
					borderWidth: 1.5
				},
				label: {
					show: true,
					position: 'outside',
					formatter: '{b}: {d}%',
					color: textColor2,
					fontSize: 11,
					lineHeight: 15,
					fontWeight: 400,
					avoidLabelOverlap: true
				},
				emphasis: {
					label: {
						show: true,
						fontWeight: 500,
						fontSize: 12,
						color: textColor
					},
					itemStyle: {
						shadowBlur: 12,
						shadowOffsetX: 0,
						shadowColor: 'rgba(0, 0, 0, 0.2)',
						borderColor: '#ffffff',
						borderWidth: 2
					}
				},
				data: props.stageData,
				color: adjustedColors
			}
		],
		backgroundColor: 'transparent',
		grid: {
			show: false,
			backgroundColor: 'transparent'
		}
	}
}

// 深色主题下调整颜色亮度
const adjustColorForDark = (color, factor = 1.15) => {
	if (color.startsWith('#')) {
		let r = parseInt(color.slice(1, 3), 16)
		let g = parseInt(color.slice(3, 5), 16)
		let b = parseInt(color.slice(5, 7), 16)

		r = Math.min(255, Math.floor(r * factor))
		g = Math.min(255, Math.floor(g * factor))
		b = Math.min(255, Math.floor(b * factor))

		return `rgb(${r}, ${g}, ${b})`
	}
	return color
}

// 更新图表
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

	const options = getChartOptions()
	chartInstance.setOption(options, { notMerge: false })
}

// 监听主题变化
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

// 监听数据变化
watch(() => props.stageData, () => {
	updateChart()
}, { deep: true })

const handleResize = () => {
	chartInstance?.resize()
}
</script>

<style scoped>
.rose-chart-container {
	width: 100%;
	height: 100%;
	min-height: 400px;
	background-color: transparent;
	display: flex;
	flex-direction: column;
}

.chart-header {
	display: flex;
	justify-content: flex-start;
	padding: 0;
	margin-bottom: 8px;
}

.chart-title {
	font-size: 14px;
	font-weight: 500;
	color: var(--text-color2);
	line-height: 1;
}

.chart-wrapper {
	flex: 1;
	width: 100%;
	min-height: 350px;
	position: relative;
}

/* 确保图表容器及画布透明 */
:deep(canvas) {
	background-color: transparent !important;
}

:deep(div[data-zr-dom-id]) {
	background-color: transparent !important;
}

:deep(.ec-extension) {
	display: none;
}
</style>
