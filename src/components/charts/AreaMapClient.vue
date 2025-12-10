<template>
	<div style="width:100%;height:100%;position:relative;">
		<!-- 返回按钮（省级和市级时显示） -->
		<button
			v-if="currentLevel !== 'country'"
			@click="handleBack"
			class="back-btn"
			:title="currentLevel === 'province' ? '返回全国' : '返回省份'"
		>
			← {{ currentLevel === 'province' ? '返回全国' : '返回省份' }}
		</button>

		<div ref="chartRef" style="width:100%;height:100%;"></div>
	</div>
</template>

<script setup>
import {onMounted, onBeforeUnmount, ref, reactive, watch, computed} from "vue";
import {useThemeStore} from "@/store/sysStore.js";

const chartRef = ref(null);
let chart = null;
let currentLevel = ref("country"); // country/province/city
let currentProvince = ref(null); // 当前省份信息
let currentCity = ref(null); // 当前城市信息
const themeStore = useThemeStore();
const currentTheme = computed(() => themeStore.theme)
watch(() => themeStore.theme, () => {
		toggleTheme()
	}
)
// ---------- mock 数据 ----------
const mockData = {
	// 省份数据
	'110000': 450, // 北京市
	'120000': 280, // 天津市
	'130000': 320, // 河北省
	'140000': 240, // 山西省
	'150000': 190, // 内蒙古自治区
	'210000': 380, // 辽宁省
	'220000': 220, // 吉林省
	'230000': 260, // 黑龙江省
	'310000': 520, // 上海市
	'320000': 480, // 江苏省
	'330000': 420, // 浙江省
	'340000': 350, // 安徽省
	'350000': 380, // 福建省
	'360000': 270, // 江西省
	'370000': 460, // 山东省
	'410000': 410, // 河南省
	'420000': 340, // 湖北省
	'430000': 310, // 湖南省
	'440000': 550, // 广东省
	'450000': 290, // 广西壮族自治区
	'460000': 180, // 海南省
	'500000': 330, // 重庆市
	'510000': 390, // 四川省
	'520000': 230, // 贵州省
	'530000': 250, // 云南省
	'540000': 120, // 西藏自治区
	'610000': 300, // 陕西省
	'620000': 210, // 甘肃省
	'630000': 140, // 青海省
	'640000': 160, // 宁夏回族自治区
	'650000': 190, // 新疆维吾尔自治区
	'710000': 90,  // 台湾省
	'810000': 60,  // 香港特别行政区
	'820000': 40,  // 澳门特别行政区

	// 直辖市和特别行政区的市级数据（对于直辖市，市级和省级相同）
	'110100': 450, // 北京市
	'120100': 280, // 天津市
	'310100': 520, // 上海市
	'500100': 330, // 重庆市
	'810100': 60,  // 香港
	'820100': 40,  // 澳门

	// 广东省城市
	'440100': 180, // 广州市
	'440300': 210, // 深圳市
	'440400': 75,  // 珠海市
	'440500': 65,  // 汕头市
	'440600': 85,  // 佛山市
	'440700': 45,  // 江门市
	'440800': 55,  // 湛江市
	'440900': 50,  // 茂名市
	'441200': 40,  // 肇庆市
	'441300': 70,  // 惠州市
	'441400': 35,  // 梅州市
	'441500': 30,  // 汕尾市
	'441600': 25,  // 河源市
	'441700': 20,  // 阳江市
	'441800': 25,  // 清远市
	'441900': 95,  // 东莞市
	'442000': 60,  // 中山市
	'445100': 55,  // 潮州市
	'445200': 40,  // 揭阳市
	'445300': 35,  // 云浮市

	// 浙江省城市
	'330100': 150, // 杭州市
	'330200': 120, // 宁波市
	'330300': 85,  // 温州市
	'330400': 60,  // 嘉兴市
	'330500': 55,  // 湖州市
	'330600': 75,  // 绍兴市
	'330700': 50,  // 金华市
	'330800': 40,  // 衢州市
	'330900': 35,  // 舟山市
	'331000': 45,  // 台州市
	'331100': 30,  // 丽水市

	// 北京市区县
	'110101': 120, // 东城区
	'110102': 135, // 西城区
	'110105': 150, // 朝阳区
	'110106': 110, // 丰台区
	'110107': 85,  // 石景山区
	'110108': 165, // 海淀区
	'110109': 75,  // 门头沟区
	'110111': 90,  // 房山区
	'110112': 95,  // 通州区
	'110113': 80,  // 顺义区
	'110114': 70,  // 昌平区
	'110115': 65,  // 大兴区
	'110116': 55,  // 怀柔区
	'110117': 45,  // 平谷区
	'110118': 40,  // 密云区
	'110119': 35,  // 延庆区

	// 广州市区县
	'440103': 45,  // 荔湾区
	'440104': 55,  // 越秀区
	'440105': 60,  // 海珠区
	'440106': 70,  // 天河区
	'440111': 40,  // 白云区
	'440112': 35,  // 黄埔区
	'440113': 30,  // 番禺区
	'440114': 25,  // 花都区
	'440115': 20,  // 南沙区
	'440117': 15,  // 从化区
	'440118': 15,  // 增城区

	// 深圳市辖区
	'440303': 65,  // 罗湖区
	'440304': 75,  // 福田区
	'440305': 85,  // 南山区
	'440306': 60,  // 宝安区
	'440307': 55,  // 龙岗区
	'440308': 50,  // 盐田区
	'440309': 45,  // 龙华区
	'440310': 40,  // 坪山区
	'440311': 35,  // 光明区

	// 重庆市辖区
	'500101': 55,  // 万州区
	'500102': 45,  // 涪陵区
	'500103': 65,  // 渝中区
	'500104': 40,  // 大渡口区
	'500105': 50,  // 江北区
	'500106': 55,  // 沙坪坝区
	'500107': 45,  // 九龙坡区
	'500108': 50,  // 南岸区
	'500109': 35,  // 北碚区
	'500110': 30,  // 綦江区
	'500111': 25,  // 大足区
	'500112': 40,  // 渝北区
	'500113': 35,  // 巴南区
	'500114': 30,  // 黔江区
	'500115': 25,  // 长寿区
	'500116': 20,  // 江津区
	'500117': 20,  // 合川区
	'500118': 15,  // 永川区
	'500119': 15,  // 南川区
	'500120': 10,  // 璧山区
	'500151': 10,  // 铜梁区
	'500152': 8,   // 潼南区
	'500153': 7,   // 荣昌区
	'500154': 6,   // 开州区
	'500155': 5,   // 梁平区
	'500156': 4,   // 武隆区
};

