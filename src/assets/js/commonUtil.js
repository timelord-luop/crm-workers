import {LocalStorage} from "@/assets/js/storageUtil.js";

export default {
	// 滚动到错误提示
	scrollToFirstError: () => {
		const errorElement = document.querySelector('.is-error');
		if (errorElement) {
			errorElement.scrollIntoView({
				behavior: 'smooth',
				block: 'center'
			});
		}
	},
	// 检查数组对象某个属性值是否有重复
	hasDuplicate: (arr, prop) => {
		return  Array.isArray(arr) && arr.length > 0
			? new Set(arr.map(item => item[prop])).size !== arr.length
			: false;
	},
	// 获取行政区划级联
	getAreaOptions: async (code) => {
		const localAreaData = LocalStorage.get('area_code_list');
		const defObj = {value: '0', label: '全国'};
		if (!localAreaData) {
			const response = await fetch('https://unpkg.com/china-location@2.1.0/dist/location.json');
			const areaData = await response.json();
			const resAreaData = Object.values(areaData).map(province => ({
				value: province.code,
				label: province.name,
				children: Object.values(province.cities).map(city => ({
					value: city.code,
					label: city.name,
					children: Object.entries(city.districts).map(([code, name]) => ({
						value: code,
						label: name
					}))
				}))
			}));
			LocalStorage.put('area_code_list', resAreaData);
			if (code === 0) {
				resAreaData.unshift(defObj)
			}
			return resAreaData;
		} else {
			if (code === 0) {
				localAreaData.unshift(defObj)
			}
			return localAreaData;
		}
	},
	// 获取部门人员树状结构
	arrayToChartTree: (data, rootPid = '0') => {
		// 创建映射表和结果数组
		const map = new Map();
		const result = [];
		// 第一遍：将所有节点存入 Map，并初始化 children 数组
		data.forEach(item => {
			map.set(item.id, { ...item, children: [] });
		});
		// 第二遍：构建父子关系
		data.forEach(item => {
			const currentNode = map.get(item.id);
			const parentNode = map.get(item.pid);

			if (parentNode) {
				// 如果有父节点，添加到父节点的 children 中
				parentNode.children.push(currentNode);
			} else if (item.pid === rootPid) {
				// 如果没有父节点且 pid 是根节点 ID，添加到结果中
				result.push(currentNode);
			}
		});
		loopData(result);
		function loopData(result) {
			result.forEach(item => {
				if (item.memberList?.length) {
					item.children = item.memberList.concat(item.children);
				}
				if (!item.children?.length && !!item.pid) {
					item.disabled = true;
				}
				if (item.children) loopData(item.children)
			})
		}
		return result;
	},
	// 时间戳转时间
    convertTimestamp: (timestamp) => {
        let fmt = 'YYYY-mm-dd HH:MM:SS';
        let date = !timestamp ? new Date() : new Date(Number(timestamp));
        let ret;
        const opt = {
            "Y+": date.getFullYear().toString(),        // 年
            "m+": (date.getMonth() + 1).toString(),     // 月
            "d+": date.getDate().toString(),            // 日
            "H+": date.getHours().toString(),           // 时
            "M+": date.getMinutes().toString(),         // 分
            "S+": date.getSeconds().toString()          // 秒
        };
        for (let k in opt) {
            ret = new RegExp("(" + k + ")").exec(fmt);
            if (ret) {
                fmt = fmt.replace(ret[1], (ret[1].length === 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
            }
        }
        return fmt;
    },
	deepClone(obj) {
		// 判断 obj 的类型
		if (typeof obj !== "object" || obj == null) {
			return obj;
		}
		// 根据 obj 的类型创建新的对象或数组
		let result;
		if (obj instanceof Array) {
			result = [];
		} else {
			result = {};
		}
		// 遍历 obj，并将其属性递归地赋值给新对象或数组
		for (let key in obj) {
			// 判断 key 是否是 obj 的自有属性
			// eslint-disable-next-line no-prototype-builtins
			if (obj.hasOwnProperty(key)) {
				result[key] = this.deepClone(obj[key]);
			}
		}
		return result;
	}
}
