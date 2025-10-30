<template lang="pug">
	div(@click="toPage") BOM页面
</template>
<script setup>
import { onMounted } from 'vue'
import {useRoute} from 'vue-router'
import {TokenStorage} from "@/assets/js/storageUtil.js";

import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
	saveAccessAuth();
	console.log(TokenStorage.getAccessToken())
	console.log(TokenStorage.getAccessKey())
})

const saveAccessAuth = () => {
	const route = useRoute()
	let token = route.query.token || '';
	let key = route.query.key || '';
	TokenStorage.saveAccessToken(token);
	TokenStorage.saveAccessKey(key);
}

const toPage = () => {
	router.push('/users')
}
</script>

<style scoped lang="scss">

</style>