// ---------- 直辖市和特别行政区列表 ----------
const municipalities = ['110000', '120000', '310000', '500000', '810000', '820000'];

// ---------- 主题配置 ----------
const themeConfig = {
	light: {
		backgroundColor: "#ffffff",
		textColor: "#333",
		mapAreaColor: "#f5f5f5",
		mapBorderColor: "#ccc",
		visualMapColors: ["#E3F2FD", "#64B5F6", "#0D47A1"],
		scatterColor: "#FF5722",
		buttonBg: "rgba(255,255,255,0.9)",
		buttonBorder: "#ddd",
		buttonText: "#333"
	},
	dark: {
		backgroundColor: "#1a1a1a",
		textColor: "#e0e0e0",
		mapAreaColor: "#2d2d2d",
		mapBorderColor: "#555",
		visualMapColors: ["#0D1B2A", "#1B3A4B", "#1864ab"],
		scatterColor: "#FF6B6B",
		buttonBg: "rgba(40,40,40,0.9)",
		buttonBorder: "#666",
		buttonText: "#e0e0e0"
	}
};

// ---------- 缓存已加载的地图数据 ----------
const loadedMaps = reactive(new Map()); // key: mapName, value: geoJSON data

// ---------- 工具函数 ----------
function getCurrentTheme() {
	return themeConfig[currentTheme.value];
}

function safeMax(arr) {
	if (!Array.isArray(arr) || arr.length === 0) return 1;
	const m = Math.max(...arr.map(i => (i && typeof i.value === "number" ? i.value : 0)));
	return (isFinite(m) && m > 0) ? m : 1;
}

