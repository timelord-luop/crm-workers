<script setup>
import img1 from '@/assets/img/kehu.png'
import img2 from '@/assets/img/xiansuo.png'
import img3 from '@/assets/img/shangji.png'
import img4 from '@/assets/img/jine.png'
import arrow1 from '@/assets/img/arrow-up.png'
import arrow2 from '@/assets/img/arrow-down.png'
import {Sort, ArrowRightBold} from '@element-plus/icons-vue'
import AreaMapClient from "@/components/charts/AreaMapClient.vue";
import SalesLine from "@/components/charts/SalesLine.vue";
import PieRoseType from "@/components/charts/PieRoseType.vue";
import {ref} from "vue";

const showAreaPanel = ref(false);
const tableDataClient = ref([
	{id: 1, name: '北京XX科技有限公司', typeName: '电话回访', nextTime: '2026-03-08'},
	{id: 2, name: '上海XX贸易有限公司', typeName: '上门拜访', nextTime: '2026-03-12'},
	{id: 3, name: '广州XX制造有限公司', typeName: '微信联系', nextTime: '2026-03-01'},
	{id: 4, name: '成都飞鱼科技有限公司', typeName: '电话回访', nextTime: '2026-03-14'},
	{id: 5, name: '云南香格里拉云雾大酒店', typeName: '方案演示', nextTime: '2026-03-08'},
	{id: 2, name: '上海XX贸易有限公司', typeName: '上门拜访', nextTime: '2026-03-12'}
]);
const tableDataPayment = ref([
	{id: 1, name: '北京XX科技有限公司', typeName: '收款', money: '¥128,500.00', status: 1, statusName: '待收款', tagType: 'warning'},
	{id: 2, name: '成都XX广告有限公司', typeName: '收款', money: '¥89,600.00', status: 2, statusName: '已收款', tagType: 'success'},
	{id: 3, name: '杭州XX电商有限公司', typeName: '收款', money: '¥45,800.00', status: 3, statusName: '逾期', tagType: 'danger'},
	{id: 4, name: '云南香格里拉云雾大酒店', typeName: '付款', money: '¥1,230.00', status: 4, statusName: '已取消', tagType: 'info'},
	{id: 5, name: '千里香旗舰店', typeName: '付款', money: '¥1,230.00', status: 2, statusName: '已付款', tagType: 'success'},
	{id: 6, name: '贷款利息', typeName: '付款', money: '¥450.00', status: 2, statusName: '已付款', tagType: 'success'}
])
</script>

