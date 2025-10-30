<template lang="pug">
el-dialog(
    v-model="dialogVisible"
    draggable
    title="回测图表"
    @close="closeDialog"
    width="80%")
    .echarts(ref="chartRef" style="width: 100%; height: 600px;")
</template>

<script setup>
import {defineProps, defineEmits, onMounted, ref, watch} from 'vue'
import * as echarts from "echarts";

const emit = defineEmits(['update:visible']);

const dialogVisible = ref(false)
const props = defineProps({
	visible: Boolean,
	dates: Array,
	values: Array
})

const chartRef = ref(null)


watch(() => props.visible, () => {
	dialogVisible.value = props.visible;
	if (props.visible) init()
})
const closeDialog = () => {
	emit('close', false)
}
const init = () => {
  setTimeout(() => {
	  const myChart = echarts.init(chartRef.value)
	  const option = {
		  tooltip: {
			  trigger: 'axis'
		  },
		  grid: {
			  top: '50',    // 上边距
			  right: '50',  // 右边距
			  bottom: '50', // 下边距
			  left: '50'    // 左边距
		  },
		  xAxis: {
			  type: 'category',
			  data: props.dates
		  },
		  yAxis: {
			  type: 'value'
		  },
		  series: [
			  {
				  data: props.values,
				  type: 'line'
			  }
		  ]
	  }
	  myChart.setOption(option)
  }, 0)
}

</script>

<style lang="scss" scoped>

</style>