// 根据adcode判断层级
function getLevelByAdcode(adcode) {
	if (!adcode || typeof adcode !== 'string') return 'unknown';

	if (adcode.endsWith('0000')) return 'province';
	if (adcode.endsWith('00')) return 'city';
	return 'district';
}

// 获取省份adcode（前2位+4个0）
function getProvinceAdcode(adcode) {
	if (!adcode) return '';
	return adcode.substring(0, 2) + '0000';
}

// 获取城市adcode（前4位+2个0）
function getCityAdcode(adcode) {
	if (!adcode) return '';
	return adcode.substring(0, 4) + '00';
}

// 判断是否为直辖市
function isMunicipality(adcode) {
	return municipalities.includes(adcode);
}

// 根据adcode过滤数据
function filterDataByAdcode(adcodePattern, level) {
	const result = [];

	for (const [key, value] of Object.entries(mockData)) {
		let match = false;

		if (level === 'province') {
			// 省份数据：adcode以0000结尾
			match = key.endsWith('0000');
		} else if (level === 'city') {
			// 城市数据：属于指定省份且以00结尾但不是省份
			const provinceCode = getProvinceAdcode(key);
			match = provinceCode === adcodePattern && key.endsWith('00') && !key.endsWith('0000');
		} else if (level === 'district') {
			// 区县数据：属于指定城市且不是城市或省份
			const cityCode = getCityAdcode(key);
			match = cityCode === adcodePattern && !key.endsWith('00');
		}

		if (match) {
			result.push({
				adcode: key,
				value: value,
				name: '' // 名称将在加载地图数据后填充
			});
		}
	}

	return result;
}

// 为直辖市获取区县数据
function getMunicipalityDistrictData(adcode) {
	const result = [];

	// 直辖市的区县数据以省份adcode前4位+非00结尾的adcode
	const prefix = adcode.substring(0, 2); // 11 for 北京市

	for (const [key, value] of Object.entries(mockData)) {
		// 区县数据：以省份前2位开头，不以00结尾，且不是省份数据
		if (key.startsWith(prefix) && !key.endsWith('00') && !key.endsWith('0000')) {
			result.push({
				adcode: key,
				value: value,
				name: ''
			});
		}
	}

	return result;
}

// ---------- 加载 geojson 并注册地图 ----------
async function loadGeoJSON(adcode, mapName) {
	// 如果已加载，返回缓存的数据
	if (loadedMaps.has(mapName)) {
		return loadedMaps.get(mapName);
	}

	try {
		// 尝试加载完整版
		let url = `https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`;
		let res = await fetch(url);

		if (!res.ok) {
			// 尝试加载标准版
			url = `https://geo.datav.aliyun.com/areas_v3/bound/${adcode}.json`;
			res = await fetch(url);
		}

		if (!res.ok) {
			// 尝试加载区县版（如果存在）
			if (!adcode.endsWith('00')) {
				const parentAdcode = getCityAdcode(adcode);
				url = `https://geo.datav.aliyun.com/areas_v3/bound/${parentAdcode}_full.json`;
				res = await fetch(url);
			}
		}

		if (!res.ok) throw new Error("GeoJSON load failed");

		const data = await res.json();
		echarts.registerMap(mapName, data);
		loadedMaps.set(mapName, data);
		return data;
	} catch (e) {
		console.warn(`loadGeoJSON error for ${adcode} (${mapName}):`, e);
		return null;
	}
}

// ---------- 主题切换 ----------
function toggleTheme() {
	currentTheme.value = currentTheme.value === "light" ? "dark" : "light";
	// 重新渲染当前地图
	rerenderCurrentMap();
}

function rerenderCurrentMap() {
	if (!chart) return;

	if (currentLevel.value === "country") {
		renderCountryMap(false);
	} else if (currentLevel.value === "province" && currentProvince.value) {
		switchProvince(currentProvince.value.adcode, currentProvince.value.name);
	} else if (currentLevel.value === "city" && currentCity.value && currentProvince.value) {
		switchCity(currentCity.value.adcode, currentCity.value.name, currentProvince.value.adcode);
	}
}

