export default {
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
