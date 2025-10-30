<template lang="pug">
	el-button(type="primary" @click="toPage") 跳转
</template>
<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router';

const router = useRouter();

const toPage = () => {
	router.push('/bom-update')
}

</script>

<style scoped lang="scss">

</style>