// ---------- 初始化 ----------
onMounted(async () => {
	// 使用当前主题初始化图表
	chart = echarts.init(chartRef.value, currentTheme.value, { renderer: "canvas" });

	// 载入全国geojson并渲染
	await loadGeoJSON("100000", "china");
	renderCountryMap();

	window.addEventListener("resize", () => {
		chart && chart.resize();
	});
});

onBeforeUnmount(() => {
	if (chart) {
		chart.dispose();
		chart = null;
	}
});

// ---------- 设置点击事件 ----------
function setupClickEvents(level) {
	if (!chart) return;

	chart.off("click");
	chart.on("click", async (params) => {
		if (!params || !params.name || !params.data) return;

		const data = params.data;

		if (level === "country") {
			// 全国 -> 省份
			if (data.adcode && data.adcode.endsWith('0000')) {
				await switchProvince(data.adcode, data.name);
			}
		} else if (level === "province") {
			// 省份 -> 城市
			if (data.adcode && data.adcode.endsWith('00') && !data.adcode.endsWith('0000')) {
				await switchCity(data.adcode, data.name, currentProvince.value.adcode);
			}
		}
		// 城市级别不再向下钻取
	});
}

// ---------- 返回 ----------
function handleBack() {
	if (currentLevel.value === "province") {
		renderCountryMap(true);
	} else if (currentLevel.value === "city") {
		switchProvince(currentProvince.value.adcode, currentProvince.value.name);
	}
}

// ---------- 渲染全国 ----------
async function renderCountryMap(withAnimation = false) {
	currentLevel.value = "country";
	currentProvince.value = null;
	currentCity.value = null;

	if (!chart) return;
	chart.clear();

	const theme = getCurrentTheme();

	// 获取省份数据
	const provinceData = filterDataByAdcode('', 'province');
	const maxVal = safeMax(provinceData);

	// 获取全国地图数据，填充省份名称
	const chinaMap = loadedMaps.get('china');
	if (chinaMap && chinaMap.features) {
		// 创建adcode到名称的映射
		const nameMap = {};
		chinaMap.features.forEach(feature => {
			const props = feature.properties;
			if (props && props.adcode) {
				nameMap[props.adcode] = props.name;
			}
		});

		// 填充省份名称
		provinceData.forEach(item => {
			item.name = nameMap[item.adcode] || item.adcode;
		});
	}

	const option = {
		backgroundColor: theme.backgroundColor,
		animation: true,
		animationDuration: withAnimation ? 800 : 500,
		animationEasing: "cubicOut",
		tooltip: {
			trigger: "item",
			backgroundColor: theme.buttonBg,
			borderColor: theme.buttonBorder,
			textStyle: { color: theme.textColor },
			formatter: params => {
				if (!params || !params.data) return `${params.name}<br/>暂无数据`;
				return `${params.name}<br/>客户数: ${params.data.value}`;
			}
		},
		visualMap: {
			min: 0,
			max: maxVal,
			left: 10,
			bottom: 20,
			text: ["高", "低"],
			textStyle: { color: theme.textColor },
			calculable: false,
			inRange: { color: theme.visualMapColors }
		},
		series: [
			{
				name: "省份客户数",
				type: "map",
				map: "china",
				roam: true,
				layoutCenter: ["50%", "50%"],
				layoutSize: "88%",
				label: {
					show: false, // 全国地图不显示省份名称
					color: theme.textColor,
					fontSize: 12
				},
				itemStyle: {
					areaColor: theme.mapAreaColor,
					borderColor: theme.mapBorderColor,
					borderWidth: 1
				},
				emphasis: {
					label: {
						show: true, // 鼠标悬停时显示名称
						color: theme.textColor,
						fontWeight: 'bold'
					},
					itemStyle: {
						areaColor: theme.visualMapColors[1],
						borderColor: theme.visualMapColors[2],
						borderWidth: 2
					}
				},
				data: provinceData,
				animation: true,
				animationDuration: withAnimation ? 900 : 600
			}
		],
		animationDurationUpdate: 600,
		animationEasingUpdate: "cubicOut"
	};

	chart.setOption(option, true);
	setupClickEvents("country");
}

