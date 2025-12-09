<template>
	<div style="width:100%;height:100%;position:relative;">
		<!-- 返回按钮（省级时显示） -->
		<button
			v-if="currentLevel === 'province'"
			@click="handleBack"
			class="back-btn"
			title="返回全国"
		>
			← 返回全国
		</button>

		<div ref="chartRef" style="width:100%;height:100%;"></div>
	</div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";

const chartRef = ref(null);
let chart = null;
let currentLevel = ref("country"); // reactive flag for template

// ---------- mock 数据 ----------
const provinceData = [
	{ name: "广东省", value: 320 },
	{ name: "浙江省", value: 220 },
	{ name: "江苏省", value: 180 },
	{ name: "山东省", value: 160 },
	{ name: "河南省", value: 150 }
];

const cityDataMap = {
	"广东省": [
		{ name: "广州市", value: 80 },
		{ name: "深圳市", value: 130 },
		{ name: "佛山市", value: 60 },
		{ name: "东莞市", value: 50 },
		{ name: "中山市", value: 20 },
		{ name: "珠海市", value: 30 }
	],
	"浙江省": [
		{ name: "杭州市", value: 90 },
		{ name: "宁波市", value: 60 },
		{ name: "温州市", value: 40 }
	]
};

// ---------- 加载 geojson 并 注册 map ----------
async function loadGeoJSON(adcode, mapName) {
	try {
		const url = `https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`;
		const res = await fetch(url);
		if (!res.ok) throw new Error("GeoJSON load failed");
		const data = await res.json();
		// 注册 map（如果重复注册，echarts 会覆盖）
		echarts.registerMap(mapName, data);
		return data;
	} catch (e) {
		console.warn("loadGeoJSON error:", e);
		return null;
	}
}

// ---------- 工具：计算 visualMap 的 max（防止为 0 或 NaN） ----------
function safeMax(arr) {
	if (!Array.isArray(arr) || arr.length === 0) return 1;
	const m = Math.max(...arr.map(i => (i && typeof i.value === "number" ? i.value : 0)));
	return (isFinite(m) && m > 0) ? m : 1;
}

// ---------- init ----------
onMounted(async () => {
	chart = echarts.init(chartRef.value, null, { renderer: "canvas" });

	// 载入全国 geojson 并渲染
	const chinaGeo = await loadGeoJSON("100000", "china");
	// render only once
	renderCountryMap();
	window.addEventListener("resize", () => {
		chart && chart.resize();
	});

	// 统一事件处理（先 off 避免重复）
	chart.off("click");
	chart.on("click", (params) => {
		// 只在 country 时响应点击进入省
		if (currentLevel.value === "country" && params && params.name && chinaGeo) {
			// 找到被点击省对应 feature 的 adcode（若有）
			const f = chinaGeo.features.find(feat => feat.properties && feat.properties.name === params.name);
			const adcode = f && f.properties && (f.properties.adcode || (f.properties && f.properties.adcode_ || undefined));
			if (adcode) {
				switchProvince(params.name, String(adcode));
			} else {
				// 仍尝试切换（有些 geojson 可能用其他字段）
				switchProvince(params.name, undefined);
			}
		}
	});

	// 监听缩放和平移改为 map roam 的内部行为（不依赖 geo[0]）
	chart.off("georoam");
	chart.on("georoam", () => {
		// 当 user 放大很多时可自动切换到当前视窗中心所在省（可选）
		// 这里我们不自动切换以免误触，保持点击切换为主
	});
});

onBeforeUnmount(() => {
	if (chart) {
		chart.dispose();
		chart = null;
	}
});

// ---------- 返回全国 ----------
function handleBack() {
	renderCountryMap(true);
}

