<script setup>
import {ref} from 'vue'
import {User, Key, Position} from '@element-plus/icons-vue'
import {useRouter} from 'vue-router';

const router = useRouter();

const username = ref('')
const password = ref('')
const isRemember = ref(true)
const errMsg = ref('');

const login = () => {
	if (username.value === 'admin' && password.value === 'admin') {
		errMsg.value = '';
		// 登录成功，跳转到首页
		router.push('/')
	} else {
		errMsg.value = '账号或密码错误';
		setTimeout(() => {
			errMsg.value = '';
		}, 3000)
	}
}

</script>
<template lang="pug">
	.body
		.login-panel
			.logo-blo
				.title 羽翼CRM管理系统
			.form-panel
				el-form(@submit.native.prevent)
					.title 用户登录
					el-input(size="large" placeholder="账号" v-model="username" clearable, :prefix-icon="User")
					el-input(size="large" placeholder="密码" v-model="password" clearable type="password" show-password, :prefix-icon="Key")
					._check
						el-checkbox(v-model="isRemember" label="记住密码" size="large")
						el-tooltip(content="联系作者协助修改密码" placement="top")
							el-link(underline="never" type="info") 忘记密码？
					el-button._btn(type="primary", size="large", :disabled="!username || !password", :icon="Position", @click="login()", native-type="submit") 登录
					el-alert(:title="errMsg" v-if="errMsg" type="error" show-icon :closable="false")

</template>

<style scoped lang="scss">
.body {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	min-height: 100vh;
	overflow: hidden;
	display: flex;
	align-items: center;

	.login-panel {
		width: 720px;
		height: 450px;
		margin: 0 auto;
		background-color: #fff;
		border-radius: 10px;
		box-shadow: 0 0 10px rgba(0, 0, 0, .15);
		-moz-box-shadow: 0 0 10px rgba(0, 0, 0, .15);
		-webkit-box-shadow: 0 0 10px rgba(0, 0, 0, .15);
		overflow: hidden;
		display: flex;

		.logo-blo {
			width: 300px;
			height: 100%;
			background-color: #ECF5FF;
			background-image: url('@/assets/img/login_bg.svg');
			background-size: contain;
			background-position: center bottom;
			overflow: hidden;

			.title {
				text-align: center;
				font-size: 20px;
				font-weight: bold;
				color: #444444;
				margin-top: 80px;
			}
		}

		.form-panel {
			flex: 1;

			.el-form {
				width: 80%;
				margin: 40px auto;

				.title {
					color: #666666;
					font-size: 16px;
					margin-bottom: 20px;
				}

				.el-input {
					margin: 10px 0;
				}

				._check {
					display: flex;
					justify-content: space-between;
					margin: 10px 0 5px;
				}
			}

			._btn {
				width: 100%;
			}

			.el-alert {
				margin-top: 40px;
			}
		}
	}
}
</style>