// ---------- 切换省份 ----------
async function switchProvince(provinceAdcode, provinceName = '') {
	currentLevel.value = "province";
	currentProvince.value = { adcode: provinceAdcode, name: provinceName };
	currentCity.value = null;

	if (!chart) return;
	chart.clear();

	// 加载省份地图
	const provinceGeo = await loadGeoJSON(provinceAdcode, provinceAdcode);
	if (!provinceGeo) {
		console.error("Failed to load province geo:", provinceAdcode);
		return;
	}

	// 检查是否为直辖市
	const isMunicipalityArea = isMunicipality(provinceAdcode);

	// 获取数据
	let cityData;
	if (isMunicipalityArea) {
		// 直辖市：直接获取区县数据
		cityData = getMunicipalityDistrictData(provinceAdcode);
	} else {
		// 非直辖市：获取城市数据
		cityData = filterDataByAdcode(provinceAdcode, 'city');
	}

	const maxCity = safeMax(cityData);
	const theme = getCurrentTheme();

	// 填充地区名称
	if (provinceGeo.features) {
		const nameMap = {};
		provinceGeo.features.forEach(feature => {
			const props = feature.properties;
			if (props && props.adcode) {
				nameMap[props.adcode] = props.name;
			}
		});

		// 填充地区名称
		cityData.forEach(item => {
			item.name = nameMap[item.adcode] || item.adcode;
		});
	}

	// 设置省份名称（如果未提供）
	if (!provinceName && provinceGeo.features && provinceGeo.features[0]) {
		const props = provinceGeo.features[0].properties;
		currentProvince.value.name = props.name || provinceAdcode;
	}

	const option = {
		backgroundColor: theme.backgroundColor,
		animation: true,
		animationDuration: 700,
		animationEasing: "cubicOut",
		tooltip: {
			trigger: "item",
			backgroundColor: theme.buttonBg,
			borderColor: theme.buttonBorder,
			textStyle: { color: theme.textColor },
			formatter: params => {
				if (!params || !params.data) return `${params.name}<br/>暂无数据`;
				return `${params.name}<br/>客户数: ${params.data.value}`;
			}
		},
		visualMap: {
			min: 0,
			max: maxCity,
			left: 10,
			bottom: 20,
			text: ["高", "低"],
			textStyle: { color: theme.textColor },
			calculable: false,
			inRange: { color: theme.visualMapColors }
		},
		series: [
			{
				name: isMunicipalityArea ? "区县客户数" : "城市客户数",
				type: "map",
				map: provinceAdcode,
				roam: true,
				layoutCenter: ["50%", "50%"],
				layoutSize: "88%",
				label: {
					show: true, // 省级地图显示地区名称
					color: theme.textColor,
					fontSize: isMunicipalityArea ? 10 : 11
				},
				itemStyle: {
					areaColor: theme.mapAreaColor,
					borderColor: theme.mapBorderColor,
					borderWidth: 1
				},
				emphasis: {
					label: {
						show: true,
						color: theme.textColor,
						fontWeight: 'bold'
					},
					itemStyle: {
						areaColor: theme.visualMapColors[1],
						borderColor: theme.visualMapColors[2],
						borderWidth: 2
					}
				},
				data: cityData,
				animation: true,
				animationDuration: 800
			}
		],
		animationDurationUpdate: 600,
		animationEasingUpdate: "cubicOut"
	};

	chart.setOption(option, true);

	// 对于直辖市，不需要绑定点击事件（已经显示区县）
	// 对于非直辖市，绑定点击事件进入城市
	if (!isMunicipalityArea) {
		setupClickEvents("province");
	} else {
		chart.off("click");
	}
}