// ---------- 渲染全国（只有 series.map） ----------
function renderCountryMap(withAnimation = false) {
	currentLevel.value = "country";
	if (!chart) return;

	// 保证唯一地图：clear 并 off 所有 series 点击后再绑定
	chart.clear();
	chart.off("click");

	const maxVal = safeMax(provinceData);

	const option = {
		animation: true,
		animationDuration: withAnimation ? 800 : 500,
		animationEasing: "cubicOut",
		tooltip: {
			trigger: "item",
			formatter: params => {
				if (!params || params.value == null) return `${params.name}<br/>暂无数据`;
				return `${params.name}<br/>客户数: ${params.value}`;
			}
		},
		visualMap: {
			min: 0,
			max: maxVal,
			left: 10,
			bottom: 20,
			text: ["高", "低"],
			calculable: false,
			inRange: {
				color: ["#E3F2FD", "#64B5F6", "#0D47A1"] // 明确的三色范围（不会为 undefined）
			}
		},
		series: [
			{
				name: "省份客户数",
				type: "map",
				map: "china",
				roam: true,
				layoutCenter: ["50%", "50%"],
				layoutSize: "88%",
				label: { show: false },
				animation: true,
				animationDuration: withAnimation ? 900 : 600,
				data: provinceData
			}
		],
		// 控制更新动画
		animationDurationUpdate: 600,
		animationEasingUpdate: "cubicOut"
	};

	chart.setOption(option, true);

	// 恢复点击事件：点击省进入省级（再次绑定）
	chart.off("click");
	chart.on("click", (params) => {
		if (currentLevel.value === "country" && params && params.name) {
			// 提取 adcode 的逻辑：尝试从已注册的 china map 中查 feature
			const map = echarts.getMap("china");
			const feat = map && map.geoJson && map.geoJson.features && map.geoJson.features.find(f => f.properties && f.properties.name === params.name);
			const adcode = feat && (feat.properties.adcode || feat.properties.adcode_ || feat.properties.adcode_int || feat.properties.adcode_string);
			if (adcode) {
				switchProvince(params.name, String(adcode));
			} else {
				// 若没有 adcode，也尝试用名字去切换（loadGeoJSON 需要 adcode，这里直接尝试用 known mapping）
				switchProvince(params.name, undefined);
			}
		}
	});
}

