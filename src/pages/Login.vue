<script setup>
import {ref} from 'vue'
import {User, Key, Position} from '@element-plus/icons-vue'

const username = ref('')
const password = ref('')
const isRemember = ref(true)

</script>
<template lang="pug">
	.body
		.login-panel
			.logo-blo
				.title CRM客户管理系统
			.form-panel
				el-form
					el-input(size="large" placeholder="账号" v-model="username" :prefix-icon="User")
					el-input(size="large" placeholder="密码" v-model="password" type="password" show-password, :prefix-icon="Key")
					._check
						el-checkbox(v-model="isRemember" label="记住密码" size="large")
						el-tooltip(content="联系作者协助查看密码" placement="top")
							el-link(underline="never") 忘记密码？
					el-button(type="primary", :icon="Position") 登录

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
		height: 480px;
		margin: 0 auto;
		background-color: #fff;
		border-radius: 10px;
		box-shadow: 0 0 10px rgba(0, 0, 0, .15);
		-moz-box-shadow: 0 0 10px rgba(0,0,0,.15);
		-webkit-box-shadow: 0 0 10px rgba(0, 0, 0, .15);
		overflow: hidden;
		display: flex;
		.logo-blo {
			width: 300px;
			height: 100%;
			background-color: #ECF5FF;
			background-image: url('@/assets/img/login_bg.svg');
			background-size: cover;
			overflow: hidden;
			.title {
				text-align: center;
				font-size: 20px;
				font-weight: bold;
				color: #444444;
				margin-top: 80px;
			}
		}
	}
}
</style>