// ---------- 切换城市 ----------
async function switchCity(cityAdcode, cityName = '', provinceAdcode) {
	currentLevel.value = "city";
	currentCity.value = { adcode: cityAdcode, name: cityName };

	if (!chart) return;
	chart.clear();

	// 加载城市地图
	const cityGeo = await loadGeoJSON(cityAdcode, cityAdcode);
	if (!cityGeo) {
		console.error("Failed to load city geo:", cityAdcode);
		return;
	}

	// 获取区县数据
	const districtData = filterDataByAdcode(cityAdcode, 'district');
	const maxDistrict = safeMax(districtData);
	const theme = getCurrentTheme();

	// 填充区县名称
	if (cityGeo.features) {
		const nameMap = {};
		cityGeo.features.forEach(feature => {
			const props = feature.properties;
			if (props && props.adcode) {
				nameMap[props.adcode] = props.name;
			}
		});

		// 填充区县名称
		districtData.forEach(item => {
			item.name = nameMap[item.adcode] || item.adcode;
		});

		// 设置城市名称（如果未提供）
		if (!cityName && cityGeo.features[0]) {
			const props = cityGeo.features[0].properties;
			currentCity.value.name = props.name || cityAdcode;
		}
	}

	const option = {
		backgroundColor: theme.backgroundColor,
		animation: true,
		animationDuration: 700,
		animationEasing: "cubicOut",
		title: {
			text: `${currentProvince.value.name} - ${currentCity.value.name}`,
			left: "center",
			top: 10,
			textStyle: { color: theme.textColor, fontSize: 16 }
		},
		tooltip: {
			trigger: "item",
			backgroundColor: theme.buttonBg,
			borderColor: theme.buttonBorder,
			textStyle: { color: theme.textColor },
			formatter: params => {
				if (!params || !params.data) return `${params.name}<br/>暂无数据`;
				return `${params.name}<br/>客户数: ${params.data.value}`;
			}
		},
		visualMap: {
			min: 0,
			max: maxDistrict,
			left: 10,
			bottom: 20,
			text: ["高", "低"],
			textStyle: { color: theme.textColor },
			calculable: false,
			inRange: { color: theme.visualMapColors }
		},
		series: [
			{
				name: "区县客户数",
				type: "map",
				map: cityAdcode,
				roam: true,
				zoom: 1.2,
				layoutCenter: ["50%", "50%"],
				layoutSize: "95%",
				label: {
					show: true, // 城市地图显示区县名称
					color: theme.textColor,
					fontSize: 10
				},
				itemStyle: {
					areaColor: theme.mapAreaColor,
					borderColor: theme.mapBorderColor,
					borderWidth: 1
				},
				emphasis: {
					label: {
						show: true,
						color: theme.textColor,
						fontWeight: 'bold'
					},
					itemStyle: {
						areaColor: theme.visualMapColors[1],
						borderColor: theme.visualMapColors[2],
						borderWidth: 2
					}
				},
				data: districtData,
				animation: true,
				animationDuration: 800
			}
		],
		animationDurationUpdate: 600,
		animationEasingUpdate: "cubicOut"
	};

	chart.setOption(option, true);

	// 城市级别不再绑定点击事件（不继续向下钻取）
	chart.off("click");
}
</script>

<style scoped>
.back-btn {
	position: absolute;
	left: 18px;
	top: 18px;
	z-index: 10;
	background: v-bind('themeConfig[currentTheme].buttonBg');
	border: 1px solid v-bind('themeConfig[currentTheme].buttonBorder');
	color: v-bind('themeConfig[currentTheme].buttonText');
	padding: 8px 12px;
	border-radius: 6px;
	cursor: pointer;
	box-shadow: 0 2px 8px rgba(0,0,0,0.15);
	font-size: 14px;
	font-weight: 500;
	transition: all 0.3s ease;
}

.back-btn:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.theme-btn {
	background: v-bind('themeConfig[currentTheme].buttonBg');
	border: 1px solid v-bind('themeConfig[currentTheme].buttonBorder');
	color: v-bind('themeConfig[currentTheme].buttonText');
	padding: 8px 12px;
	border-radius: 6px;
	cursor: pointer;
	box-shadow: 0 2px 8px rgba(0,0,0,0.15);
	font-size: 14px;
	font-weight: 500;
	transition: all 0.3s ease;
}

.theme-btn:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
</style>