// ---------- 切换省级（加载省的 geojson，绘制市数据 + 气泡 + top5） ----------
async function switchProvince(provinceName, adcode) {
	currentLevel.value = "province";
	if (!chart) return;

	chart.clear();
	chart.off("click");

	// load province geojson: 如果没有 adcode，则尝试从已注册 china map 查找 feature.properties.adcode
	let mapAdcode = adcode;
	if (!mapAdcode) {
		const chinaMap = echarts.getMap("china");
		const feat = chinaMap && chinaMap.geoJson && chinaMap.geoJson.features && chinaMap.geoJson.features.find(f => f.properties && f.properties.name === provinceName);
		mapAdcode = feat && (feat.properties.adcode || feat.properties.adcode_ || feat.properties.adcode_int || feat.properties.adcode_string);
	}

	// 如果依然没有 adcode，则直接渲染一个空省地图，用全国 geo 中的该 feature 作 map 数据
	let provinceGeo = null;
	if (mapAdcode) {
		provinceGeo = await loadGeoJSON(mapAdcode, provinceName);
	} else {
		// fallback: if no adcode, try to extract feature from registered china geo and register a new map with single feature
		const chinaMap = echarts.getMap("china");
		if (chinaMap && chinaMap.geoJson && chinaMap.geoJson.features) {
			const feat = chinaMap.geoJson.features.find(f => f.properties && f.properties.name === provinceName);
			if (feat) {
				// 构造一个临时 geoJSON
				const single = {
					type: "FeatureCollection",
					features: [feat]
				};
				echarts.registerMap(provinceName, single);
				provinceGeo = single;
			}
		}
	}

	// 取得市级数据（如果没有数据，设为空数组）
	const cityData = Array.isArray(cityDataMap[provinceName]) ? cityDataMap[provinceName] : [];

	// safe max
	const maxCity = safeMax(cityData);

	// scatter 气泡数据（需要经纬度）：
	// 我们尝试从 provinceGeo 中读取每个 city 对应的 cp 或 properties.centroid 作经纬度（许多 GeoJSON 含有 properties.centroid / cp）
	// 如果无法获取到某个城市坐标，则该城市不会出现气泡（避免异常）
	const scatterData = [];
	if (provinceGeo && Array.isArray(provinceGeo.features)) {
		// build a map: name -> centroid (尝试多种字段)
		const centroidMap = {};
		for (const f of provinceGeo.features) {
			const props = f.properties || {};
			const name = props.name || (props && props.NAME || "");
			// common centroid fields: cp 或 centroid
			const cp = props.cp || props.centroid || props.center || props._centroid || null;
			if (cp && Array.isArray(cp) && cp.length >= 2) centroidMap[name] = cp;
			// else try bbox center
			if (!centroidMap[name] && f.geometry && f.geometry.coordinates) {
				// skipping complex centroid calc to keep light — we prefer props.cp if present
			}
		}

		for (const city of cityData) {
			// 直接取 city.name 在 centroidMap 中匹配（有时 city 名称与 geojson 的名称不完全一致）
			const coord = centroidMap[city.name] || centroidMap[city.name.replace(/市$/, "")] || null;
			if (coord) {
				scatterData.push({
					name: city.name,
					value: [coord[0], coord[1], city.value] // [lng, lat, value]
				});
			}
		}
	}

	// 取 top5（按 value 降序）
	const top5 = [...cityData].sort((a, b) => b.value - a.value).slice(0, 5);
	const top5Scatter = [];
	for (const t of top5) {
		// try to find coord
		let coord = null;
		if (provinceGeo && provinceGeo.features) {
			for (const f of provinceGeo.features) {
				const pn = (f.properties && f.properties.name) || "";
				if (pn && (pn === t.name || pn === t.name.replace(/市$/, ""))) {
					const cp = f.properties && (f.properties.cp || f.properties.center || f.properties.centroid);
					if (cp && Array.isArray(cp)) {
						coord = cp;
						break;
					}
				}
			}
		}
		if (coord) top5Scatter.push({ name: t.name, value: [coord[0], coord[1], t.value] });
	}

	// 方案：当 cityData 为空时，仍要保证 visualMap 的 max 有值，避免 undefined color stops
	const visualMax = maxCity || 1;
	const hasCity = cityData && cityData.length > 0;

	const option = {
		animation: true,
		animationDuration: 700,
		animationEasing: "cubicOut",
		tooltip: {
			trigger: "item",
			formatter: params => {
				if (!params) return "";
				if (params.seriesType === "map") {
					if (params.data && params.data.value != null) return `${params.name}<br/>客户数: ${params.data.value}`;
					return `${params.name}<br/>暂无数据`;
				} else if (params.seriesType === "scatter") {
					const v = params.data && params.data.value ? params.data.value[2] : "-";
					return `${params.name}<br/>客户数: ${v}`;
				}
				return params.name;
			}
		},
		visualMap: {
			min: 0,
			max: visualMax,
			left: 10,
			bottom: 20,
			text: ["高", "低"],
			calculable: false,
			inRange: {
				// 明确颜色数组，不会出现 undefined
				color: ["#E8F5E9", "#66BB6A", "#1B5E20"]
			}
		},
		series: [
			// map series（主地图）
			{
				name: "城市客户数",
				type: "map",
				map: provinceName,
				roam: true,
				layoutCenter: ["50%", "50%"],
				layoutSize: "88%",
				label: { show: false },
				data: cityData,
				animation: true,
				animationDuration: 800
			},
			// scatter 气泡（所有城市）
			{
				name: "城市气泡",
				type: "scatter",
				coordinateSystem: "geo",
				data: scatterData,
				symbol: "circle",
				// 根据 value 大小调整气泡尺寸（函数）
				symbolSize: val => {
					if (!val || val.length < 3) return 0;
					const v = val[2];
					// map value -> size range [6, 28]
					const min = 6, max = 28;
					const scale = Math.sqrt(v / visualMax);
					return Math.max(min, Math.min(max, Math.round(scale * max)));
				},
				label: {
					show: false
				},
				emphasis: {
					label: { show: true, formatter: p => `${p.data.name}: ${p.data.value[2]}` }
				}
			},
			// top5 标注（更醒目）
			{
				name: "Top5",
				type: "scatter",
				coordinateSystem: "geo",
				data: top5Scatter,
				symbol: "pin",
				symbolSize: val => (val && val.length >= 3 ? Math.max(20, Math.min(40, Math.round((val[2] / visualMax) * 40))) : 20),
				label: {
					show: true,
					formatter: (p) => `${p.data.name}\n${p.data.value[2]}`,
					position: "bottom",
					color: "#333",
					fontWeight: "600"
				},
				itemStyle: {
					color: "#FF5722"
				}
			}
		],
		animationDurationUpdate: 600,
		animationEasingUpdate: "cubicOut"
	};

	// 若没有 city 数据，则给 map series 一个空数组；气泡也为空，visualMap.max 为 1，tooltip 会显示暂无数据
	chart.setOption(option, true);

	// 省级时，绑定返回逻辑（点击 map 的空白处不再深入）
	chart.off("click");
	chart.on("click", (params) => {
		// 在省级点击 city 可触发气泡或 city tooltip；我们不做进一步层级切换
	});
}
</script>

<style scoped>
.back-btn {
	position: absolute;
	left: 18px;
	top: 18px;
	z-index: 10;
	background: rgba(255,255,255,0.9);
	border: 1px solid #ddd;
	padding: 6px 10px;
	border-radius: 6px;
	cursor: pointer;
	box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.back-btn:hover {
	background: #fff;
}
</style>
