import axios from 'axios'
import { ElMessage } from 'element-plus'
import {TokenStorage} from '@/assets/js/storageUtil.js'

function _showRequestErrMsg(res) {
	let errMsg = '';
	if (!res) {
		errMsg = '网络错误';
	} else {
		errMsg = res.data?.msg || '网络错误';
	}
	ElMessage({
		showClose: true,
		message: errMsg,
		type: 'error'
	})
	setTimeout(() => {
		if (res.status === 401) window.location.href = '/login'
	}, 1800)
}

function _getAuthHeaders() {
	const accessToken = TokenStorage.getAccessToken();
	if (!accessToken) return null;
	return {
		Authorization: accessToken
	};
}

export default {
	request(API, params) {
		return new Promise((resolve, reject) => {
			this.getRequest(API, params).then(res => {
				resolve(res.data);
			}).catch(err => {
				if (!API.NO_MSG) _showRequestErrMsg(err.response);
				reject(err.response?.data);
			})
		});
	},
	getRequest(API, params) {
		return new Promise((resolve, reject) => {
			const requestObj = {
				url: API.URL,
				method: API.METHOD,
				headers: {},
				data: params ? JSON.stringify(params) : {}
			};
			if (API.IS_AUTH) {
				requestObj.headers = _getAuthHeaders();
				if (!requestObj.headers) {
					reject({response: {status: 401, data: {msg: '未登录或登录过期!'}}})
				}
			}
			requestObj.headers['Content-Type'] = 'application/json';

			resolve(axios(requestObj));
		})
	}
}
