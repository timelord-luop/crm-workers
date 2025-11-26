import axios from 'axios'
import { ElMessage } from 'element-plus'
import {TokenStorage} from '@/assets/js/storageUtil.js'


function _showRequestErrMsg(res) {
	const errMsg = res.data?.msg || '网络错误';
	ElMessage({
		showClose: true,
		message: errMsg,
		type: 'error'
	})
}

function _getAuthHeaders() {
	const accessToken = TokenStorage.getAccessToken();
	if (!accessToken) return null;
	return {
		Authorization: accessToken
	};
}

export default {
	async request(API, params) {
		return await new Promise((resolve, reject) => {
			this.getRequest(API, params).then(res => {
				resolve(res.data);
			}).catch(err => {
				console.log(err)
				if (!API.NO_MSG) _showRequestErrMsg(err.response);
				reject(err.response?.data);
			})
		});
	},
	async getRequest(API, params) {
		const requestObj = {
			url: API.URL,
			method: API.METHOD,
			headers: {},
			data: JSON.stringify(params)
		};
		if (API.IS_AUTH) {
			requestObj.headers = _getAuthHeaders();
			if (!requestObj.headers) {
				return new Error('未登录或登录过期');
			}
		}
		requestObj.headers['Content-Type'] = 'application/json';
		return axios(requestObj);
	}
}