<template lang="pug">
	._main
		el-row(:gutter="20")
			el-col(:xs="24" :sm="12" :md="12" :lg="6" :xl="6")
				.card.card-head
					.line
						.label 客户总数
						el-avatar(:size="30" shape="square" :src="img1")
					.line
						.detail
							.count 2,584
							.trend.trend-up
								img(:src="arrow1")
								span 12.5% 较上月
						.circle(style="background-color: #165dff0d; color: #165dff") +10
			el-col(:xs="24" :sm="12" :md="12" :lg="6" :xl="6")
				.card.card-head
					.line
						.label 线索数量
						el-avatar(:size="30" shape="square" :src="img2")
					.line
						.detail
							.count 110
							.trend.trend-up
								img(:src="arrow1")
								span 5% 较上月
						.circle(style="background-color: #ff7d000d; color: #ff7d00") +36
			el-col(:xs="24" :sm="12" :md="12" :lg="6" :xl="6")
				.card.card-head
					.line
						.label 商机金额
						el-avatar(:size="30" shape="square" :src="img3")
					.line
						.detail
							.count 1,200,000
							.trend.trend-up
								img(:src="arrow1")
								span 8.4% 较上月
						.circle(style="background-color: #00b42a0d; color: #00b42a") +30万
			el-col(:xs="24" :sm="12" :md="12" :lg="6" :xl="6")
				.card.card-head
					.line
						.label 本月销售额
						el-avatar(:size="30" shape="square" :src="img4")
					.line
						.detail
							.count 135,000
							.trend.trend-down
								img(:src="arrow2")
								span 2.5% 较上月
						.circle(style="background-color: #f53f3f0d; color: #f53f3f") -2.23万
		el-row(:gutter="20")
			el-col(:xs="24" :sm="24" :md="24" :lg="12" :xl="12")
				.card.card-block
					._title 销售趋势分析
					sales-line
			el-col(:xs="24" :sm="24" :md="24" :lg="12" :xl="12")
				.card.card-block
					._title {{showAreaPanel ? '客户地区分布' : '商机阶段分布'}}
					._switch
						el-link(:icon="Sort" underline="never" @click="showAreaPanel = !showAreaPanel")
					area-map-client(v-if="showAreaPanel")
					pie-rose-type(v-else)
			el-col(:xs="24" :sm="24" :md="24" :lg="12" :xl="12")
				.card.card-block
					._title 待跟进客户
					._switch
						el-button(text :icon="ArrowRightBold")
					el-table(:data="tableDataClient" height="340" size="large" )
						el-table-column(label="客户名称" prop="name" min-width="180")
						el-table-column(label="跟进类型" prop="typeName" width="180")
						el-table-column(label="下次跟进时间" prop="nextTime")
							template(#default="{row}")
								el-tag(type="warning") {{row.nextTime}}
			el-col(:xs="24" :sm="24" :md="24" :lg="12" :xl="12")
				.card.card-block
					._title 近期收付款
					._switch
						el-button(text :icon="ArrowRightBold")
					el-table(:data="tableDataPayment" height="340" size="large" )
						el-table-column(label="客户名称" prop="name" min-width="180")
						el-table-column(label="类型" prop="typeName" width="180")
						el-table-column(label="金额" prop="money" width="180")
						el-table-column(label="当前状态" prop="status")
							template(#default="{row}")
								el-tag(:type="row.tagType") {{row.statusName}}
</template>

<style scoped lang="scss">
._main {
	overflow: hidden;
	box-sizing: border-box;
	padding: 5px 5px 0 5px;
	width: 100%;
	height: 100%;
	overflow-y: auto;
	scrollbar-width: none;
}
.card {
	background-color: var(--bg-color-main);
	box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.08);
	border-radius: 10px;
	margin-bottom: 20px;
}
.card-head {
	overflow: hidden;
	box-sizing: border-box;
	height: 150px;
	padding: 0 20px 20px 20px;
	display: flex;
	flex-direction: column;
	.line {
		flex: 1;
		display: flex;
		justify-content: space-between;
		align-items: center;
		.label {
			font-size: 16px;
			color: var(--text-color3);
		}
		.count {
			color: var(--text-color);
			font-size: 28px;
			font-weight: bold;
			font-family: Inter, system-ui, sans-serif;
		}
		.trend {
			margin-top: 5px;
			font-size: 14px;
			img {
				width: 16px;
				vertical-align: -2px;
			}
		}
		.el-icon {
			font-weight: bold;
		}
		.trend-up {
			color: #00b42a;
		}
		.trend-down {
			color: #f53f3f;
		}
		.circle {
			width: 62px;
			height: 62px;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			font-weight: bold;
		}
	}
	.el-avatar {
		background: initial;
	}
}
.card-block {
	height: 420px;
	overflow: hidden;
	box-sizing: border-box;
	padding: 15px;
	position: relative;
	._title {
		position: absolute;
		left: 20px;
		top: 20px;
		font-size: 16px;
		color: var(--text-color);
		z-index: 1;
	}
	._switch {
		position: absolute;
		right: 15px;
		top: 15px;
		font-size: 16px;
		color: var(--text-color);
		z-index: 1;
		:deep(.el-icon) {
			font-size: 18px;
		}
		.el-button {
			padding: 6px 10px;
		}
		.el-link {
			transform: rotate(90deg);
			margin-right: 5px;
			margin-top: 6px;
		}
	}
	.el-table {
		margin-top: 44px;
	}
}
</style>
